package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class StaffProfile(val id: UUID, val userId: UUID, val title: String)
