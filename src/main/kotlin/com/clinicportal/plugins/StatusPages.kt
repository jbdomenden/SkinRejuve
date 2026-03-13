package com.clinicportal.plugins

import com.clinicportal.utils.ApiResponse
import com.clinicportal.utils.ForbiddenException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond

fun Application.configureStatusPages() {
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ApiResponse<Unit>(false, message = cause.message ?: "Bad request"))
        }
        exception<ForbiddenException> { call, cause ->
            call.respond(HttpStatusCode.Forbidden, ApiResponse<Unit>(false, message = cause.message ?: "Forbidden"))
        }
        exception<IllegalStateException> { call, cause ->
            call.respond(HttpStatusCode.ServiceUnavailable, ApiResponse<Unit>(false, message = cause.message ?: "Service unavailable"))
        }
        exception<Throwable> { call, _ ->
            call.respond(HttpStatusCode.InternalServerError, ApiResponse<Unit>(false, message = "Internal server error"))
        }
    }
}
