package zeroday.skinrejuve

import zeroday.skinrejuve.auth.AuthRepository
import zeroday.skinrejuve.auth.BootstrapAdminService
import zeroday.skinrejuve.auth.AuthService
import zeroday.skinrejuve.auth.EmailVerificationService
import zeroday.skinrejuve.auth.JwtService
import zeroday.skinrejuve.auth.PasswordResetService
import zeroday.skinrejuve.auth.TokenGenerator
import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.security.JwtConfig
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.services.MailService
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import kotlin.test.assertFailsWith

class AuthIntegrationTest {
    private val appConfig = AppConfig(
        environment = "test",
        appUrl = "http://localhost:8080",
        jwtIssuer = "skinrejuve-api",
        jwtAudience = "skinrejuve-clients",
        jwtSecret = "test-secret",
        jwtExpiresInMinutes = 120,
        tokenExpiresInMinutes = 30,
        allowedOrigins = listOf("http://localhost:5173"),
        bootstrapAdminEmail = null,
        bootstrapAdminPassword = null
    )

    @BeforeTest
    fun setup() {
        initTestDatabase()
        cleanDatabase()
    }

    @Test
    fun `password reset token is one time use`() {
        val repo = AuthRepository()
        val user = repo.createUser("p1@test.local", PasswordHasher.hash("Password1"), UserRole.PATIENT)

        val raw = TokenGenerator.generateRawToken()
        repo.storePasswordResetToken(user.id, TokenGenerator.hashToken(raw), java.time.LocalDateTime.now().plusMinutes(10))

        assertEquals(user.id, repo.consumePasswordResetToken(TokenGenerator.hashToken(raw)))
        assertNull(repo.consumePasswordResetToken(TokenGenerator.hashToken(raw)))
    }

    @Test
    fun `email verification flips verified flag`() {
        val repo = AuthRepository()
        val user = repo.createUser("verify@test.local", PasswordHasher.hash("Password1"), UserRole.PATIENT)

        val token = TokenGenerator.generateRawToken()
        repo.storeEmailVerificationToken(user.id, TokenGenerator.hashToken(token), java.time.LocalDateTime.now().plusMinutes(10))
        val verifiedId = repo.verifyEmailToken(TokenGenerator.hashToken(token))

        assertEquals(user.id, verifiedId)
        val updated = repo.getUserByEmail("verify@test.local")
        assertNotNull(updated)
        assertTrue(updated.emailVerified)
    }

    @Test
    fun `login requires verified email`() {
        val repo = AuthRepository()
        val jwtService = JwtService(JwtConfig(appConfig))
        val mailService = MailService(zeroday.skinrejuve.config.MailConfig("localhost", 1025, "", "", "noreply@test.local", false))
        val authService = AuthService(
            authRepository = repo,
            jwtService = jwtService,
            emailVerificationService = EmailVerificationService(appConfig, repo, mailService),
            passwordResetService = PasswordResetService(appConfig, repo, mailService)
        )

        repo.createUser("unverified@test.local", PasswordHasher.hash("Password1"), UserRole.PATIENT)
        assertFailsWith<IllegalArgumentException> {
            authService.login("unverified@test.local", "Password1")
        }
    }

    @Test
    fun `bootstrap service creates verified admin`() {
        val repo = AuthRepository()
        val config = appConfig.copy(bootstrapAdminEmail = "superadmin@test.local", bootstrapAdminPassword = "SuperAdmin123!")

        BootstrapAdminService(config, repo).ensureSuperAdmin()

        val user = repo.getUserByEmail("superadmin@test.local")
        assertNotNull(user)
        assertEquals(UserRole.ADMIN, user.role)
        assertTrue(user.emailVerified)
        assertTrue(user.isActive)
        assertTrue(PasswordHasher.verify("SuperAdmin123!", user.passwordHash))
    }
}
