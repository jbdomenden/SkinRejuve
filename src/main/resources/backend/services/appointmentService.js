const { readDb, writeDb } = require('../lib/storage');

const terminal = new Set(['COMPLETED']);
const activeStatuses = new Set(['PENDING', 'APPROVED', 'CHECKED_IN', 'IN_PROGRESS']);

function getAvailableSlots() {
  const db = readDb();
  const slots = [];
  const start = new Date();
  start.setUTCHours(9, 0, 0, 0);

  for (let day = 0; day < 10; day += 1) {
    for (let hour = 9; hour <= 16; hour += 1) {
      const slotDate = new Date(start.getTime() + day * 24 * 60 * 60 * 1000);
      slotDate.setUTCHours(hour, 0, 0, 0);
      if (slotDate.getTime() <= Date.now()) continue;
      const iso = slotDate.toISOString();
      const isBooked = db.appointments.some((appointment) => appointment.startAt === iso && activeStatuses.has(appointment.status));
      if (!isBooked) {
        slots.push({
          id: iso,
          startAt: iso,
          endAt: new Date(slotDate.getTime() + 60 * 60 * 1000).toISOString(),
          staffId: `staff-${(hour % 3) + 1}`,
          staffName: ['Dr. Reyes', 'Nurse Lim', 'Dr. Santos'][hour % 3]
        });
      }
    }
  }

  return slots;
}

function book(userId, { serviceId, slotId, startAt }) {
  const db = readDb();
  const profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) throw new Error('Profile required first');
  if (!db.services.some((service) => service.id === serviceId && service.isActive)) throw new Error('Service not found');

  const slotValue = slotId || startAt;
  const slot = new Date(slotValue).getTime();
  if (!Number.isFinite(slot) || slot <= Date.now()) throw new Error('Cannot book past time');
  const normalizedStartAt = new Date(slotValue).toISOString();
  const duplicate = db.appointments.find((a) => a.startAt === normalizedStartAt && activeStatuses.has(a.status));
  if (duplicate) throw new Error('Cannot double book slot');
  const appt = { id: `apt-${Date.now()}`, patientId: profile.id, serviceId, startAt: normalizedStartAt, status: 'PENDING', denialReason: null, createdAt: new Date().toISOString() };
  db.appointments.push(appt);
  writeDb(db);
  return appt;
}

function history(userId) {
  const db = readDb();
  const profile = db.patientProfiles.find((p) => p.userId === userId);
  if (!profile) return [];
  return db.appointments
    .filter((a) => a.patientId === profile.id)
    .map((appointment) => {
      const service = db.services.find((item) => item.id === appointment.serviceId);
      return {
        ...appointment,
        serviceName: service?.name || 'Unknown service',
        servicePrice: service?.price || 0
      };
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
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

module.exports = { book, history, updateStatus, getAvailableSlots };
