const { readDb, writeDb } = require('../lib/storage');

function getProfile(userId) {
  const db = readDb();
  return db.patientProfiles.find((p) => p.userId === userId) || null;
}

function upsertProfile(userId, payload) {
  const db = readDb();
  let profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) {
    profile = { id: `pat-${Date.now()}`, userId, createdAt: new Date().toISOString() };
    db.patientProfiles.push(profile);
  }
  Object.assign(profile, payload, { updatedAt: new Date().toISOString() });
  writeDb(db);
  return profile;
}

function saveIntake(userId, payload) {
  const db = readDb();
  const profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) throw new Error('Profile required first');
  const intake = { id: `int-${Date.now()}`, patientId: profile.id, ...payload, createdAt: new Date().toISOString() };
  db.patientIntakes.push(intake);
  writeDb(db);
  return intake;
}

module.exports = { getProfile, upsertProfile, saveIntake };
