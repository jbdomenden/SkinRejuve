package zeroday.skinrejuve.utils

import zeroday.skinrejuve.config.AppConfig
import zeroday.skinrejuve.config.MailConfig
import zeroday.skinrejuve.db.UserRole
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.util.AttributeKey
import java.util.UUID

val APP_CONFIG_KEY = AttributeKey<AppConfig>("app-config")
val MAIL_CONFIG_KEY = AttributeKey<MailConfig>("mail-config")

fun Application.appConfig(): AppConfig = attributes[APP_CONFIG_KEY]
fun Application.mailConfig(): MailConfig = attributes[MAIL_CONFIG_KEY]

fun ApplicationCall.requireUserId(): UUID = UUID.fromString(
    authentication.principal<JWTPrincipal>()?.payload?.subject ?: throw IllegalArgumentException("Missing user identity")
)

fun ApplicationCall.requireUserRole(): UserRole = UserRole.valueOf(
    authentication.principal<JWTPrincipal>()?.payload?.getClaim("role")?.asString()
        ?: throw IllegalArgumentException("Missing user role")
)
