package zeroday.skinrejuve

import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.config.DatabaseConfig
import zeroday.skinrejuve.db.DatabaseFactory
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.security.JwtConfig
import zeroday.skinrejuve.security.JwtPrincipalData
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.deleteAll
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

fun initTestDatabase() {
    Database.connect(
        url = "jdbc:h2:mem:skinrejuve-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        driver = "org.h2.Driver",
        user = "sa",
        password = ""
    )
    DatabaseFactory(DatabaseConfig(
        jdbcUrl = "jdbc:h2:mem:skinrejuve-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        username = "sa",
        password = "",
        driverClassName = "org.h2.Driver",
        maxPoolSize = 4
    )).init()
}

fun cleanDatabase() {
    transaction {
        listOf(
            zeroday.skinrejuve.db.AuditLogs,
            zeroday.skinrejuve.db.Notifications,
            zeroday.skinrejuve.db.TreatmentRecords,
            zeroday.skinrejuve.db.Appointments,
            zeroday.skinrejuve.db.AppointmentSlots,
            zeroday.skinrejuve.db.StaffServiceAssignments,
            zeroday.skinrejuve.db.Services,
            zeroday.skinrejuve.db.StaffProfiles,
            zeroday.skinrejuve.db.PrivacyConsents,
            zeroday.skinrejuve.db.PatientIntakes,
            zeroday.skinrejuve.db.PatientProfiles,
            zeroday.skinrejuve.db.PasswordResetTokens,
            zeroday.skinrejuve.db.EmailVerificationTokens,
            zeroday.skinrejuve.db.Users,
        ).forEach { it.deleteAll() }
    }
}

fun seedUser(role: UserRole, verified: Boolean = true): UUID {
    val id = UUID.randomUUID()
    transaction {
        Users.insert {
            it[Users.id] = id
            it[email] = "${id}@test.local"
            it[passwordHash] = PasswordHasher.hash("Password1")
            it[Users.role] = role
            it[emailVerified] = verified
            it[isActive] = true
            it[createdAt] = DateTimeUtils.now()
            it[updatedAt] = DateTimeUtils.now()
        }
    }
    return id
}

fun testJwt(userId: UUID, role: UserRole, email: String = "user@test.local"): String {
    val appConfig = AppConfig(
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
    return JwtConfig(appConfig).createToken(JwtPrincipalData(userId, email, role))
}
