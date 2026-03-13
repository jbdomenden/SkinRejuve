@file:UseContextualSerialization(java.util.UUID::class)

package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.UseContextualSerialization
import java.util.UUID

@Serializable
data class Notification(val id: UUID, val userId: UUID, val title: String, val message: String)
