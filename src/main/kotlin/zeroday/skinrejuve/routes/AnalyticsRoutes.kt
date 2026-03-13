package zeroday.skinrejuve.routes

import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.security.requireAnyRole
import zeroday.skinrejuve.services.AnalyticsService
import zeroday.skinrejuve.utils.ApiResponse
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route

fun Route.analyticsRoutes(analyticsService: AnalyticsService) {
    authenticate("auth-jwt") {
        route("/api/analytics") {
            get("/overview") {
                call.requireAnyRole(UserRole.ADMIN)
                call.respond(ApiResponse(success = true, data = analyticsService.overview()))
            }
        }
    }
}
