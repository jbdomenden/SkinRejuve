package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.PatientIntakes
import zeroday.skinrejuve.db.PatientProfiles
import zeroday.skinrejuve.models.PatientIntake
import zeroday.skinrejuve.models.PatientProfile
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.time.LocalDate
import java.util.UUID

class PatientService {
    fun upsertProfile(userId: UUID, firstName: String, lastName: String, phone: String?, dateOfBirth: LocalDate?): PatientProfile = transaction {
        val existing = PatientProfiles.selectAll().where { PatientProfiles.userId eq userId }.singleOrNull()
        val now = DateTimeUtils.now()

        if (existing == null) {
            val id = UUID.randomUUID()
            PatientProfiles.insert {
                it[PatientProfiles.id] = id
                it[PatientProfiles.userId] = userId
                it[PatientProfiles.firstName] = firstName
                it[PatientProfiles.lastName] = lastName
                it[PatientProfiles.phone] = phone
                it[PatientProfiles.dateOfBirth] = dateOfBirth
                it[createdAt] = now
                it[updatedAt] = now
            }
        } else {
            PatientProfiles.update({ PatientProfiles.userId eq userId }) {
                it[PatientProfiles.firstName] = firstName
                it[PatientProfiles.lastName] = lastName
                it[PatientProfiles.phone] = phone
                it[PatientProfiles.dateOfBirth] = dateOfBirth
                it[updatedAt] = now
            }
        }

        PatientProfiles.selectAll().where { PatientProfiles.userId eq userId }.single().toPatientProfile()
    }

    fun saveIntake(patientId: UUID, allergies: String?, medications: String?, conditions: String?, notes: String?): PatientIntake = transaction {
        val id = UUID.randomUUID()
        PatientIntakes.insert {
            it[PatientIntakes.id] = id
            it[PatientIntakes.patientId] = patientId
            it[PatientIntakes.allergies] = allergies
            it[PatientIntakes.medications] = medications
            it[PatientIntakes.conditions] = conditions
            it[PatientIntakes.notes] = notes
            it[createdAt] = DateTimeUtils.now()
        }
        PatientIntakes.selectAll().where { PatientIntakes.id eq id }.single().toPatientIntake()
    }

    fun findProfileByUserId(userId: UUID): PatientProfile? = transaction {
        PatientProfiles.selectAll().where { PatientProfiles.userId eq userId }.singleOrNull()?.toPatientProfile()
    }

    private fun ResultRow.toPatientProfile(): PatientProfile = PatientProfile(
        id = this[PatientProfiles.id],
        userId = this[PatientProfiles.userId],
        firstName = this[PatientProfiles.firstName],
        lastName = this[PatientProfiles.lastName],
        phone = this[PatientProfiles.phone],
        dateOfBirth = this[PatientProfiles.dateOfBirth]
    )

    private fun ResultRow.toPatientIntake(): PatientIntake = PatientIntake(
        id = this[PatientIntakes.id],
        patientId = this[PatientIntakes.patientId],
        allergies = this[PatientIntakes.allergies],
        medications = this[PatientIntakes.medications],
        conditions = this[PatientIntakes.conditions],
        notes = this[PatientIntakes.notes]
    )
}
