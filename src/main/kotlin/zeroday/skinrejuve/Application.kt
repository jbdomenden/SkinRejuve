package zeroday.skinrejuve

import io.ktor.server.application.*
import zeroday.skinrejuve.auth.AuthRepository
import zeroday.skinrejuve.auth.BootstrapAdminService
import zeroday.skinrejuve.auth.BootstrapClinicDataService
import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.config.DatabaseConfig
import zeroday.skinrejuve.config.MailConfig
import zeroday.skinrejuve.db.DatabaseFactory
import zeroday.skinrejuve.plugins.*

fun main(args: Array<String>) = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val appConfig = AppConfig.from(environment.config)
    val databaseConfig = DatabaseConfig.from(environment.config)
    val mailConfig = MailConfig.from(environment.config)

    DatabaseFactory(databaseConfig).init()
    BootstrapAdminService(appConfig, AuthRepository()).ensureSuperAdmin()
    BootstrapClinicDataService().ensureSeedData()

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
