@file:UseContextualSerialization(java.time.LocalDateTime::class, java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class AvailableAppointmentSlot(
    val id: UUID,
    val staffId: UUID,
    val startAt: LocalDateTime,
    val endAt: LocalDateTime,
    val isAvailable: Boolean
)
