package zeroday.skinrejuve.auth

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.utils.DateTimeUtils

class BootstrapAdminService(
    private val appConfig: AppConfig,
    private val authRepository: AuthRepository
) {
    fun ensureSuperAdmin() {
        val email = appConfig.bootstrapAdminEmail ?: return
        val password = appConfig.bootstrapAdminPassword ?: return
        val normalizedEmail = email.trim().lowercase()
        val passwordHash = PasswordHasher.hash(password)
        val now = DateTimeUtils.now()
        val existing = authRepository.getUserByEmail(normalizedEmail)

        if (existing == null) {
            val user = authRepository.createUser(normalizedEmail, passwordHash, UserRole.ADMIN)
            transaction {
                Users.update({ Users.id eq user.id }) {
                    it[role] = UserRole.ADMIN
                    it[emailVerified] = true
                    it[isActive] = true
                    it[Users.passwordHash] = passwordHash
                    it[updatedAt] = now
                }
            }
            println("Bootstrapped superadmin account for $normalizedEmail")
            return
        }

        transaction {
            Users.update({ Users.id eq existing.id }) {
                it[role] = UserRole.ADMIN
                it[emailVerified] = true
                it[isActive] = true
                it[Users.passwordHash] = passwordHash
                it[updatedAt] = now
            }
        }
        println("Ensured superadmin account for $normalizedEmail")
    }
}
