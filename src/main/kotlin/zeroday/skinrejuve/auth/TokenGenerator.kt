package zeroday.skinrejuve.auth

import java.security.MessageDigest
import java.util.UUID

object TokenGenerator {
    fun generateRawToken(): String = UUID.randomUUID().toString().replace("-", "")

    fun hashToken(token: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(token.toByteArray())
            .joinToString("") { "%02x".format(it) }
    }
}
