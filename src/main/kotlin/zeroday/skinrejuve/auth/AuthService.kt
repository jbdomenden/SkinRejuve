package zeroday.skinrejuve.auth

import kotlinx.serialization.Serializable
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.models.User
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.utils.Validators
import java.util.UUID

class AuthService(
    private val authRepository: AuthRepository,
    private val jwtService: JwtService,
    private val emailVerificationService: EmailVerificationService,
    private val passwordResetService: PasswordResetService
) {
    fun register(email: String, password: String): RegistrationResult {
        val normalizedEmail = Validators.requireEmail(email)
        Validators.requirePasswordStrength(password)
        require(authRepository.getUserByEmail(normalizedEmail) == null) { "Email already exists" }

        val user = authRepository.createUser(normalizedEmail, PasswordHasher.hash(password), UserRole.PATIENT)
        val verification = emailVerificationService.issueTokenAndSend(user.id, user.email)
        return RegistrationResult(
            user = user,
            verificationEmailSent = verification.emailSent,
            verificationUrl = verification.verificationUrl,
            emailDeliveryMessage = verification.message
        )
    }

    fun login(email: String, password: String): AuthResult {
        val normalizedEmail = Validators.requireEmail(email)
        val record = authRepository.getUserByEmail(normalizedEmail) ?: throw IllegalArgumentException("Invalid credentials")
        require(record.isActive) { "Account is disabled" }
        require(record.emailVerified) { "Email verification required" }
        require(PasswordHasher.verify(password, record.passwordHash)) { "Invalid credentials" }
        val token = jwtService.tokenFor(record)
        return AuthResult(token, record.emailVerified)
    }

    fun verifyEmail(token: String): Boolean = emailVerificationService.verify(token.trim()) != null

    fun forgotPassword(email: String) {
        Validators.requireEmail(email)
        passwordResetService.createReset(email)
    }

    fun resetPassword(token: String, password: String): Boolean = passwordResetService.resetPassword(token.trim(), password)

    fun changePassword(userId: UUID, currentPassword: String, newPassword: String) {
        Validators.requirePasswordStrength(newPassword)
        val record = authRepository.getUserRecordById(userId) ?: throw IllegalArgumentException("User account not found")
        require(PasswordHasher.verify(currentPassword, record.passwordHash)) { "Current password is incorrect" }
        require(!PasswordHasher.verify(newPassword, record.passwordHash)) { "New password must be different from current password" }
        authRepository.updatePassword(userId, PasswordHasher.hash(newPassword))
    }
}

@Serializable
data class RegistrationResult(
    val user: User,
    val verificationEmailSent: Boolean,
    val verificationUrl: String? = null,
    val emailDeliveryMessage: String? = null
)

@Serializable
data class AuthResult(
    val token: String,
    val emailVerified: Boolean
)
