const { readDb, writeDb } = require('../lib/storage');
const { hashPassword } = require('./authService');
const { getAvailableSlots } = require('./appointmentService');

function enrichAppointment(db, appointment) {
  const service = db.services.find((item) => item.id === appointment.serviceId);
  const patient = db.patientProfiles.find((item) => item.id === appointment.patientId);
  const user = patient ? db.users.find((item) => item.id === patient.userId) : null;
  return {
    ...appointment,
    serviceName: service?.name || 'Unknown service',
    servicePrice: service?.price || 0,
    patientName: [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') || user?.email || 'Unknown patient',
    patientEmail: user?.email || '—'
  };
}

function getOverview() {
  const db = readDb();
  const appointments = db.appointments.map((item) => enrichAppointment(db, item));
  const pending = appointments.filter((item) => item.status === 'PENDING').length;
  const upcoming = appointments.filter((item) => new Date(item.startAt).getTime() > Date.now()).length;
  const revenue = appointments
    .filter((item) => item.status === 'COMPLETED')
    .reduce((sum, item) => sum + (item.servicePrice || 0), 0);

  return {
    metrics: [
      { label: 'Total patients', value: db.patientProfiles.length },
      { label: 'Pending approvals', value: pending },
      { label: 'Upcoming visits', value: upcoming },
      { label: 'Completed revenue', value: revenue }
    ],
    recentAppointments: appointments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    slotCapacity: getAvailableSlots().slice(0, 6)
  };
}

function getAppointments() {
  const db = readDb();
  return enrichCollection(db.appointments, db);
}

function getRegistrations() {
  const db = readDb();
  return db.users
    .map((user) => {
      const profile = db.patientProfiles.find((item) => item.userId === user.id);
      const intake = profile ? db.patientIntakes.find((item) => item.patientId === profile.id) : null;
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profileComplete: Boolean(profile?.firstName && profile?.lastName),
        intakeComplete: Boolean(intake),
        patientName: [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Pending profile'
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


function createUser(payload) {
  const db = readDb();
  const email = String(payload.email || '').trim().toLowerCase();
  if (!email) throw new Error('Email is required');
  if (!payload.password) throw new Error('Password is required');
  if (db.users.some((user) => user.email.toLowerCase() === email)) throw new Error('Email already exists');

  const userId = `usr-${Date.now()}`;
  const profileId = `pat-${Date.now() + 1}`;
  const intakeId = `int-${Date.now() + 2}`;
  const createdAt = new Date().toISOString();

  const user = {
    id: userId,
    email,
    username: String(payload.username || '').trim(),
    passwordHash: hashPassword(payload.password),
    role: 'PATIENT',
    emailVerified: true,
    createdAt
  };

  const nameParts = String(payload.fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || 'New';
  const lastName = nameParts.join(' ') || 'User';

  const profile = {
    id: profileId,
    userId,
    firstName,
    lastName,
    phone: payload.phone || '',
    dateOfBirth: payload.dateOfBirth || '',
    createdAt,
    updatedAt: createdAt
  };

  const intake = {
    id: intakeId,
    patientId: profileId,
    skinTypes: Array.isArray(payload.skinTypes) ? payload.skinTypes : [],
    allergies: Boolean(payload.hasAllergies),
    allergyNotes: payload.allergyNotes || '',
    medicalConditions: payload.medicalConditions || '',
    pastTreatment: payload.pastTreatment || '',
    createdAt
  };

  db.users.push(user);
  db.patientProfiles.push(profile);
  db.patientIntakes.push(intake);
  writeDb(db);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    patientName: `${profile.firstName} ${profile.lastName}`.trim(),
    createdAt
  };
}

function getReports() {
  const db = readDb();
  const appointments = enrichCollection(db.appointments, db);
  const byStatus = appointments.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const services = db.services.map((service) => {
    const related = appointments.filter((item) => item.serviceId === service.id);
    return {
      id: service.id,
      name: service.name,
      bookings: related.length,
      completed: related.filter((item) => item.status === 'COMPLETED').length,
      revenue: related.filter((item) => item.status === 'COMPLETED').reduce((sum, item) => sum + (service.price || 0), 0)
    };
  });

  return {
    totals: {
      appointments: appointments.length,
      completed: appointments.filter((item) => item.status === 'COMPLETED').length,
      revenue: services.reduce((sum, item) => sum + item.revenue, 0)
    },
    byStatus,
    services
  };
}

function enrichCollection(items, db) {
  return items
    .map((item) => enrichAppointment(db, item))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

module.exports = { getOverview, getAppointments, getRegistrations, createUser, getReports };
