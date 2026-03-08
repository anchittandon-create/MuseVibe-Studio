import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Music, AlertCircle, Phone, User as UserIcon, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError('Please enter both name and mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formattedMobile = mobile.startsWith('+') ? mobile : `+${mobile}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please check the number format (e.g., +1234567890).');
      // Reset recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user profile exists, if not create it
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          userId: user.uid,
          name: name,
          mobileNumber: user.phoneNumber,
          createdAt: Date.now()
        });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

  if (authLoading) {
    return <div className="flex h-screen bg-background-dark items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-screen bg-background-dark text-slate-100 font-display items-center justify-center p-4">
      <div className="bg-surface-dark border border-border-dark rounded-xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gemini Studio</h2>
          <p className="text-slate-400 mt-2">Sign in to start creating AI-generated music.</p>
        </div>
        
        {!isConfigured ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
              <AlertCircle size={18} />
              <span>Firebase Not Configured</span>
            </div>
            <p className="text-sm text-slate-300">
              Please add your Firebase configuration to the environment variables to enable login.
            </p>
          </div>
        ) : (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-background-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Include country code (e.g., +1)</p>
                </div>
                
                <div id="recaptcha-container"></div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-400">OTP sent to <span className="text-white font-medium">{mobile}</span></p>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Change Number
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Enter OTP</label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-background-dark border border-border-dark rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors tracking-widest text-center text-lg"
                      placeholder="123456"
                      required
                      maxLength={6}
                    />
                  </div>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Verify & Login'
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
