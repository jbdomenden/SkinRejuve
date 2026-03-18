package zeroday.skinrejuve.plugins

import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import zeroday.skinrejuve.auth.*
import zeroday.skinrejuve.routes.*
import zeroday.skinrejuve.security.JwtConfig
import zeroday.skinrejuve.services.*
import zeroday.skinrejuve.utils.ApiResponse
import zeroday.skinrejuve.utils.appConfig
import zeroday.skinrejuve.utils.mailConfig

fun Application.configureRouting() {
    val authRepository = AuthRepository()
    val mailService = MailService(mailConfig())
    val emailVerificationService = EmailVerificationService(appConfig(), authRepository, mailService)
    val passwordResetService = PasswordResetService(appConfig(), authRepository, mailService)
    val jwtService = JwtService(JwtConfig(appConfig()))
    val authService = AuthService(authRepository, jwtService, emailVerificationService, passwordResetService)

    val patientService = PatientService()
    val serviceService = ServiceService()
    val appointmentService = AppointmentService()
    val staffService = StaffService()
    val treatmentService = TreatmentService()
    val notificationService = NotificationService()
    val analyticsService = AnalyticsService()

    routing {
        get("/") {
            call.respondRedirect("/login", permanent = false)
        }

        get("/login") {
            call.respondRedirect("/frontend/login.html", permanent = false)
        }

        get("/health") {
            call.respond(ApiResponse<Unit>(success = true, message = "ok"))
        }

        staticResources("/frontend", "frontend")
        staticResources("/", "frontend")

        authRoutes(authService)
        patientRoutes(patientService)
        serviceRoutes(serviceService)
        appointmentRoutes(appointmentService, patientService)
        staffRoutes(staffService)
        treatmentRoutes(treatmentService)
        notificationRoutes(notificationService)
        analyticsRoutes(analyticsService)
        adminRoutes()
    }
}
