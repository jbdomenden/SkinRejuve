package com.clinicportal.auth

import com.clinicportal.security.JwtConfig
import com.clinicportal.security.JwtPrincipalData

class JwtService(private val jwtConfig: JwtConfig) {
    fun tokenFor(user: UserRecord): String = jwtConfig.createToken(
        JwtPrincipalData(user.id, user.email, user.role)
    )
}
