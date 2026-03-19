package zeroday.skinrejuve.config

import io.ktor.server.config.ApplicationConfig
import java.net.URI

data class DatabaseConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
    val driverClassName: String,
    val maxPoolSize: Int
) {
    companion object {
        fun from(config: ApplicationConfig): DatabaseConfig {
            val parsedDatabaseUrl = parseDatabaseUrl(
                System.getenv("DATABASE_URL")
                    ?: System.getenv("DB_URL")
                    ?: System.getenv("DB_JDBC_URL")
                    ?: config.propertyOrNull("database.jdbcUrl")?.getString()
                    ?: "jdbc:postgresql://localhost:5432/skinrejuve"
            )

            return DatabaseConfig(
                jdbcUrl = parsedDatabaseUrl.jdbcUrl,
                username = firstNonBlank(
                    System.getenv("DB_USERNAME"),
                    System.getenv("DB_USER"),
                    System.getenv("DATABASE_USERNAME"),
                    config.propertyOrNull("database.username")?.getString(),
                    parsedDatabaseUrl.username,
                    "postgres"
                ),
                password = firstNonBlank(
                    System.getenv("DB_PASSWORD"),
                    System.getenv("DATABASE_PASSWORD"),
                    config.propertyOrNull("database.password")?.getString(),
                    parsedDatabaseUrl.password,
                    "postgres"
                ),
                driverClassName = firstNonBlank(
                    System.getenv("DB_DRIVER"),
                    config.propertyOrNull("database.driver")?.getString(),
                    "org.postgresql.Driver"
                ),
                maxPoolSize = firstNonBlank(
                    System.getenv("DB_MAX_POOL_SIZE"),
                    config.propertyOrNull("database.maxPoolSize")?.getString(),
                    "10"
                ).toInt()
            )
        }

        private fun parseDatabaseUrl(rawValue: String): ParsedDatabaseUrl {
            if (rawValue.startsWith("jdbc:", ignoreCase = true)) {
                return ParsedDatabaseUrl(jdbcUrl = rawValue)
            }

            val normalizedValue = if (rawValue.startsWith("postgres://", ignoreCase = true)) {
                "postgresql://${rawValue.removePrefix("postgres://")}"
            } else {
                rawValue
            }

            val uri = URI(normalizedValue)
            val jdbcUrl = buildString {
                append("jdbc:postgresql://")
                append(uri.host)
                if (uri.port != -1) {
                    append(":")
                    append(uri.port)
                }
                append(uri.path)
                if (!uri.query.isNullOrBlank()) {
                    append("?")
                    append(uri.query)
                }
            }

            val userInfoParts = uri.userInfo
                ?.split(":", limit = 2)
                ?.map { it.trim() }
                ?: emptyList()

            return ParsedDatabaseUrl(
                jdbcUrl = jdbcUrl,
                username = userInfoParts.getOrNull(0)?.takeIf { it.isNotBlank() },
                password = userInfoParts.getOrNull(1)?.takeIf { it.isNotBlank() }
            )
        }

        private fun firstNonBlank(vararg values: String?): String =
            values.firstOrNull { !it.isNullOrBlank() } ?: ""

        private data class ParsedDatabaseUrl(
            val jdbcUrl: String,
            val username: String? = null,
            val password: String? = null
        )
    }
}
