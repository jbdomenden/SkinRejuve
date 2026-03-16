const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload, expiresInSec = 60 * 60 * 2) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto.createHmac('sha256', SECRET).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

function verify(token) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const unsigned = `${h}.${p}`;
  const expected = crypto.createHmac('sha256', SECRET).update(unsigned).digest('base64url');
  if (expected !== s) return null;
  const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function randomToken() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { sign, verify, randomToken };
