package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.AppointmentSlots
import zeroday.skinrejuve.db.AppointmentStatus
import zeroday.skinrejuve.db.Appointments
import zeroday.skinrejuve.models.Appointment
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.util.UUID

class AppointmentService {
    fun book(patientId: UUID, serviceId: UUID, slotId: UUID): Appointment = transaction {
        val now = DateTimeUtils.now()
        val slot = AppointmentSlots.selectAll().where { AppointmentSlots.id eq slotId }.singleOrNull()
            ?: throw IllegalArgumentException("Slot not found")
        require(slot[AppointmentSlots.startAt].isAfter(now)) { "Cannot book past time" }
        require(slot[AppointmentSlots.isAvailable]) { "Slot not available" }

        val existing = Appointments.selectAll().where { Appointments.slotId eq slotId }.singleOrNull()
        require(existing == null) { "Slot already booked" }

        val id = UUID.randomUUID()
        Appointments.insert {
            it[Appointments.id] = id
            it[Appointments.patientId] = patientId
            it[Appointments.serviceId] = serviceId
            it[Appointments.slotId] = slotId
            it[status] = AppointmentStatus.PENDING
            it[createdAt] = now
            it[updatedAt] = now
        }

        AppointmentSlots.update({ AppointmentSlots.id eq slotId }) {
            it[isAvailable] = false
        }

        Appointments.selectAll().where { Appointments.id eq id }.single().toAppointment()
    }

    fun history(patientId: UUID): List<Appointment> = transaction {
        Appointments.selectAll().where { Appointments.patientId eq patientId }.map { it.toAppointment() }
    }

    fun updateStatus(appointmentId: UUID, status: AppointmentStatus, denialReason: String? = null): Appointment = transaction {
        val current = Appointments.selectAll().where { Appointments.id eq appointmentId }.singleOrNull()
            ?: throw IllegalArgumentException("Appointment not found")

        val currentStatus = current[Appointments.status]
        if (status == AppointmentStatus.DENIED) {
            require(!denialReason.isNullOrBlank()) { "Denial reason is required" }
        }

        if (currentStatus == AppointmentStatus.COMPLETED && status == AppointmentStatus.CANCELLED) {
            throw IllegalArgumentException("Completed appointments cannot be cancelled")
        }

        Appointments.update({ Appointments.id eq appointmentId }) {
            it[Appointments.status] = status
            it[Appointments.denialReason] = denialReason
            it[updatedAt] = DateTimeUtils.now()
        }

        if (status in listOf(AppointmentStatus.DENIED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW)) {
            AppointmentSlots.update({ AppointmentSlots.id eq current[Appointments.slotId] }) {
                it[isAvailable] = true
            }
        }

        Appointments.selectAll().where { Appointments.id eq appointmentId }.single().toAppointment()
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
