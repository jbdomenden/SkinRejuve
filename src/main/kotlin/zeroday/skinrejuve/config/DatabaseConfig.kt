package zeroday.skinrejuve.config

import com.typesafe.config.Config

data class DatabaseConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
    val driverClassName: String,
    val maxPoolSize: Int
) {
    companion object {
        fun from(config: Config): DatabaseConfig = DatabaseConfig(
            jdbcUrl = value(config, "database.jdbcUrl", "DB_JDBC_URL", "jdbc:postgresql://localhost:5432/skinrejuve"),
            username = value(config, "database.username", "DB_USERNAME", "postgres"),
            password = value(config, "database.password", "DB_PASSWORD", "postgres"),
            driverClassName = value(config, "database.driver", "DB_DRIVER", "org.postgresql.Driver"),
            maxPoolSize = value(config, "database.maxPoolSize", "DB_MAX_POOL_SIZE", "10").toInt()
        )

        private fun value(config: Config, path: String, envName: String, default: String): String {
            val env = System.getenv(envName)
            return if (!env.isNullOrBlank()) env else if (config.hasPath(path)) config.getString(path) else default
        }
    }
}
