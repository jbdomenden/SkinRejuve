package zeroday.skinrejuve.services

import zeroday.skinrejuve.db.Appointments
import zeroday.skinrejuve.db.PatientProfiles
import zeroday.skinrejuve.db.Services
import zeroday.skinrejuve.db.StaffProfiles
import org.jetbrains.exposed.sql.count
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

class AnalyticsService {
    fun overview(): AnalyticsOverview = transaction {
        AnalyticsOverview(
            totalPatients = PatientProfiles.selectAll().count(),
            totalStaff = StaffProfiles.selectAll().count(),
            totalServices = Services.selectAll().count(),
            totalAppointments = Appointments.selectAll().count()
        )
    }
}

data class AnalyticsOverview(
    val totalPatients: Long,
    val totalStaff: Long,
    val totalServices: Long,
    val totalAppointments: Long
)
