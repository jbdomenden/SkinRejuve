package zeroday.skinrejuve.routes

import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.security.requireAnyRole
import zeroday.skinrejuve.services.TreatmentService
import zeroday.skinrejuve.utils.ApiResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.Serializable
import java.util.UUID

fun Route.treatmentRoutes(treatmentService: TreatmentService) {
    authenticate("auth-jwt") {
        route("/api/treatments") {
            post {
                call.requireAnyRole(UserRole.STAFF, UserRole.ADMIN)
                val request = call.receive<CreateTreatmentRecordRequest>()
                val record = treatmentService.addRecord(
                    appointmentId = UUID.fromString(request.appointmentId),
                    staffId = UUID.fromString(request.staffId),
                    notes = request.notes,
                    progress = request.progress
                )
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = record))
            }

            get("/{appointmentId}") {
                call.requireAnyRole(UserRole.STAFF, UserRole.ADMIN)
                val appointmentId = UUID.fromString(call.parameters["appointmentId"] ?: throw IllegalArgumentException("Appointment id is required"))
                call.respond(ApiResponse(success = true, data = treatmentService.byAppointment(appointmentId)))
            }
        }
    }
}

@Serializable
data class CreateTreatmentRecordRequest(
    val appointmentId: String,
    val staffId: String,
    val notes: String,
    val progress: String
)
