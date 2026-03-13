package com.clinicportal.models

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class PatientIntake(
    val id: UUID,
    val patientId: UUID,
    val allergies: String?,
    val medications: String?,
    val conditions: String?,
    val notes: String?
)
