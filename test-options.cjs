const https = require('https');

const req = https.request({
  method: 'OPTIONS',
  hostname: 'api.obrabase.com',
  path: '/api/works/public/works',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'x-domain'
  }
}, res => {
  console.log('OPTIONS status:', res.statusCode);
  console.log('OPTIONS headers:', res.headers);
});
req.on('error', console.error);
req.end();
