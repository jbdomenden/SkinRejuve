package zeroday.skinrejuve.auth

import zeroday.skinrejuve.db.EmailVerificationTokens
import zeroday.skinrejuve.db.PasswordResetTokens
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.models.User
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.time.LocalDateTime
import java.util.UUID

class AuthRepository {
    fun createUser(email: String, passwordHash: String, role: UserRole = UserRole.PATIENT): User = transaction {
        val now = DateTimeUtils.now()
        val id = UUID.randomUUID()
        Users.insert {
            it[Users.id] = id
            it[Users.email] = email
            it[Users.passwordHash] = passwordHash
            it[Users.role] = role
            it[emailVerified] = false
            it[isActive] = true
            it[createdAt] = now
            it[updatedAt] = now
        }
        getUserById(id)!!
    }

    fun getUserByEmail(email: String): UserRecord? = transaction {
        Users.selectAll().where { Users.email eq email }
            .singleOrNull()
            ?.toUserRecord()
    }

    fun getUserById(userId: UUID): User? = transaction {
        Users.selectAll().where { Users.id eq userId }.singleOrNull()?.toUser()
    }

    fun getUserRecordById(userId: UUID): UserRecord? = transaction {
        Users.selectAll().where { Users.id eq userId }.singleOrNull()?.toUserRecord()
    }

    fun storeEmailVerificationToken(userId: UUID, tokenHash: String, expiresAt: LocalDateTime) = transaction {
        val now = DateTimeUtils.now()
        EmailVerificationTokens.deleteWhere { EmailVerificationTokens.userId eq userId }
        EmailVerificationTokens.insert {
            it[id] = UUID.randomUUID()
            it[EmailVerificationTokens.userId] = userId
            it[token] = tokenHash
            it[EmailVerificationTokens.expiresAt] = expiresAt
            it[createdAt] = now
        }
    }

    fun verifyEmailToken(tokenHash: String): UUID? = transaction {
        val now = DateTimeUtils.now()
        val row = EmailVerificationTokens.selectAll().where {
            (EmailVerificationTokens.token eq tokenHash) and
                EmailVerificationTokens.consumedAt.isNull() and
                (EmailVerificationTokens.expiresAt greaterEq now)
        }.singleOrNull() ?: return@transaction null

        EmailVerificationTokens.update({ EmailVerificationTokens.id eq row[EmailVerificationTokens.id] }) {
            it[consumedAt] = now
        }
        val userId = row[EmailVerificationTokens.userId]
        Users.update({ Users.id eq userId }) {
            it[emailVerified] = true
            it[updatedAt] = now
        }
        userId
    }

    fun storePasswordResetToken(userId: UUID, tokenHash: String, expiresAt: LocalDateTime) = transaction {
        val now = DateTimeUtils.now()
        PasswordResetTokens.deleteWhere { PasswordResetTokens.userId eq userId }
        PasswordResetTokens.insert {
            it[id] = UUID.randomUUID()
            it[PasswordResetTokens.userId] = userId
            it[token] = tokenHash
            it[PasswordResetTokens.expiresAt] = expiresAt
            it[createdAt] = now
        }
    }

    fun consumePasswordResetToken(tokenHash: String): UUID? = transaction {
        val now = DateTimeUtils.now()
        val row = PasswordResetTokens.selectAll().where {
            (PasswordResetTokens.token eq tokenHash) and
                PasswordResetTokens.consumedAt.isNull() and
                (PasswordResetTokens.expiresAt greaterEq now)
        }.singleOrNull() ?: return@transaction null

        PasswordResetTokens.update({ PasswordResetTokens.id eq row[PasswordResetTokens.id] }) {
            it[consumedAt] = now
        }
        row[PasswordResetTokens.userId]
    }

    fun updatePassword(userId: UUID, hash: String) = transaction {
        Users.update({ Users.id eq userId }) {
            it[passwordHash] = hash
            it[updatedAt] = DateTimeUtils.now()
        }
        PasswordResetTokens.deleteWhere { PasswordResetTokens.userId eq userId }
    }

    private fun ResultRow.toUser(): User = User(
        id = this[Users.id],
        email = this[Users.email],
        role = this[Users.role],
        emailVerified = this[Users.emailVerified],
        isActive = this[Users.isActive]
    )

    private fun ResultRow.toUserRecord(): UserRecord = UserRecord(
        id = this[Users.id],
        email = this[Users.email],
        passwordHash = this[Users.passwordHash],
        role = this[Users.role],
        emailVerified = this[Users.emailVerified],
        isActive = this[Users.isActive]
    )
}

data class UserRecord(
    val id: UUID,
    val email: String,
    val passwordHash: String,
    val role: UserRole,
    val emailVerified: Boolean,
    val isActive: Boolean
)
