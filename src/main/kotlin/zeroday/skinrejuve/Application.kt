package zeroday.skinrejuve

import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.auth.BootstrapAdminService
import zeroday.skinrejuve.auth.AuthRepository
import zeroday.skinrejuve.config.DatabaseConfig
import zeroday.skinrejuve.config.MailConfig
import zeroday.skinrejuve.db.DatabaseFactory
import zeroday.skinrejuve.plugins.configureCORS
import zeroday.skinrejuve.plugins.configureMonitoring
import zeroday.skinrejuve.plugins.configureRouting
import zeroday.skinrejuve.plugins.configureSecurity
import zeroday.skinrejuve.plugins.configureSerialization
import zeroday.skinrejuve.plugins.configureStatusPages
import io.ktor.server.application.Application
import io.ktor.server.application.install

fun main(args: Array<String>) = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val appConfig = AppConfig.from(environment.config)
    val databaseConfig = DatabaseConfig.from(environment.config)
    val mailConfig = MailConfig.from(environment.config)

    DatabaseFactory(databaseConfig).init()
    BootstrapAdminService(appConfig, AuthRepository()).ensureSuperAdmin()

    install(zeroday.skinrejuve.utils.Constants.AppDependencies) {
        this.appConfig = appConfig
        this.mailConfig = mailConfig
    }

    configureSerialization()
    configureMonitoring()
    configureStatusPages()
    configureCORS(appConfig)
    configureSecurity(appConfig)
    configureRouting()
}
