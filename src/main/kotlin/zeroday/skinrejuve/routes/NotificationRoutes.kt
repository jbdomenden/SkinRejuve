package zeroday.skinrejuve.routes

import zeroday.skinrejuve.services.NotificationService
import zeroday.skinrejuve.utils.ApiResponse
import zeroday.skinrejuve.utils.requireUserId
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

fun Route.notificationRoutes(notificationService: NotificationService) {
    authenticate("auth-jwt") {
        route("/api/notifications") {
            get {
                val userId = call.requireUserId()
                call.respond(ApiResponse(success = true, data = notificationService.listForUser(userId)))
            }

            post {
                val userId = call.requireUserId()
                val request = call.receive<CreateNotificationRequest>()
                val notification = notificationService.create(userId, request.title, request.message)
                call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = notification))
            }

            patch("/{id}/read") {
                val id = UUID.fromString(call.parameters["id"] ?: throw IllegalArgumentException("Notification id is required"))
                notificationService.markRead(id)
                call.respond(ApiResponse<Unit>(success = true, message = "Notification updated"))
            }
        }
    }
}

@Serializable
data class CreateNotificationRequest(val title: String, val message: String)
