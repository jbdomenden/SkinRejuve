package zeroday.skinrejuve.auth

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.db.PatientProfiles
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.utils.DateTimeUtils
import java.util.UUID

class BootstrapPatientService(
    private val appConfig: AppConfig,
    private val authRepository: AuthRepository
) {
    fun ensureDemoPatient() {
        val email = appConfig.bootstrapPatientEmail ?: return
        val password = appConfig.bootstrapPatientPassword ?: return
        val normalizedEmail = email.trim().lowercase()
        val passwordHash = PasswordHasher.hash(password)
        val now = DateTimeUtils.now()
        val existing = authRepository.getUserByEmail(normalizedEmail)

        val userId = if (existing == null) {
            val user = authRepository.createUser(normalizedEmail, passwordHash, UserRole.PATIENT)
            transaction {
                Users.update({ Users.id eq user.id }) {
                    it[role] = UserRole.PATIENT
                    it[emailVerified] = true
                    it[isActive] = true
                    it[Users.passwordHash] = passwordHash
                    it[updatedAt] = now
                }
            }
            println("Bootstrapped demo patient account for $normalizedEmail")
            user.id
        } else {
            transaction {
                Users.update({ Users.id eq existing.id }) {
                    it[role] = UserRole.PATIENT
                    it[emailVerified] = true
                    it[isActive] = true
                    it[Users.passwordHash] = passwordHash
                    it[updatedAt] = now
                }
            }
            println("Ensured demo patient account for $normalizedEmail")
            existing.id
        }

        ensureProfile(userId)
    }

    private fun ensureProfile(userId: UUID) {
        val now = DateTimeUtils.now()
        val existingProfile = transaction {
            PatientProfiles.selectAll().where { PatientProfiles.userId eq userId }.singleOrNull()
        }

        if (existingProfile == null) {
            transaction {
                PatientProfiles.insert {
                    it[id] = UUID.randomUUID()
                    it[PatientProfiles.userId] = userId
                    it[firstName] = "Demo"
                    it[lastName] = "Patient"
                    it[phone] = "(555) 010-2026"
                    it[dateOfBirth] = null
                    it[createdAt] = now
                    it[updatedAt] = now
                }
            }
            return
        }

        transaction {
            PatientProfiles.update({ PatientProfiles.userId eq userId }) {
                it[firstName] = "Demo"
                it[lastName] = "Patient"
                it[phone] = "(555) 010-2026"
                it[updatedAt] = now
            }
        }
    }
}
