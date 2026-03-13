package com.clinicportal.routes

import com.clinicportal.db.UserRole
import com.clinicportal.security.requireAnyRole
import com.clinicportal.utils.ApiResponse
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route

fun Route.adminRoutes() {
    authenticate("auth-jwt") {
        route("/api/admin") {
            get("/dashboard") {
                call.requireAnyRole(UserRole.ADMIN)
                call.respond(ApiResponse(success = true, message = "Admin dashboard endpoint ready"))
            }
        }
    }
}
