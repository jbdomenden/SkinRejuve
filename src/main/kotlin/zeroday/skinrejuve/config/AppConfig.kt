package zeroday.skinrejuve.config

import io.ktor.server.config.ApplicationConfig

data class AppConfig(
    val environment: String,
    val appUrl: String,
    val jwtIssuer: String,
    val jwtAudience: String,
    val jwtSecret: String,
    val jwtExpiresInMinutes: Long,
    val tokenExpiresInMinutes: Long,
    val allowedOrigins: List<String>,
    val bootstrapAdminEmail: String?,
    val bootstrapAdminPassword: String?
) {
    companion object {
        fun from(config: ApplicationConfig): AppConfig {
            val environment = propertyOrEnv(config, "app.environment", "APP_ENV", "development")
            val defaultJwtSecret = if (environment.equals("development", ignoreCase = true)) {
                "dev-secret-change-me"
            } else {
                ""
            }
            val jwtSecret = propertyOrEnv(config, "jwt.secret", "JWT_SECRET", defaultJwtSecret)
            require(jwtSecret.isNotBlank()) { "JWT secret must be configured using JWT_SECRET or jwt.secret" }

            val defaultBootstrapEmail = if (environment.equals("development", ignoreCase = true)) {
                "superadmin@skinrejuve.local"
            } else {
                ""
            }
            val defaultBootstrapPassword = if (environment.equals("development", ignoreCase = true)) {
                "SuperAdmin123!"
            } else {
                ""
            }

            return AppConfig(
                environment = environment,
                appUrl = propertyOrEnv(config, "app.url", "APP_URL", "http://localhost:8080"),
                jwtIssuer = propertyOrEnv(config, "jwt.issuer", "JWT_ISSUER", "skinrejuve-api"),
                jwtAudience = propertyOrEnv(config, "jwt.audience", "JWT_AUDIENCE", "skinrejuve-clients"),
                jwtSecret = jwtSecret,
                jwtExpiresInMinutes = propertyOrEnv(config, "jwt.expiresMinutes", "JWT_EXPIRES_MINUTES", "120").toLong(),
                tokenExpiresInMinutes = propertyOrEnv(config, "tokens.expiresMinutes", "TOKENS_EXPIRES_MINUTES", "30").toLong(),
                allowedOrigins = propertyOrEnv(config, "cors.allowedOrigins", "CORS_ALLOWED_ORIGINS", "http://localhost:5173")
                    .split(",")
                    .map { it.trim() }
                    .filter { it.isNotEmpty() },
                bootstrapAdminEmail = propertyOrEnv(config, "bootstrapAdmin.email", "SUPERADMIN_EMAIL", defaultBootstrapEmail).ifBlank { null },
                bootstrapAdminPassword = propertyOrEnv(config, "bootstrapAdmin.password", "SUPERADMIN_PASSWORD", defaultBootstrapPassword).ifBlank { null }
            )
        }

        private fun propertyOrEnv(config: ApplicationConfig, path: String, envName: String, default: String): String {
            val envValue = System.getenv(envName)
            val configValue = config.propertyOrNull(path)?.getString()?.takeIf { it.isNotBlank() }
            return when {
                !envValue.isNullOrBlank() -> envValue
                configValue != null -> configValue
                else -> default
            }
        }
    }
}
