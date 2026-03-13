@file:UseContextualSerialization(java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import zeroday.skinrejuve.db.UserRole
import java.util.UUID

@Serializable
data class User(
    val id: UUID,
    val email: String,
    val role: UserRole,
    val emailVerified: Boolean,
    val isActive: Boolean
)
