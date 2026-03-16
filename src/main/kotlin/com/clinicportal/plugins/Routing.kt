package com.clinicportal.plugins

import com.clinicportal.auth.AuthRepository
import com.clinicportal.auth.AuthService
import com.clinicportal.auth.EmailVerificationService
import com.clinicportal.auth.JwtService
import com.clinicportal.auth.PasswordResetService
import com.clinicportal.auth.authRoutes
import com.clinicportal.routes.adminRoutes
import com.clinicportal.routes.appointmentRoutes
import com.clinicportal.routes.patientRoutes
import com.clinicportal.routes.serviceRoutes
import com.clinicportal.security.JwtConfig
import com.clinicportal.services.AppointmentService
import com.clinicportal.services.MailService
import com.clinicportal.services.PatientService
import com.clinicportal.services.ServiceService
import com.clinicportal.utils.ApiResponse
import com.clinicportal.utils.appConfig
import com.clinicportal.utils.mailConfig
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

    routing {
        get("/health") {
            call.respond(ApiResponse(success = true, message = "ok"))
        }

        authRoutes(authService)
        patientRoutes(patientService)
        serviceRoutes(serviceService)
        appointmentRoutes(appointmentService, patientService)
        adminRoutes()
    }
}
