package zeroday.skinrejuve.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.models.LandingPageContent
import zeroday.skinrejuve.security.requireAnyRole
import zeroday.skinrejuve.services.LandingPageContentService
import zeroday.skinrejuve.utils.ApiResponse

fun Route.landingPageContentRoutes(landingPageContentService: LandingPageContentService) {
    route("/api/content") {
        get("/landing") {
            call.respond(ApiResponse(success = true, data = landingPageContentService.getContent()))
        }
    }

    authenticate("auth-jwt") {
        route("/api/admin/landing-content") {
            get {
                call.requireAnyRole(UserRole.ADMIN)
                call.respond(ApiResponse(success = true, data = landingPageContentService.getContent()))
            }

            put {
                call.requireAnyRole(UserRole.ADMIN)
                val request = call.receive<LandingPageContent>()
                call.respond(HttpStatusCode.OK, ApiResponse(success = true, data = landingPageContentService.updateContent(request), message = "Landing page content updated"))
            }
        }
    }
}
