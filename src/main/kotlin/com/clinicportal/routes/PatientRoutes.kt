package com.clinicportal.routes

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
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.Serializable
import java.time.LocalDate

fun Route.patientRoutes(patientService: PatientService) {
    authenticate("auth-jwt") {
        route("/api/patient") {
            get("/profile") {
                val userId = call.requireUserId()
                val profile = patientService.findProfileByUserId(userId)
                call.respond(ApiResponse(success = true, data = profile))
            }

            post("/profile") {
                val userId = call.requireUserId()
                val request = call.receive<UpsertPatientProfileRequest>()
                val profile = patientService.upsertProfile(userId, request.firstName, request.lastName, request.phone, request.dateOfBirth?.let(LocalDate::parse))
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = profile))
            }

            post("/intake") {
                val userId = call.requireUserId()
                val profile = patientService.findProfileByUserId(userId) ?: throw IllegalArgumentException("Profile required before intake")
                val request = call.receive<PatientIntakeRequest>()
                val intake = patientService.saveIntake(profile.id, request.allergies, request.medications, request.conditions, request.notes)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = intake))
            }
        }
    }
}

@Serializable
data class UpsertPatientProfileRequest(
    val firstName: String,
    val lastName: String,
    val phone: String? = null,
    val dateOfBirth: String? = null
)

@Serializable
data class PatientIntakeRequest(
    val allergies: String? = null,
    val medications: String? = null,
    val conditions: String? = null,
    val notes: String? = null
)
