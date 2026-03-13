package zeroday.skinrejuve

import zeroday.skinrejuve.db.AppointmentSlots
import zeroday.skinrejuve.db.AppointmentStatus
import zeroday.skinrejuve.db.PatientProfiles
import zeroday.skinrejuve.db.Services
import zeroday.skinrejuve.db.StaffProfiles
import zeroday.skinrejuve.db.Users
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.services.AppointmentService
import zeroday.skinrejuve.utils.DateTimeUtils
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.UUID
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class AppointmentRulesIntegrationTest {
    @BeforeTest
    fun setup() {
        initTestDatabase()
        cleanDatabase()
    }

    @Test
    fun `booking rules and status transitions are enforced`() {
        val appointmentService = AppointmentService()

        val patientId = UUID.randomUUID()
        val serviceId = UUID.randomUUID()
        val pastSlot = UUID.randomUUID()
        val futureSlot = UUID.randomUUID()

        transaction {
            val now = DateTimeUtils.now()
            val patientUserId = UUID.randomUUID()
            val staffUserId = UUID.randomUUID()
            val staffId = UUID.randomUUID()

            Users.insert {
                it[id] = patientUserId
                it[email] = "patient@test.local"
                it[passwordHash] = "x"
                it[role] = UserRole.PATIENT
                it[emailVerified] = true
                it[isActive] = true
                it[createdAt] = now
                it[updatedAt] = now
            }
            Users.insert {
                it[id] = staffUserId
                it[email] = "staff@test.local"
                it[passwordHash] = "x"
                it[role] = UserRole.STAFF
                it[emailVerified] = true
                it[isActive] = true
                it[createdAt] = now
                it[updatedAt] = now
            }

            StaffProfiles.insert {
                it[id] = staffId
                it[userId] = staffUserId
                it[title] = "Doctor"
                it[specialty] = "Skin"
                it[createdAt] = now
            }

            PatientProfiles.insert {
                it[id] = patientId
                it[userId] = patientUserId
                it[firstName] = "P"
                it[lastName] = "A"
                it[phone] = "123"
                it[dateOfBirth] = null
                it[createdAt] = now
                it[updatedAt] = now
            }

            Services.insert {
                it[id] = serviceId
                it[name] = "Laser"
                it[description] = "Laser treatment"
                it[durationMinutes] = 30
                it[priceCents] = 10000
                it[isActive] = true
                it[createdAt] = now
            }

            AppointmentSlots.insert {
                it[id] = pastSlot
                it[staffId] = staffId
                it[startAt] = now.minusHours(1)
                it[endAt] = now.minusMinutes(30)
                it[isAvailable] = true
            }
            AppointmentSlots.insert {
                it[id] = futureSlot
                it[staffId] = staffId
                it[startAt] = now.plusHours(3)
                it[endAt] = now.plusHours(4)
                it[isAvailable] = true
            }
        }

        assertFailsWith<IllegalArgumentException> {
            appointmentService.book(patientId, serviceId, pastSlot)
        }

        val created = appointmentService.book(patientId, serviceId, futureSlot)
        assertEquals(AppointmentStatus.PENDING, created.status)

        assertFailsWith<IllegalArgumentException> {
            appointmentService.book(patientId, serviceId, futureSlot)
        }

        assertFailsWith<IllegalArgumentException> {
            appointmentService.updateStatus(created.id, AppointmentStatus.DENIED, null)
        }

        appointmentService.updateStatus(created.id, AppointmentStatus.COMPLETED)
        assertFailsWith<IllegalArgumentException> {
            appointmentService.updateStatus(created.id, AppointmentStatus.CANCELLED)
        }
    }
}
