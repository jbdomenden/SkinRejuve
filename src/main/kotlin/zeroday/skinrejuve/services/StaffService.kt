package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.AppointmentSlots
import zeroday.skinrejuve.db.Appointments
import zeroday.skinrejuve.db.StaffProfiles
import zeroday.skinrejuve.models.Appointment
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class StaffService {
    fun appointmentsForStaff(staffUserId: UUID): List<Appointment> = transaction {
        val staff = StaffProfiles.selectAll().where { StaffProfiles.userId eq staffUserId }.singleOrNull()
            ?: return@transaction emptyList()
        val staffId = staff[StaffProfiles.id]

        (Appointments innerJoin AppointmentSlots)
            .select(Appointments.columns)
            .where { AppointmentSlots.staffId eq staffId }
            .map { it.toAppointment() }
    }

    private fun ResultRow.toAppointment(): Appointment = Appointment(
        id = this[Appointments.id],
        patientId = this[Appointments.patientId],
        serviceId = this[Appointments.serviceId],
        slotId = this[Appointments.slotId],
        status = this[Appointments.status],
        denialReason = this[Appointments.denialReason],
        createdAt = this[Appointments.createdAt]
    )
}
