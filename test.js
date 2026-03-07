fetch('http://localhost:3000/api/suggest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fieldName: 'trackName', currentValue: '', fullContext: {} })
}).then(res => res.text()).then(console.log).catch(console.error);
