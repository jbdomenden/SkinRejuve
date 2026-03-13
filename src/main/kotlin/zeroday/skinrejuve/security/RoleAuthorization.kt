package zeroday.skinrejuve.security

import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.utils.ForbiddenException
import zeroday.skinrejuve.utils.requireUserRole
import io.ktor.server.application.ApplicationCall

fun ApplicationCall.requireAnyRole(vararg roles: UserRole) {
    val role = requireUserRole()
    if (!roles.contains(role)) {
        throw ForbiddenException()
    }
}
