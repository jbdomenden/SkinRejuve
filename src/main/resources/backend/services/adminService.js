const { readDb } = require('../lib/storage');
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

module.exports = { getOverview, getAppointments, getRegistrations, getReports };
