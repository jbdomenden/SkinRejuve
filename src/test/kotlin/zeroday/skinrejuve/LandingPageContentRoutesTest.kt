package zeroday.skinrejuve

import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import zeroday.skinrejuve.db.UserRole
import zeroday.skinrejuve.models.LandingPageContent

class LandingPageContentRoutesTest {
    @BeforeTest
    fun setup() {
        initTestDatabase()
        cleanDatabase()
    }

    @Test
    fun `public landing content endpoint is accessible`() = testApplication {
        application { module() }

        val response = client.get("/api/content/landing")

        assertEquals(HttpStatusCode.OK, response.status)
    }

    @Test
    fun `admin landing content update requires admin role`() = testApplication {
        application { module() }

        val patientToken = testJwt(seedUser(UserRole.PATIENT), UserRole.PATIENT)
        val adminToken = testJwt(seedUser(UserRole.ADMIN), UserRole.ADMIN)
        val body = Json.encodeToString(LandingPageContent.default())

        val denied = client.put("/api/admin/landing-content") {
            header(HttpHeaders.Authorization, "Bearer $patientToken")
            contentType(ContentType.Application.Json)
            setBody(body)
        }
        assertEquals(HttpStatusCode.Forbidden, denied.status)

        val allowed = client.put("/api/admin/landing-content") {
            header(HttpHeaders.Authorization, "Bearer $adminToken")
            contentType(ContentType.Application.Json)
            setBody(body)
        }
        assertEquals(HttpStatusCode.OK, allowed.status)
    }
}
