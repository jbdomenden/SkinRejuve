@file:UseContextualSerialization(java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import java.util.UUID

@Serializable
data class TreatmentRecord(val id: UUID, val appointmentId: UUID, val notes: String)
