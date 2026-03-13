package com.clinicportal.routes

import com.clinicportal.db.UserRole
import com.clinicportal.security.requireAnyRole
import com.clinicportal.services.ServiceService
import com.clinicportal.utils.ApiResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.Serializable
import java.util.UUID

fun Route.serviceRoutes(serviceService: ServiceService) {
    route("/api/services") {
        get {
            call.respond(ApiResponse(success = true, data = serviceService.listActive()))
        }

        authenticate("auth-jwt") {
            post {
                call.requireAnyRole(UserRole.ADMIN)
                val request = call.receive<CreateServiceRequest>()
                val service = serviceService.create(request.name, request.description, request.durationMinutes, request.priceCents)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = service))
            }

            patch("/{id}/active") {
                call.requireAnyRole(UserRole.ADMIN)
                val id = UUID.fromString(call.parameters["id"] ?: throw IllegalArgumentException("Service id is required"))
                val request = call.receive<SetServiceActiveRequest>()
                serviceService.setActive(id, request.active)
                call.respond(ApiResponse<Unit>(success = true, message = "Service updated"))
            }
        }
    }
}

@Serializable
data class CreateServiceRequest(val name: String, val description: String, val durationMinutes: Int, val priceCents: Int)

@Serializable
data class SetServiceActiveRequest(val active: Boolean)
