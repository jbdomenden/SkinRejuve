package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class TreatmentRecord(val id: UUID, val appointmentId: UUID, val notes: String)
