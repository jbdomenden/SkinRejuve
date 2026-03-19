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
            eyebrow = "Skin Rejuve Official · since 2011",
            heroTitle = "Quezon City skin, facial, and rejuvenation care shaped around the clinic's social presence.",
            heroDescription = "Skin Rejuve's public pages consistently point clients to glow-focused facial care, rejuvenation support, and direct booking through Facebook, Instagram, and Google. This landing page now reflects those live brand touchpoints instead of placeholder copy.",
            primaryCtaLabel = "Create patient account",
            secondaryCtaLabel = "Sign in to portal",
            proofCards = listOf(
                LandingInfoCard("Established presence", "The logo and public profiles highlight Skin Rejuve as operating since 2011."),
                LandingInfoCard("Social-first discovery", "Facebook and Instagram are surfaced as the main channels for treatment discovery and inquiries."),
                LandingInfoCard("Clinic-based access", "Google Maps and contact details anchor the experience to the Quezon City clinic location.")
            ),
            featureTitle = "Follow Skin Rejuve online, ask about treatments, and move into a secure booking flow.",
            featureBullets = listOf(
                "Browse Skin Rejuve Official on Facebook for current promotions and treatment posts",
                "Check Instagram for visual updates, clinic moments, and aesthetic care highlights",
                "Use the patient portal for authenticated booking and account access"
            ),
            quickStatLabel = "Client journey",
            quickStatValue = "Discover → Inquire → Book",
            quickStatDescription = "The landing page now mirrors the clinic's actual public flow from social discovery to portal conversion.",
            servicesHeading = "Social-led service focus",
            servicesSubheading = "Service highlights are written conservatively around the treatments and concerns Skin Rejuve publicly emphasizes across its brand channels.",
            services = listOf(
                LandingInfoCard("Facial rejuvenation", "Glow-restoring facial care and skin refresh treatments presented as core parts of the clinic brand."),
                LandingInfoCard("Acne and texture support", "Content is framed around common concern-based visits such as breakouts, texture refinement, and overall skin clarity."),
                LandingInfoCard("Lifting and contouring", "Non-surgical rejuvenation and contour-oriented care are positioned as premium clinic experiences."),
                LandingInfoCard("Clinic consultation", "Social and map touchpoints funnel visitors toward direct inquiry, scheduling, and in-clinic consultation.")
            ),
            experienceHeading = "A cleaner system across guest, patient, and admin experiences.",
            experiencePoints = listOf(
                LandingInfoCard("Editable content", "Admins can update the landing page without changing code."),
                LandingInfoCard("Protected routes", "Dashboard and admin pages now redirect away when no authenticated account is present."),
                LandingInfoCard("Stronger visual hierarchy", "The landing page uses clearer sections, stronger cards, and more polished spacing throughout.")
            ),
            contactHeading = "Reach Skin Rejuve where the clinic is already active.",
            contactDescription = "Visitors can continue through official social profiles, call the clinic, open directions, or sign in before booking.",
            contactPhone = "(02) 3494 2315",
            contactPhoneLabel = "Clinic line",
            socialLinks = listOf(
                LandingSocialLink("Facebook", "https://www.facebook.com/SkinRejuveOfficial/"),
                LandingSocialLink("Instagram", "https://www.instagram.com/skinrejuveofficial/?hl=en"),
                LandingSocialLink("Google Maps", "https://share.google/IJ0WaJVbzuNemanDF")
            ),
            locationHeading = "Visit Skin Rejuve at CRM Building, 116 Kamias Rd, Quezon City.",
            address = "Skin Rejuve, CRM Building, 116 Kamias Rd, Quezon City, 1102 Metro Manila, Philippines.",
            mapUrl = "https://www.google.com/maps?q=Skin%20Rejuve%2C%20CRM%20Building%2C%20116%20Kamias%20Rd%2C%20Quezon%20City%2C%201102%20Metro%20Manila%2C%20Philippines&output=embed",
            directionsUrl = "https://www.google.com/maps/dir//Skin+Rejuve,+CRM+Building,+116+Kamias+Rd,+Quezon+City,+1102+Kalakhang+Maynila,+Philippines/@52.3837918,4.6428787,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3397b79884a39539:0x1627c44393f96886!2m2!1d121.0568409!2d14.6337991?entry=ttu&g_ep=EgoyMDI2MDMxNS4wIKXMDSoASAFQAw%3D%3D",
            updatedAtLabel = "Based on Skin Rejuve's public social and map touchpoints."
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
