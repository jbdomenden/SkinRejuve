package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class Notification(val id: UUID, val userId: UUID, val title: String, val message: String)
