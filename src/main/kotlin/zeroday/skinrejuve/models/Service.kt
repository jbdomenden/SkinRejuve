package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
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
