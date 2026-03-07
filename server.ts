import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import * as admin from 'firebase-admin';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
app.use(express.json());

// Initialize Firebase Admin lazily
let firebaseDb: admin.firestore.Firestore | null = null;
let firebaseStorage: admin.storage.Storage | null = null;

function getFirebase() {
  if (!firebaseDb) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing. Using local fallback for development.');
      return null;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
        });
      }
      firebaseDb = admin.firestore();
      firebaseStorage = admin.storage();
    } catch (e) {
      console.error('Failed to initialize Firebase Admin', e);
      return null;
    }
  }
  return { db: firebaseDb, storage: firebaseStorage };
}

// Local fallback storage
const localDbPath = path.join(__dirname, 'local_db.json');
const localAudioDir = path.join(__dirname, 'public', 'audio');
const localTempDir = path.join(__dirname, 'tempSegments');

if (!fs.existsSync(localAudioDir)) fs.mkdirSync(localAudioDir, { recursive: true });
if (!fs.existsSync(localTempDir)) fs.mkdirSync(localTempDir, { recursive: true });

function getLocalDb() {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ tracks: [] }));
  }
  return JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
}

function saveLocalDb(data: any) {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
}

function getAI() {
  console.log('Available env keys:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')));
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('API key not valid. Please pass a valid API key.');
  }
  return new GoogleGenAI({ apiKey });
}

// API Routes
app.get('/api/env', (req, res) => {
  res.json({ 
    keys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')),
    val: process.env.GEMINI_API_KEY
  });
});

app.post('/api/tracks', async (req, res) => {
  try {
    const trackId = uuidv4();
    const trackData = {
      id: trackId,
      ...req.body,
      durationGenerated: 0,
      segmentsGenerated: 0,
      status: 'generating',
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      audioMasterUrl: `/audio/${trackId}_master.wav`,
    };

    const fb = getFirebase();
    if (fb) {
      await fb.db.collection('tracks').doc(trackId).set(trackData);
    } else {
      const db = getLocalDb();
      db.tracks.push(trackData);
      saveLocalDb(db);
    }

    // Start generation pipeline in background
    generateTrackPipeline(trackId, trackData).catch(console.error);

    res.json(trackData);
  } catch (error: any) {
    console.error('Create track error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tracks', async (req, res) => {
  try {
    const fb = getFirebase();
    if (fb) {
      const snapshot = await fb.db.collection('tracks').orderBy('createdAt', 'desc').get();
      const tracks = snapshot.docs.map(doc => doc.data());
      res.json(tracks);
    } else {
      const db = getLocalDb();
      res.json(db.tracks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  } catch (error: any) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tracks/:id', async (req, res) => {
  try {
    const fb = getFirebase();
    if (fb) {
      const doc = await fb.db.collection('tracks').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found' });
      res.json(doc.data());
    } else {
      const db = getLocalDb();
      const track = db.tracks.find((t: any) => t.id === req.params.id);
      if (!track) return res.status(404).json({ error: 'Not found' });
      res.json(track);
    }
  } catch (error: any) {
    console.error('Get track error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve local audio files
app.use('/audio', express.static(localAudioDir));

// Pipeline
async function updateTrackStatus(trackId: string, updates: any) {
  const fb = getFirebase();
  if (fb) {
    await fb.db.collection('tracks').doc(trackId).update(updates);
  } else {
    const db = getLocalDb();
    const index = db.tracks.findIndex((t: any) => t.id === trackId);
    if (index !== -1) {
      db.tracks[index] = { ...db.tracks[index], ...updates };
      saveLocalDb(db);
    }
  }
}

async function generateTrackPipeline(trackId: string, trackData: any) {
  const ai = getAI();
  const durationRequested = parseInt(trackData.durationRequested) || 60;
  const segmentsNeeded = Math.ceil(durationRequested / 30);
  const masterWavPath = path.join(localAudioDir, `${trackId}_master.wav`);
  const masterMp3Path = path.join(localAudioDir, `${trackId}_master.mp3`);

  let currentSegment = 0;
  let durationGenerated = 0;
  let previousSegmentMetadata: any = null;

  for (currentSegment = 0; currentSegment < segmentsNeeded; currentSegment++) {
    const segmentPath = path.join(localTempDir, `${trackId}_segment_${currentSegment}.wav`);
    
    // Call Gemini to generate audio segment
    const structureRole = currentSegment === 0 ? 'intro' : currentSegment === segmentsNeeded - 1 ? 'outro' : 'body';
    const prompt = `original prompt: ${trackData.prompt}
genres: ${trackData.genres?.join(', ')}
intent object: ${JSON.stringify({ moods: trackData.moods, tempo: trackData.tempo })}
structure plan role for this segment: ${structureRole}
previous segment metadata: ${JSON.stringify(previousSegmentMetadata)}

Instruct: continue composition, maintain tempo, maintain key, maintain rhythm continuity, maintain instrument continuity.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        fs.writeFileSync(segmentPath, Buffer.from(base64Audio, 'base64'));
      } else {
        throw new Error('No audio data received from Gemini');
      }

      // Stitching
      if (currentSegment === 0) {
        fs.copyFileSync(segmentPath, masterWavPath);
      } else {
        const tempMaster = path.join(localTempDir, `${trackId}_temp_master.wav`);
        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(masterWavPath)
            .input(segmentPath)
            .complexFilter([
              '[0:a][1:a]acrossfade=d=0.1[a]'
            ])
            .map('[a]')
            .save(tempMaster)
            .on('end', resolve)
            .on('error', reject);
        });
        fs.copyFileSync(tempMaster, masterWavPath);
        fs.unlinkSync(tempMaster);
      }

      durationGenerated += 30;
      const progressPercentage = Math.min(100, Math.round((durationGenerated / durationRequested) * 100));

      await updateTrackStatus(trackId, {
        durationGenerated,
        segmentsGenerated: currentSegment + 1,
        progressPercentage
      });

      // Extract metadata for next segment
      if (currentSegment < segmentsNeeded - 1) {
        try {
          const audioBytes = fs.readFileSync(segmentPath).toString('base64');
          const metadataResponse = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: 'audio/wav',
                      data: audioBytes
                    }
                  },
                  {
                    text: 'Analyze this audio segment and extract the following metadata: ending tempo, ending key, ending harmonic structure. Return as JSON.'
                  }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json'
            }
          });
          previousSegmentMetadata = JSON.parse(metadataResponse.text || '{}');
        } catch (metaErr) {
          console.error('Failed to extract metadata:', metaErr);
          previousSegmentMetadata = { error: 'Failed to extract' };
        }
      }

    } catch (error) {
      console.error(`Error generating segment ${currentSegment}:`, error);
      await updateTrackStatus(trackId, { status: 'error' });
      return;
    }
  }

  // Final Trim if needed
  if (durationGenerated > durationRequested) {
    const tempTrimmed = path.join(localTempDir, `${trackId}_trimmed.wav`);
    await new Promise((resolve, reject) => {
      ffmpeg(masterWavPath)
        .setDuration(durationRequested)
        .save(tempTrimmed)
        .on('end', resolve)
        .on('error', reject);
    });
    fs.copyFileSync(tempTrimmed, masterWavPath);
    fs.unlinkSync(tempTrimmed);
  }

  // Post Processing: Mastering Pipeline
  const masteredWavPath = path.join(localTempDir, `${trackId}_mastered.wav`);
  await new Promise((resolve, reject) => {
    ffmpeg(masterWavPath)
      .audioFilters([
        'loudnorm',
        'acompressor',
        'equalizer=f=1000:width_type=h:width=200:g=2',
        'afade=t=in:ss=0:d=1',
        `afade=t=out:st=${durationRequested - 1}:d=1`
      ])
      .save(masteredWavPath)
      .on('end', resolve)
      .on('error', reject);
  });
  fs.copyFileSync(masteredWavPath, masterWavPath);
  fs.unlinkSync(masteredWavPath);

  // Convert to MP3
  await new Promise((resolve, reject) => {
    ffmpeg(masterWavPath)
      .toFormat('mp3')
      .save(masterMp3Path)
      .on('end', resolve)
      .on('error', reject);
  });

  // Upload to Firebase Storage if configured
  const fb = getFirebase();
  let finalAudioUrl = `/audio/${trackId}_master.mp3`;
  
  if (fb && fb.storage) {
    try {
      const bucket = fb.storage.bucket();
      await bucket.upload(masterMp3Path, {
        destination: `audio/${trackId}_master.mp3`,
        metadata: { contentType: 'audio/mpeg' }
      });
      const file = bucket.file(`audio/${trackId}_master.mp3`);
      await file.makePublic();
      finalAudioUrl = file.publicUrl();
    } catch (e) {
      console.error('Failed to upload to Firebase Storage', e);
    }
  }

  await updateTrackStatus(trackId, {
    status: 'completed',
    progressPercentage: 100,
    audioMasterUrl: finalAudioUrl
  });
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
