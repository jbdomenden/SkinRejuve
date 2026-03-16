const http = require('http');
const { URL } = require('url');
const { verify } = require('./lib/token');
const authService = require('./services/authService');
const patientService = require('./services/patientService');
const appointmentService = require('./services/appointmentService');
const { readDb } = require('./lib/storage');

const PORT = Number(process.env.PORT || 8080);

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS' });
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => resolve(raw ? JSON.parse(raw) : {}));
  });
}

function authUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token ? verify(token) : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { success: true, message: 'ok' });

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const payload = await parseBody(req);
      return send(res, 201, { success: true, data: authService.register(payload) });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/login') return send(res, 200, { success: true, data: authService.login(await parseBody(req)) });
    if (req.method === 'GET' && url.pathname === '/api/auth/verify-email') return send(res, 200, { success: authService.verifyEmail(url.searchParams.get('token') || '') });
    if (req.method === 'POST' && url.pathname === '/api/auth/forgot-password') return send(res, 200, { success: true, data: authService.forgotPassword((await parseBody(req)).email) });
    if (req.method === 'POST' && url.pathname === '/api/auth/reset-password') return send(res, 200, { success: authService.resetPassword(await parseBody(req)) });

    if (req.method === 'GET' && url.pathname === '/api/services') return send(res, 200, { success: true, data: readDb().services.filter((s) => s.isActive) });

    const user = authUser(req);
    if (url.pathname.startsWith('/api/') && !user) return send(res, 401, { success: false, message: 'Unauthorized' });

    if (req.method === 'GET' && url.pathname === '/api/patient/profile') return send(res, 200, { success: true, data: patientService.getProfile(user.sub) });
    if (req.method === 'POST' && url.pathname === '/api/patient/profile') return send(res, 200, { success: true, data: patientService.upsertProfile(user.sub, await parseBody(req)) });
    if (req.method === 'POST' && url.pathname === '/api/patient/intake') return send(res, 201, { success: true, data: patientService.saveIntake(user.sub, await parseBody(req)) });

    if (req.method === 'POST' && url.pathname === '/api/appointments') return send(res, 201, { success: true, data: appointmentService.book(user.sub, await parseBody(req)) });
    if (req.method === 'GET' && url.pathname === '/api/appointments/history') return send(res, 200, { success: true, data: appointmentService.history(user.sub) });
    if (req.method === 'PATCH' && url.pathname.startsWith('/api/appointments/')) {
      if (!['ADMIN', 'STAFF'].includes(user.role)) return send(res, 403, { success: false, message: 'Forbidden' });
      const id = url.pathname.split('/')[3];
      return send(res, 200, { success: true, data: appointmentService.updateStatus(id, await parseBody(req)) });
    }

    return send(res, 404, { success: false, message: 'Not found' });
  } catch (e) {
    return send(res, 400, { success: false, message: e.message });
  }
});

server.listen(PORT, () => console.log(`SkinRejuve backend running at http://localhost:${PORT}`));
