package com.clinicportal.plugins

import com.clinicportal.security.JwtConfig
import com.clinicportal.utils.ApiResponse
import com.clinicportal.utils.appConfig
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.response.respond

fun Application.configureSecurity(appConfig: com.clinicportal.config.AppConfig = this.appConfig()) {
    val jwtConfig = JwtConfig(appConfig)
    install(Authentication) {
        jwt("auth-jwt") {
            realm = "skinrejuve"
            verifier(jwtConfig.verifier())
            validate { credential ->
                if (credential.payload.subject != null) JWTPrincipal(credential.payload) else null
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, ApiResponse<Unit>(false, message = "Unauthorized"))
            }
        }
    }
}
