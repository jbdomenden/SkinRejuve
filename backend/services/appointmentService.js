const { readDb, writeDb } = require('../lib/storage');

const terminal = new Set(['COMPLETED']);

function book(userId, { serviceId, startAt }) {
  const db = readDb();
  const profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) throw new Error('Profile required first');
  const slot = new Date(startAt).getTime();
  if (!Number.isFinite(slot) || slot <= Date.now()) throw new Error('Cannot book past time');
  const duplicate = db.appointments.find((a) => a.startAt === startAt && ['PENDING', 'APPROVED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.status));
  if (duplicate) throw new Error('Cannot double book slot');
  const appt = { id: `apt-${Date.now()}`, patientId: profile.id, serviceId, startAt, status: 'PENDING', denialReason: null, createdAt: new Date().toISOString() };
  db.appointments.push(appt);
  writeDb(db);
  return appt;
}

function history(userId) {
  const db = readDb();
  const profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) return [];
  return db.appointments.filter((a) => a.patientId === profile.id);
}

function updateStatus(id, { status, denialReason }) {
  const db = readDb();
  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) throw new Error('Appointment not found');
  if (status === 'DENIED' && !denialReason) throw new Error('Denied appointment must contain reason');
  if (terminal.has(appt.status) && status === 'CANCELLED') throw new Error('Patients cannot cancel completed appointments');
  appt.status = status;
  appt.denialReason = status === 'DENIED' ? denialReason : null;
  appt.updatedAt = new Date().toISOString();
  writeDb(db);
  return appt;
}

module.exports = { book, history, updateStatus };
