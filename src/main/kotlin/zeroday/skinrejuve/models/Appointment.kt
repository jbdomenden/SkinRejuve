@file:UseContextualSerialization(java.time.LocalDateTime::class, java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import zeroday.skinrejuve.db.AppointmentStatus
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class Appointment(
    val id: UUID,
    val patientId: UUID,
    val serviceId: UUID,
    val slotId: UUID,
    val status: AppointmentStatus,
    val denialReason: String?,
    val createdAt: LocalDateTime
)
