package zeroday.skinrejuve.routes

import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.security.requireAnyRole
import zeroday.skinrejuve.services.StaffService
import zeroday.skinrejuve.utils.ApiResponse
import zeroday.skinrejuve.utils.requireUserId
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route

fun Route.staffRoutes(staffService: StaffService) {
    authenticate("auth-jwt") {
        route("/api/staff") {
            get("/appointments") {
                call.requireAnyRole(UserRole.STAFF, UserRole.ADMIN)
                val userId = call.requireUserId()
                call.respond(ApiResponse(success = true, data = staffService.appointmentsForStaff(userId)))
            }
        }
    }
}
