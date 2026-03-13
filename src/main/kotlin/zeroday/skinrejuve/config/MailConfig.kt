package zeroday.skinrejuve.config

import com.typesafe.config.Config

data class MailConfig(
    val host: String,
    val port: Int,
    val username: String,
    val password: String,
    val from: String,
    val useTls: Boolean
) {
    companion object {
        fun from(config: Config): MailConfig = MailConfig(
            host = value(config, "smtp.host", "SMTP_HOST", "localhost"),
            port = value(config, "smtp.port", "SMTP_PORT", "1025").toInt(),
            username = value(config, "smtp.username", "SMTP_USERNAME", ""),
            password = value(config, "smtp.password", "SMTP_PASSWORD", ""),
            from = value(config, "smtp.from", "SMTP_FROM", "no-reply@skinrejuve.local"),
            useTls = value(config, "smtp.useTls", "SMTP_USE_TLS", "false").toBoolean()
        )

        private fun value(config: Config, path: String, envName: String, default: String): String {
            val env = System.getenv(envName)
            return if (!env.isNullOrBlank()) env else if (config.hasPath(path)) config.getString(path) else default
        }
    }
}
