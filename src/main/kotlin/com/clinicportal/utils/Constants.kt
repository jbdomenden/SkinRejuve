package com.clinicportal.utils

import com.clinicportal.config.AppConfig
import com.clinicportal.config.MailConfig
import io.ktor.server.application.Application
import io.ktor.server.application.createApplicationPlugin

object Constants {
    val AppDependencies = createApplicationPlugin("AppDependencies", ::AppDependenciesConfig) {
        application.attributes.put(APP_CONFIG_KEY, pluginConfig.appConfig)
        application.attributes.put(MAIL_CONFIG_KEY, pluginConfig.mailConfig)
    }
}

class AppDependenciesConfig {
    lateinit var appConfig: AppConfig
    lateinit var mailConfig: MailConfig
}
