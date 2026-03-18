package zeroday.skinrejuve.auth

import zeroday.skinrejuve.utils.ApiResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import kotlinx.serialization.Serializable

fun Route.authRoutes(authService: AuthService) {
    route("/api/auth") {
        post("/register") {
            val request = call.receive<RegisterRequest>()
            val result = authService.register(request.email, request.password)
            val message = if (result.verificationEmailSent) {
                "Registration successful. Please check your email to verify your account."
            } else {
                result.emailDeliveryMessage ?: "Registration successful, but email delivery is not configured yet."
            }
            call.respond(HttpStatusCode.Created, ApiResponse(success = true, data = result, message = message))
        }

        post("/login") {
            val request = call.receive<LoginRequest>()
            val result = authService.login(request.email, request.password)
            call.respond(ApiResponse(success = true, data = result, message = "Login successful"))
        }

        get("/verify-email") {
            val token = call.request.queryParameters["token"].orEmpty()
            val ok = token.isNotBlank() && authService.verifyEmail(token)
            if (!ok) {
                call.respond(HttpStatusCode.BadRequest, ApiResponse<Unit>(false, message = "Invalid or expired token"))
                return@get
            }
            call.respond(ApiResponse<Unit>(success = true, message = "Email verified"))
        }

        post("/forgot-password") {
            val request = call.receive<ForgotPasswordRequest>()
            authService.forgotPassword(request.email)
            call.respond(ApiResponse<Unit>(success = true, message = "If account exists, reset email was sent"))
        }

        post("/reset-password") {
            val request = call.receive<ResetPasswordRequest>()
            val ok = authService.resetPassword(request.token, request.password)
            if (!ok) {
                call.respond(HttpStatusCode.BadRequest, ApiResponse<Unit>(false, message = "Invalid or expired token"))
                return@post
            }
            call.respond(ApiResponse<Unit>(success = true, message = "Password reset successful"))
        }
    }
}

@Serializable
data class RegisterRequest(val email: String, val password: String)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class ForgotPasswordRequest(val email: String)

@Serializable
data class ResetPasswordRequest(val token: String, val password: String)
