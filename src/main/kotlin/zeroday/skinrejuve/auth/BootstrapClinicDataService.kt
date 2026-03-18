package zeroday.skinrejuve.auth

import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import zeroday.skinrejuve.db.AppointmentSlots
import zeroday.skinrejuve.db.Services
import zeroday.skinrejuve.db.StaffProfiles
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.security.PasswordHasher
import zeroday.skinrejuve.utils.DateTimeUtils
import java.time.LocalDateTime
import java.util.UUID

class BootstrapClinicDataService {
    fun ensureSeedData() = transaction {
        val now = DateTimeUtils.now()
        ensureStaff(now)
        ensureServices(now)
        ensureSlots(now)
    }

    private fun ensureStaff(now: LocalDateTime): UUID {
        val existingStaff = StaffProfiles.selectAll().singleOrNull()
        if (existingStaff != null) return existingStaff[StaffProfiles.id]

        val userId = UUID.randomUUID()
        Users.insert {
            it[id] = userId
            it[email] = "staff@skinrejuve.local"
            it[passwordHash] = PasswordHasher.hash("StaffPass123!")
            it[role] = UserRole.STAFF
            it[emailVerified] = true
            it[isActive] = true
            it[createdAt] = now
            it[updatedAt] = now
        }

        val staffId = UUID.randomUUID()
        StaffProfiles.insert {
            it[id] = staffId
            it[StaffProfiles.userId] = userId
            it[title] = "Skin Specialist"
            it[specialty] = "Aesthetic Care"
            it[createdAt] = now
        }
        return staffId
    }

    private fun ensureServices(now: LocalDateTime) {
        if (Services.selectAll().limit(1).firstOrNull() != null) return

        listOf(
            arrayOf("Acne Laser", "Advanced acne laser treatment", "60", "350000"),
            arrayOf("Hydra Facial", "Deep cleansing and hydration facial", "45", "250000"),
            arrayOf("Skin Consultation", "Initial doctor consultation", "30", "150000")
        ).forEach { seed ->
            Services.insert {
                it[id] = UUID.randomUUID()
                it[name] = seed[0]
                it[description] = seed[1]
                it[durationMinutes] = seed[2].toInt()
                it[priceCents] = seed[3].toInt()
                it[isActive] = true
                it[createdAt] = now
            }
        }
    }

    private fun ensureSlots(now: LocalDateTime) {
        if (AppointmentSlots.selectAll().limit(1).firstOrNull() != null) return
        val staffId = ensureStaff(now)
        val firstSlotStart = now.plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0)
        (0 until 10).forEach { dayOffset ->
            val start = firstSlotStart.plusDays(dayOffset.toLong())
            AppointmentSlots.insert {
                it[id] = UUID.randomUUID()
                it[AppointmentSlots.staffId] = staffId
                it[startAt] = start
                it[endAt] = start.plusMinutes(60)
                it[isAvailable] = true
            }
        }
    }
}
