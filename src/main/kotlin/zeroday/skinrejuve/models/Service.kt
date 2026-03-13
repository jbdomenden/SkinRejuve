@file:UseContextualSerialization(java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import java.util.UUID

@Serializable
data class Service(
    val id: UUID,
    val name: String,
    val description: String,
    val durationMinutes: Int,
    val priceCents: Int,
    val isActive: Boolean
)
