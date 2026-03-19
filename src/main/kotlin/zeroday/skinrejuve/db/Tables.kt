package zeroday.skinrejuve.db

import kotlinx.serialization.Serializable

import org.jetbrains.exposed.sql.ReferenceOption
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.javatime.datetime

object Users : Table("users") {
    val id = uuid("id")
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val role = enumerationByName("role", 32, UserRole::class)
    val emailVerified = bool("email_verified").default(false)
    val isActive = bool("is_active").default(true)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object EmailVerificationTokens : Table("email_verification_tokens") {
    val id = uuid("id")
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val token = varchar("token", 128).uniqueIndex()
    val expiresAt = datetime("expires_at")
    val consumedAt = datetime("consumed_at").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object PasswordResetTokens : Table("password_reset_tokens") {
    val id = uuid("id")
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val token = varchar("token", 128).uniqueIndex()
    val expiresAt = datetime("expires_at")
    val consumedAt = datetime("consumed_at").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object PatientProfiles : Table("patient_profiles") {
    val id = uuid("id")
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE).uniqueIndex()
    val firstName = varchar("first_name", 100)
    val lastName = varchar("last_name", 100)
    val phone = varchar("phone", 30).nullable()
    val dateOfBirth = date("date_of_birth").nullable()
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
    override val primaryKey = PrimaryKey(id)
}

object PatientIntakes : Table("patient_intakes") {
    val id = uuid("id")
    val patientId = uuid("patient_id").references(PatientProfiles.id, onDelete = ReferenceOption.CASCADE)
    val allergies = text("allergies").nullable()
    val medications = text("medications").nullable()
    val conditions = text("conditions").nullable()
    val notes = text("notes").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object PrivacyConsents : Table("privacy_consents") {
    val id = uuid("id")
    val patientId = uuid("patient_id").references(PatientProfiles.id, onDelete = ReferenceOption.CASCADE)
    val accepted = bool("accepted")
    val acceptedAt = datetime("accepted_at")
    override val primaryKey = PrimaryKey(id)
}

object StaffProfiles : Table("staff_profiles") {
    val id = uuid("id")
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE).uniqueIndex()
    val title = varchar("title", 100)
    val specialty = varchar("specialty", 120).nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object Services : Table("services") {
    val id = uuid("id")
    val name = varchar("name", 120).uniqueIndex()
    val description = text("description")
    val durationMinutes = integer("duration_minutes")
    val priceCents = integer("price_cents")
    val isActive = bool("is_active").default(true)
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object StaffServiceAssignments : Table("staff_service_assignments") {
    val id = uuid("id")
    val staffId = uuid("staff_id").references(StaffProfiles.id, onDelete = ReferenceOption.CASCADE)
    val serviceId = uuid("service_id").references(Services.id, onDelete = ReferenceOption.CASCADE)
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)

    init {
        index(true, staffId, serviceId)
    }
}

object AppointmentSlots : Table("appointment_slots") {
    val id = uuid("id")
    val staffId = uuid("staff_id").references(StaffProfiles.id, onDelete = ReferenceOption.CASCADE)
    val startAt = datetime("start_at")
    val endAt = datetime("end_at")
    val isAvailable = bool("is_available").default(true)
    override val primaryKey = PrimaryKey(id)

    init {
        index(false, staffId, startAt)
    }
}

object Appointments : Table("appointments") {
    val id = uuid("id")
    val patientId = uuid("patient_id").references(PatientProfiles.id, onDelete = ReferenceOption.CASCADE)
    val serviceId = uuid("service_id").references(Services.id)
    val slotId = uuid("slot_id").references(AppointmentSlots.id).uniqueIndex()
    val status = enumerationByName("status", 32, AppointmentStatus::class)
    val denialReason = varchar("denial_reason", 500).nullable()
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
    override val primaryKey = PrimaryKey(id)

    init {
        index(false, patientId, createdAt)
    }
}

object TreatmentRecords : Table("treatment_records") {
    val id = uuid("id")
    val appointmentId = uuid("appointment_id").references(Appointments.id, onDelete = ReferenceOption.CASCADE)
    val staffId = uuid("staff_id").references(StaffProfiles.id)
    val notes = text("notes")
    val progress = varchar("progress", 255)
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}

object Notifications : Table("notifications") {
    val id = uuid("id")
    val userId = uuid("user_id").references(Users.id, onDelete = ReferenceOption.CASCADE)
    val title = varchar("title", 150)
    val message = text("message")
    val readAt = datetime("read_at").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)
}


object LandingPageContents : Table("landing_page_contents") {
    val slug = varchar("slug", 64)
    val payload = text("payload")
    val updatedAt = datetime("updated_at")
    override val primaryKey = PrimaryKey(slug)
}

object AuditLogs : Table("audit_logs") {
    val id = uuid("id")
    val actorUserId = optReference("actor_user_id", Users.id, onDelete = ReferenceOption.SET_NULL)
    val action = varchar("action", 120)
    val entity = varchar("entity", 120)
    val entityId = varchar("entity_id", 64)
    val metadata = text("metadata").nullable()
    val createdAt = datetime("created_at")
    override val primaryKey = PrimaryKey(id)

    init {
        index(false, entity, entityId)
    }
}

@Serializable
enum class UserRole {
    PATIENT,
    STAFF,
    ADMIN
}

@Serializable
enum class AppointmentStatus {
    PENDING,
    APPROVED,
    DENIED,
    CHECKED_IN,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    NO_SHOW
}
