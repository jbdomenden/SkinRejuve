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

function getOverview(userId) {
  const db = readDb();
  const profile = db.patientProfiles.find((item) => item.userId === userId);
  const user = db.users.find((item) => item.id === userId);
  const intake = profile ? db.patientIntakes.find((item) => item.patientId === profile.id) : null;
  const appointments = profile
    ? db.appointments
      .filter((item) => item.patientId === profile.id)
      .map((item) => ({
        ...item,
        serviceName: db.services.find((service) => service.id === item.serviceId)?.name || 'Unknown service'
      }))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    : [];
  const nextAppointment = appointments.find((item) => new Date(item.startAt).getTime() > Date.now()) || null;

  return {
    welcomeName: [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || user?.email || 'Guest',
    metrics: [
      { label: 'Profile completion', value: profile?.firstName && profile?.lastName ? '100%' : '60%' },
      { label: 'Upcoming visits', value: appointments.filter((item) => new Date(item.startAt).getTime() > Date.now()).length },
      { label: 'Intake status', value: intake ? 'Submitted' : 'Pending' }
    ],
    nextAppointment,
    recentAppointments: appointments.slice(-3).reverse(),
    intakeComplete: Boolean(intake)
  };
}

module.exports = { getProfile, upsertProfile, saveIntake, getOverview };
