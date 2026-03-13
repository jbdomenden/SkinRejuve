package com.clinicportal.routes

import com.clinicportal.db.AppointmentStatus
import com.clinicportal.db.UserRole
import com.clinicportal.security.requireAnyRole
import com.clinicportal.services.AppointmentService
import com.clinicportal.services.PatientService
import com.clinicportal.utils.ApiResponse
import com.clinicportal.utils.requireUserId
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

fun Route.appointmentRoutes(appointmentService: AppointmentService, patientService: PatientService) {
    authenticate("auth-jwt") {
        route("/api/appointments") {
            post {
                val userId = call.requireUserId()
                val profile = patientService.findProfileByUserId(userId) ?: throw IllegalArgumentException("Profile must be completed first")
                val request = call.receive<BookAppointmentRequest>()
                val appointment = appointmentService.book(profile.id, UUID.fromString(request.serviceId), UUID.fromString(request.slotId))
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = appointment))
            }

            get("/history") {
                val userId = call.requireUserId()
                val profile = patientService.findProfileByUserId(userId) ?: throw IllegalArgumentException("Profile not found")
                call.respond(ApiResponse(success = true, data = appointmentService.history(profile.id)))
            }

            patch("/{id}/status") {
                call.requireAnyRole(UserRole.ADMIN, UserRole.STAFF)
                val request = call.receive<UpdateAppointmentStatusRequest>()
                val updated = appointmentService.updateStatus(
                    appointmentId = UUID.fromString(call.parameters["id"] ?: throw IllegalArgumentException("Appointment id is required")),
                    status = AppointmentStatus.valueOf(request.status),
                    denialReason = request.denialReason
                )
                call.respond(ApiResponse(success = true, data = updated))
            }
        }
    }
}

@Serializable
data class BookAppointmentRequest(val serviceId: String, val slotId: String)

@Serializable
data class UpdateAppointmentStatusRequest(val status: String, val denialReason: String? = null)
