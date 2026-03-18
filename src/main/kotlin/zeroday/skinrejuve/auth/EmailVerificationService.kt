package zeroday.skinrejuve.auth

import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.services.MailService
import java.time.LocalDateTime
import java.util.UUID

class EmailVerificationService(
    private val appConfig: AppConfig,
    private val authRepository: AuthRepository,
    private val mailService: MailService
) {
    fun issueTokenAndSend(userId: UUID, email: String): VerificationDeliveryResult {
        val rawToken = TokenGenerator.generateRawToken()
        val tokenHash = TokenGenerator.hashToken(rawToken)
        val expiresAt = LocalDateTime.now().plusMinutes(appConfig.tokenExpiresInMinutes)
        authRepository.storeEmailVerificationToken(userId, tokenHash, expiresAt)

        val verifyUrl = "${appConfig.appUrl}/api/auth/verify-email?token=$rawToken"
        val body = """
            Welcome to Skin Rejuve Clinic Portal.

            Please verify your email using the link below:
            $verifyUrl

            This link expires in ${appConfig.tokenExpiresInMinutes} minutes.
        """.trimIndent()
        return try {
            mailService.send(email, "Verify your Skin Rejuve account", body)
            VerificationDeliveryResult(emailSent = true)
        } catch (ex: IllegalStateException) {
            if (!appConfig.environment.equals("development", ignoreCase = true)) {
                throw ex
            }
            VerificationDeliveryResult(
                emailSent = false,
                verificationUrl = verifyUrl,
                message = "Email delivery is not configured in development yet. Open the verification link manually after you set up SMTP."
            )
        }
    }

    fun verify(rawToken: String): UUID? = authRepository.verifyEmailToken(TokenGenerator.hashToken(rawToken))
}


data class VerificationDeliveryResult(
    val emailSent: Boolean,
    val verificationUrl: String? = null,
    val message: String? = null
)
