package com.clinicportal.models

import com.clinicportal.db.AppointmentStatus
import kotlinx.serialization.Serializable
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
