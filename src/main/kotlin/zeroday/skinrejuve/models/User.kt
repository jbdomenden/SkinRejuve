package zeroday.skinrejuve.models

import zeroday.skinrejuve.db.UserRole
import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class User(
    val id: UUID,
    val email: String,
    val role: UserRole,
    val emailVerified: Boolean,
    val isActive: Boolean
)
