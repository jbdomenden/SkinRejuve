package zeroday.skinrejuve.auth

import zeroday.skinrejuve.security.JwtConfig
import zeroday.skinrejuve.security.JwtPrincipalData

class JwtService(private val jwtConfig: JwtConfig) {
    fun tokenFor(user: UserRecord): String = jwtConfig.createToken(
        JwtPrincipalData(user.id, user.email, user.role)
    )
}
