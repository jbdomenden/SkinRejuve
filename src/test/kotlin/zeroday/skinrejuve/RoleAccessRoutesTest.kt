package zeroday.skinrejuve

import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import zeroday.skinrejuve.db.UserRole

class RoleAccessRoutesTest {
    @BeforeTest
    fun setup() {
        initTestDatabase()
        cleanDatabase()
    }

    @Test
    fun `admin route enforces admin role`() = testApplication {
        application { module() }

        val patientId = seedUser(UserRole.PATIENT)
        val adminId = seedUser(UserRole.ADMIN)
        val patientToken = testJwt(patientId, UserRole.PATIENT)
        val adminToken = testJwt(adminId, UserRole.ADMIN)

        val denied = client.get("/api/admin/dashboard") {
            header(HttpHeaders.Authorization, "Bearer $patientToken")
        }
        assertEquals(HttpStatusCode.Forbidden, denied.status)

        val allowed = client.get("/api/admin/dashboard") {
            header(HttpHeaders.Authorization, "Bearer $adminToken")
        }
        assertEquals(HttpStatusCode.OK, allowed.status)
    }

    @Test
    fun `analytics route blocks non admin`() = testApplication {
        application { module() }

        val staffId = seedUser(UserRole.STAFF)
        val token = testJwt(staffId, UserRole.STAFF)

        val res = client.get("/api/analytics/overview") {
            header(HttpHeaders.Authorization, "Bearer $token")
        }
        assertEquals(HttpStatusCode.Forbidden, res.status)
    }
}
