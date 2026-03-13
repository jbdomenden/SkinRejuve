package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.TreatmentRecords
import zeroday.skinrejuve.models.TreatmentRecord
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class TreatmentService {
    fun addRecord(appointmentId: UUID, staffId: UUID, notes: String, progress: String): TreatmentRecord = transaction {
        val id = UUID.randomUUID()
        TreatmentRecords.insert {
            it[TreatmentRecords.id] = id
            it[TreatmentRecords.appointmentId] = appointmentId
            it[TreatmentRecords.staffId] = staffId
            it[TreatmentRecords.notes] = notes
            it[TreatmentRecords.progress] = progress
            it[createdAt] = DateTimeUtils.now()
        }
        TreatmentRecords.selectAll().where { TreatmentRecords.id eq id }.single().toTreatmentRecord()
    }

    fun byAppointment(appointmentId: UUID): List<TreatmentRecord> = transaction {
        TreatmentRecords.selectAll().where { TreatmentRecords.appointmentId eq appointmentId }.map { it.toTreatmentRecord() }
    }

    private fun ResultRow.toTreatmentRecord() = TreatmentRecord(
        id = this[TreatmentRecords.id],
        appointmentId = this[TreatmentRecords.appointmentId],
        notes = this[TreatmentRecords.notes]
    )
}
