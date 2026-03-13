package com.clinicportal.auth

import com.clinicportal.db.UserRole
import com.clinicportal.models.User
import com.clinicportal.security.PasswordHasher
import com.clinicportal.utils.Validators

class AuthService(
    private val authRepository: AuthRepository,
    private val jwtService: JwtService,
    private val emailVerificationService: EmailVerificationService,
    private val passwordResetService: PasswordResetService
) {
    fun register(email: String, password: String): User {
        val normalizedEmail = Validators.requireEmail(email)
        Validators.requirePasswordStrength(password)
        require(authRepository.getUserByEmail(normalizedEmail) == null) { "Email already exists" }

        val user = authRepository.createUser(normalizedEmail, PasswordHasher.hash(password), UserRole.PATIENT)
        emailVerificationService.issueTokenAndSend(user.id, user.email)
        return user
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
}

data class AuthResult(
    val token: String,
    val emailVerified: Boolean
)
