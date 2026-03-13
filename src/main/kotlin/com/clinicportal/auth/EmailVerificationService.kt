package com.clinicportal.auth

import com.clinicportal.config.AppConfig
import com.clinicportal.services.MailService
import java.time.LocalDateTime
import java.util.UUID

class EmailVerificationService(
    private val appConfig: AppConfig,
    private val authRepository: AuthRepository,
    private val mailService: MailService
) {
    fun issueTokenAndSend(userId: UUID, email: String) {
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
        mailService.send(email, "Verify your Skin Rejuve account", body)
    }

    fun verify(rawToken: String): UUID? = authRepository.verifyEmailToken(TokenGenerator.hashToken(rawToken))
}
