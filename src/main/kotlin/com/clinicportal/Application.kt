package com.clinicportal

import com.clinicportal.config.AppConfig
import com.clinicportal.config.DatabaseConfig
import com.clinicportal.config.MailConfig
import com.clinicportal.db.DatabaseFactory
import com.clinicportal.plugins.configureCORS
import com.clinicportal.plugins.configureMonitoring
import com.clinicportal.plugins.configureRouting
import com.clinicportal.plugins.configureSecurity
import com.clinicportal.plugins.configureSerialization
import com.clinicportal.plugins.configureStatusPages
import io.ktor.server.application.Application
import io.ktor.server.application.install

fun main(args: Array<String>) = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    val appConfig = AppConfig.from(environment.config)
    val databaseConfig = DatabaseConfig.from(environment.config)
    val mailConfig = MailConfig.from(environment.config)

    DatabaseFactory(databaseConfig).init()

    install(com.clinicportal.utils.Constants.AppDependencies) {
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
