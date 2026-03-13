@file:UseContextualSerialization(java.time.LocalDate::class, java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
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
