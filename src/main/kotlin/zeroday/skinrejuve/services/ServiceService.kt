package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.Services
import zeroday.skinrejuve.models.Service
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.util.UUID

class ServiceService {
    fun listActive(): List<Service> = transaction {
        Services.selectAll().where { Services.isActive eq true }.map { it.toService() }
    }

    fun create(name: String, description: String, durationMinutes: Int, priceCents: Int): Service = transaction {
        require(durationMinutes > 0) { "Duration must be positive" }
        require(priceCents >= 0) { "Price must be non-negative" }

        val id = UUID.randomUUID()
        Services.insert {
            it[Services.id] = id
            it[Services.name] = name
            it[Services.description] = description
            it[Services.durationMinutes] = durationMinutes
            it[Services.priceCents] = priceCents
            it[isActive] = true
            it[createdAt] = DateTimeUtils.now()
        }
        Services.selectAll().where { Services.id eq id }.single().toService()
    }

    fun setActive(serviceId: UUID, active: Boolean) = transaction {
        Services.update({ Services.id eq serviceId }) {
            it[isActive] = active
        }
    }

    private fun ResultRow.toService(): Service = Service(
        id = this[Services.id],
        name = this[Services.name],
        description = this[Services.description],
        durationMinutes = this[Services.durationMinutes],
        priceCents = this[Services.priceCents],
        isActive = this[Services.isActive]
    )
}
