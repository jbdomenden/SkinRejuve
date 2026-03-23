package zeroday.skinrejuve.models

import kotlinx.serialization.Serializable

@Serializable
data class LandingPageContent(
    val eyebrow: String,
    val heroTitle: String,
    val heroDescription: String,
    val primaryCtaLabel: String,
    val secondaryCtaLabel: String,
    val proofCards: List<LandingInfoCard>,
    val featureTitle: String,
    val featureBullets: List<String>,
    val quickStatLabel: String,
    val quickStatValue: String,
    val quickStatDescription: String,
    val servicesHeading: String,
    val servicesSubheading: String,
    val services: List<LandingInfoCard>,
    val galleryHeading: String = "",
    val galleryDescription: String = "",
    val galleryImages: List<LandingMediaItem> = emptyList(),
    val experienceHeading: String,
    val experiencePoints: List<LandingInfoCard>,
    val contactHeading: String,
    val contactDescription: String,
    val contactPhone: String,
    val contactPhoneLabel: String,
    val socialLinks: List<LandingSocialLink>,
    val locationHeading: String,
    val address: String,
    val mapUrl: String,
    val directionsUrl: String,
    val updatedAtLabel: String
) {
    companion object {
        fun default() = LandingPageContent(
            eyebrow = "Skin Rejuve care network · since 2011",
            heroTitle = "Patient-first skin, facial, and rejuvenation care presented with a cleaner, medical-grade digital experience.",
            heroDescription = "Inspired by the structured, trust-building approach used on leading healthcare sites like The Medical City, the Skin Rejuve landing page now highlights coordinated care, visible treatment pathways, and clear access to each branch.",
            primaryCtaLabel = "Book consultation",
            secondaryCtaLabel = "Sign in to portal",
            proofCards = listOf(
                LandingInfoCard("Patient-centered flow", "Key services, branches, and contact options are surfaced early so clients can act quickly."),
                LandingInfoCard("Branch-based access", "Kamias, Timog, and Palawan details are grouped clearly for inquiries, calls, and visit planning."),
                LandingInfoCard("Credible public touchpoints", "Social, map, and profile links are preserved so patients can validate the brand through public channels.")
            ),
            featureTitle = "A modern clinic homepage built around confidence, clarity, and faster branch access.",
            featureBullets = listOf(
                "Cleaner healthcare-inspired hierarchy for services, contact, and locations",
                "Public social touchpoints preserved for discovery and clinic trust-building",
                "Portal-ready actions for consultation booking and returning-patient access"
            ),
            quickStatLabel = "Clinic network",
            quickStatValue = "3 Branches",
            quickStatDescription = "Kamias, Timog, and Palawan contact points are visible from one coordinated landing page.",
            servicesHeading = "Core care pathways at Skin Rejuve",
            servicesSubheading = "The landing page now presents treatment categories with the structure and clarity patients usually expect from premium healthcare and aesthetic brands.",
            services = listOf(
                LandingInfoCard("Facial rejuvenation", "Glow-focused facials and skin refresh treatments positioned as signature clinic experiences."),
                LandingInfoCard("Acne and clarity support", "Concern-led skin care for breakouts, congestion, uneven tone, and texture refinement."),
                LandingInfoCard("Contour and lifting care", "Non-surgical aesthetic support for sculpting, tightening, and profile definition."),
                LandingInfoCard("Consultation and continuity", "A clearer path from discovery to inquiry, booking, and follow-up through the patient portal.")
            ),
            galleryHeading = "Public gallery touchpoints",
            galleryDescription = "Replace these placeholders from the admin side with official branch or treatment imagery while keeping each card linked to a verified public source.",
            galleryImages = listOf(
                LandingMediaItem(
                    title = "Instagram highlights",
                    description = "Placeholder card for an official clinic or treatment image linked to Instagram.",
                    imageUrl = "",
                    href = "https://www.instagram.com/skinrejuveofficial/?hl=en",
                    ctaLabel = "Open Instagram"
                ),
                LandingMediaItem(
                    title = "Facebook photo feed",
                    description = "Placeholder card for public photo posts from Skin Rejuve Official on Facebook.",
                    imageUrl = "",
                    href = "https://www.facebook.com/SkinRejuveOfficial/photos/",
                    ctaLabel = "Open Facebook"
                ),
                LandingMediaItem(
                    title = "Branch profile",
                    description = "Placeholder card that can highlight a branch facade, team image, or clinic interior.",
                    imageUrl = "",
                    href = "https://www.cybo.com/PH-biz/skin-rejuve_4e",
                    ctaLabel = "Open listing"
                )
            ),
            experienceHeading = "A more clinical, polished first impression for guests and returning patients.",
            experiencePoints = listOf(
                LandingInfoCard("Structured navigation", "Visitors can move through services, social proof, branch details, and contact options without friction."),
                LandingInfoCard("Healthcare-inspired layout", "Content is grouped into clear panels and support sections similar to established medical websites."),
                LandingInfoCard("Admin-editable content", "The public experience still works with the landing-page content manager used by administrators.")
            ),
            contactHeading = "Call, message, or follow Skin Rejuve through its active public channels.",
            contactDescription = "Use the branch numbers below, continue through official social pages, or open the patient portal to manage your next visit.",
            contactPhone = "(02)7358-5950 / 0921-2318424",
            contactPhoneLabel = "Kamias branch",
            socialLinks = listOf(
                LandingSocialLink("Instagram", "https://www.instagram.com/skinrejuveofficial/?hl=en"),
                LandingSocialLink("Facebook", "https://www.facebook.com/SkinRejuveOfficial/photos/"),
                LandingSocialLink("Cybo profile", "https://www.cybo.com/PH-biz/skin-rejuve_4e")
            ),
            locationHeading = "Choose the Skin Rejuve branch that fits your day.",
            address = "Kamias · CRM Building, 116 Kamias Rd, Quezon City, 1102 Metro Manila, Philippines.",
            mapUrl = "https://www.google.com/maps?q=Skin%20Rejuve%2C%20CRM%20Building%2C%20116%20Kamias%20Rd%2C%20Quezon%20City%2C%201102%20Metro%20Manila%2C%20Philippines&output=embed",
            directionsUrl = "https://www.google.com/maps/dir//Skin+Rejuve,+CRM+Building,+116+Kamias+Rd,+Quezon+City,+1102+Kalakhang+Maynila,+Philippines/@14.6337991,121.0568409,17z",
            updatedAtLabel = "Inspired by The Medical City structure and Skin Rejuve's public branch touchpoints."
        )
    }
}

@Serializable
data class LandingInfoCard(
    val title: String,
    val description: String
)

@Serializable
data class LandingSocialLink(
    val label: String,
    val url: String
)

@Serializable
data class LandingMediaItem(
    val title: String,
    val description: String,
    val imageUrl: String = "",
    val href: String,
    val ctaLabel: String = "View source"
)
