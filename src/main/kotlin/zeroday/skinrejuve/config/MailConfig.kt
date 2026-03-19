package zeroday.skinrejuve.config

import io.ktor.server.config.ApplicationConfig

data class MailConfig(
    val host: String,
    val port: Int,
    val username: String,
    val password: String,
    val from: String,
    val useTls: Boolean
) {
    companion object {
        fun from(config: ApplicationConfig): MailConfig = MailConfig(
            host = firstNonBlank(
                System.getenv("SMTP_HOST"),
                config.propertyOrNull("smtp.host")?.getString(),
                "localhost"
            ),
            port = firstNonBlank(
                System.getenv("SMTP_PORT"),
                config.propertyOrNull("smtp.port")?.getString(),
                "1025"
            ).toInt(),
            username = firstNonBlank(
                System.getenv("SMTP_USERNAME"),
                System.getenv("SMTP_USER"),
                config.propertyOrNull("smtp.username")?.getString(),
                ""
            ),
            password = firstNonBlank(
                System.getenv("SMTP_PASSWORD"),
                config.propertyOrNull("smtp.password")?.getString(),
                ""
            ),
            from = firstNonBlank(
                System.getenv("SMTP_FROM"),
                config.propertyOrNull("smtp.from")?.getString(),
                "no-reply@skinrejuve.local"
            ),
            useTls = firstNonBlank(
                System.getenv("SMTP_USE_TLS"),
                System.getenv("SMTP_TLS"),
                config.propertyOrNull("smtp.useTls")?.getString(),
                "false"
            ).toBoolean()
        )

        private fun firstNonBlank(vararg values: String?): String =
            values.firstOrNull { !it.isNullOrBlank() } ?: ""
    }
}
