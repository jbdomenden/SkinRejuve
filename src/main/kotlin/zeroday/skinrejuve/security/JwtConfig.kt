package zeroday.skinrejuve.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.db.UserRole
import java.util.Date
import java.util.UUID

data class JwtPrincipalData(
    val userId: UUID,
    val email: String,
    val role: UserRole
)

class JwtConfig(private val appConfig: AppConfig) {
    private val algorithm = Algorithm.HMAC256(appConfig.jwtSecret)

    fun issuer() = appConfig.jwtIssuer
    fun audience() = appConfig.jwtAudience
    fun verifier() = JWT.require(algorithm).withIssuer(issuer()).withAudience(audience()).build()

    fun createToken(principalData: JwtPrincipalData): String {
        val expiresAt = Date(System.currentTimeMillis() + appConfig.jwtExpiresInMinutes * 60_000)
        return JWT.create()
            .withIssuer(issuer())
            .withAudience(audience())
            .withSubject(principalData.userId.toString())
            .withClaim("email", principalData.email)
            .withClaim("role", principalData.role.name)
            .withExpiresAt(expiresAt)
            .sign(algorithm)
    }
}
