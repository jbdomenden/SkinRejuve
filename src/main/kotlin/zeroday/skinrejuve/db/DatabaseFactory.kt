package zeroday.skinrejuve.db

import zeroday.skinrejuve.config.DatabaseConfig
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

class DatabaseFactory(private val config: DatabaseConfig) {
    fun init() {
        Database.connect(hikari())
        transaction {
            SchemaUtils.createMissingTablesAndColumns(
                Users,
                EmailVerificationTokens,
                PasswordResetTokens,
                PatientProfiles,
                PatientIntakes,
                PrivacyConsents,
                StaffProfiles,
                Services,
                StaffServiceAssignments,
                AppointmentSlots,
                Appointments,
                TreatmentRecords,
                Notifications,
                AuditLogs
            )
        }
    }

    private fun hikari(): HikariDataSource {
        val hikariConfig = HikariConfig().apply {
            driverClassName = config.driverClassName
            jdbcUrl = config.jdbcUrl
            username = config.username
            password = config.password
            maximumPoolSize = config.maxPoolSize
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(hikariConfig)
    }
}
