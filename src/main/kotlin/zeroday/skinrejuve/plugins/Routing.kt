package zeroday.skinrejuve.plugins

import zeroday.skinrejuve.auth.AuthRepository
import zeroday.skinrejuve.auth.AuthService
import zeroday.skinrejuve.auth.EmailVerificationService
import zeroday.skinrejuve.auth.JwtService
import zeroday.skinrejuve.auth.PasswordResetService
import zeroday.skinrejuve.auth.authRoutes
import zeroday.skinrejuve.routes.adminRoutes
import zeroday.skinrejuve.routes.analyticsRoutes
import zeroday.skinrejuve.routes.appointmentRoutes
import zeroday.skinrejuve.routes.notificationRoutes
import zeroday.skinrejuve.routes.patientRoutes
import zeroday.skinrejuve.routes.serviceRoutes
import zeroday.skinrejuve.routes.staffRoutes
import zeroday.skinrejuve.routes.treatmentRoutes
import zeroday.skinrejuve.security.JwtConfig
import zeroday.skinrejuve.services.AnalyticsService
import zeroday.skinrejuve.services.AppointmentService
import zeroday.skinrejuve.services.MailService
import zeroday.skinrejuve.services.NotificationService
import zeroday.skinrejuve.services.PatientService
import zeroday.skinrejuve.services.ServiceService
import zeroday.skinrejuve.services.StaffService
import zeroday.skinrejuve.services.TreatmentService
import zeroday.skinrejuve.utils.ApiResponse
import zeroday.skinrejuve.utils.appConfig
import zeroday.skinrejuve.utils.mailConfig
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing

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
        get("/health") {
            call.respond(ApiResponse(success = true, message = "ok"))
        }

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
