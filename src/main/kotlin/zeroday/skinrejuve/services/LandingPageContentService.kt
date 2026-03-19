package zeroday.skinrejuve.services

import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import zeroday.skinrejuve.db.LandingPageContents
import zeroday.skinrejuve.models.LandingPageContent
import zeroday.skinrejuve.utils.DateTimeUtils

class LandingPageContentService {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true }

    fun getContent(): LandingPageContent = transaction {
        LandingPageContents.selectAll().where { LandingPageContents.slug eq LANDING_PAGE_SLUG }
            .singleOrNull()
            ?.toContent()
            ?: seedDefaultLocked()
    }

    fun updateContent(content: LandingPageContent): LandingPageContent = transaction {
        val payload = json.encodeToString(LandingPageContent.serializer(), content)
        val now = DateTimeUtils.now()
        if (LandingPageContents.selectAll().where { LandingPageContents.slug eq LANDING_PAGE_SLUG }.singleOrNull() == null) {
            LandingPageContents.insert {
                it[slug] = LANDING_PAGE_SLUG
                it[this.payload] = payload
                it[updatedAt] = now
            }
        } else {
            LandingPageContents.update({ LandingPageContents.slug eq LANDING_PAGE_SLUG }) {
                it[this.payload] = payload
                it[updatedAt] = now
            }
        }
        getContent()
    }

    private fun seedDefaultLocked(): LandingPageContent {
        val default = LandingPageContent.default()
        LandingPageContents.insert {
            it[slug] = LANDING_PAGE_SLUG
            it[payload] = json.encodeToString(LandingPageContent.serializer(), default)
            it[updatedAt] = DateTimeUtils.now()
        }
        return default
    }

    private fun ResultRow.toContent(): LandingPageContent = json.decodeFromString(LandingPageContent.serializer(), this[LandingPageContents.payload])

    private companion object {
        const val LANDING_PAGE_SLUG = "default"
    }
}
