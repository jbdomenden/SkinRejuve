package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.util.UUID

@Serializable
data class PatientProfile(
    val id: UUID,
    val userId: UUID,
    val firstName: String,
    val lastName: String,
    val phone: String?,
    val dateOfBirth: LocalDate?
)
