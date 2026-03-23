const crypto = require('crypto');
const { readDb, writeDb } = require('../lib/storage');
const { sign, randomToken } = require('../lib/token');

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, 'skinrejuve-salt', 100000, 64, 'sha512').toString('hex');
}

function register({ email, password, role = 'PATIENT' }) {
  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already exists');
  const user = {
    id: `usr-${Date.now()}`,
    email,
    passwordHash: hashPassword(password),
    role,
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const token = randomToken();
  db.emailVerificationTokens.push({ token, userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000, consumed: false });
  writeDb(db);
  return { user: { id: user.id, email: user.email, role: user.role }, verifyToken: token };
}

function login({ email, password }) {
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) throw new Error('Invalid credentials');
  if (!user.emailVerified) throw new Error('Email is not verified');
  const accessToken = sign({ sub: user.id, role: user.role, email: user.email });
  return { accessToken, user: { id: user.id, email: user.email, role: user.role } };
}

function verifyEmail(token) {
  const db = readDb();
  const row = db.emailVerificationTokens.find((t) => t.token === token && !t.consumed && t.expiresAt > Date.now());
  if (!row) return false;
  row.consumed = true;
  const user = db.users.find((u) => u.id === row.userId);
  if (user) user.emailVerified = true;
  writeDb(db);
  return true;
}

function forgotPassword(email) {
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: true };
  const token = randomToken();
  db.passwordResetTokens.push({ token, userId: user.id, expiresAt: Date.now() + 20 * 60 * 1000, consumed: false });
  writeDb(db);
  return { ok: true, resetToken: token };
}

function resetPassword({ token, password }) {
  const db = readDb();
  const row = db.passwordResetTokens.find((t) => t.token === token && !t.consumed && t.expiresAt > Date.now());
  if (!row) return false;
  row.consumed = true;
  const user = db.users.find((u) => u.id === row.userId);
  if (user) user.passwordHash = hashPassword(password);
  writeDb(db);
  return true;
}

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, hashPassword };
