package zeroday.skinrejuve.plugins

import zeroday.skinrejuve.config.AppConfig
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS

fun Application.configureCORS(appConfig: AppConfig) {
    install(CORS) {
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Patch)
        allowMethod(HttpMethod.Delete)
        allowCredentials = true
        appConfig.allowedOrigins.forEach { origin ->
            allowHost(origin.removePrefix("https://").removePrefix("http://"), schemes = listOf("http", "https"))
        }
    }
}
