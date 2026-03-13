package zeroday.skinrejuve.auth

import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.services.MailService
import zeroday.skinrejuve.utils.Validators
import java.time.LocalDateTime

class PasswordResetService(
    private val appConfig: AppConfig,
    private val authRepository: AuthRepository,
    private val mailService: MailService
) {
    fun createReset(email: String) {
        val normalizedEmail = Validators.requireEmail(email)
        val user = authRepository.getUserByEmail(normalizedEmail) ?: return

        val rawToken = TokenGenerator.generateRawToken()
        val tokenHash = TokenGenerator.hashToken(rawToken)
        val expiresAt = LocalDateTime.now().plusMinutes(appConfig.tokenExpiresInMinutes)
        authRepository.storePasswordResetToken(user.id, tokenHash, expiresAt)

        val resetUrl = "${appConfig.appUrl}/reset-password?token=$rawToken"
        val body = """
            A password reset was requested for your Skin Rejuve account.

            Reset link:
            $resetUrl

            This link expires in ${appConfig.tokenExpiresInMinutes} minutes.
            If you did not request this, you can ignore this email.
        """.trimIndent()
        mailService.send(normalizedEmail, "Reset your Skin Rejuve password", body)
    }

    fun resetPassword(token: String, newPassword: String): Boolean {
        Validators.requirePasswordStrength(newPassword)
        val userId = authRepository.consumePasswordResetToken(TokenGenerator.hashToken(token)) ?: return false
        authRepository.updatePassword(userId, PasswordHasher.hash(newPassword))
        return true
    }
}
