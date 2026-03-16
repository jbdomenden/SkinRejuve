package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.Notifications
import zeroday.skinrejuve.models.Notification
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.util.UUID

class NotificationService {
    fun listForUser(userId: UUID): List<Notification> = transaction {
        Notifications.selectAll().where { Notifications.userId eq userId }.map { it.toNotification() }
    }

    fun create(userId: UUID, title: String, message: String): Notification = transaction {
        val id = UUID.randomUUID()
        Notifications.insert {
            it[Notifications.id] = id
            it[Notifications.userId] = userId
            it[Notifications.title] = title
            it[Notifications.message] = message
            it[createdAt] = DateTimeUtils.now()
        }
        Notifications.selectAll().where { Notifications.id eq id }.single().toNotification()
    }

    fun markRead(notificationId: UUID) = transaction {
        Notifications.update({ Notifications.id eq notificationId }) {
            it[readAt] = DateTimeUtils.now()
        }
    }

    private fun ResultRow.toNotification() = Notification(
        id = this[Notifications.id],
        userId = this[Notifications.userId],
        title = this[Notifications.title],
        message = this[Notifications.message]
    )
}
