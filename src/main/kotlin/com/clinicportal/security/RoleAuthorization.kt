package com.clinicportal.security

import com.clinicportal.db.UserRole
import com.clinicportal.utils.ForbiddenException
import com.clinicportal.utils.requireUserRole
import io.ktor.server.application.ApplicationCall

fun ApplicationCall.requireAnyRole(vararg roles: UserRole) {
    val role = requireUserRole()
    if (!roles.contains(role)) {
        throw ForbiddenException()
    }
}
