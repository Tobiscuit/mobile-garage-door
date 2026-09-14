# Copy — rewrite, facts check and questions

## 1. Voice and method

I wrote as a senior conversion copywriter for local home services, in **the brand's own voice**, which the business stored in its settings (migration `0005_seed_settings.sql`):

> **Voice:** "Professional yet approachable. We speak like experienced technicians who genuinely care about homeowners. Direct, no-nonsense language with warmth… Avoid corporate jargon—sound like a trusted neighbor who happens to be an expert."
> **Tone:** "Confident and reassuring. Customers are often stressed (broken door, security concern)…"
> **Avoid:** "Cheap, discount, budget… Avoid fear-mongering language… Avoid overly salesy phrases like 'act now' or 'limited time'."

The old copy came from a January 2026 "techno" template and broke those rules on nearly every line: "We kill the risks", "System Critical?", "Deployment Zones", "Establishing Uplink…", "Don't get trapped". The rewrite applies five rules:

1. **Say what and where.** Every page heading names the service in customers' words and, where it's natural, Houston (the `h1` on home, services and about). The city list appears once, not in every heading (Google names "blocks of text that list cities" as keyword stuffing).
2. **Labels match destinations.** A link says what happens when you tap it: "Request service" opens the request form, "Builder portal login" opens the login.
3. **Plain words, sentence case.** No split "accent" headings. No uppercase shouting in the translations.
4. **Never add a fact.** Only rephrase what the site already claims, and never make a claim stronger. When a translation had drifted stronger than the English, it now matches the English.
5. **Native-quality translations.** Spanish in formal *usted*, for Houston-area Spanish speakers. Vietnamese in the neutral *bạn* register the site already uses. Brand, product and place names don't change between locales.

Database content — service, testimonial, project and post text, About-page stats and values — is out of scope and unchanged.

`copy.md`'s tables are generated from the same change set that edited `messages/*.json` (before = `origin/develop`), so the record can't drift from the code.

## 2. Facts: what the site claims, and how each claim was treated

I classified every claim by **evidence in the repository's history**, and since 2026-09-14 by Tobias's own answers.

### Tier A — facts Tobias set deliberately
Kept, and used in prominent copy and in structured data.

| Fact | Evidence |
|---|---|
| Name "Mobil Garage Door" | Logo; commit `18ad1a7` "update phone and address strategy to Mobil persona" |
| Phone **832-419-1293** | `18ad1a7` replaced the placeholder `555-000-0000` with it. Tobias confirmed on 2026-09-14 that it is the working line |
| **24/7 emergency calls**, for example a customer locked out of their garage | Tobias, 2026-09-14: he takes emergency calls around the clock, for example when someone is locked out of their garage. He gave no response time, so the copy adds none |
| Service areas: Greater Katy & West Houston · The Woodlands & North Houston · Sugar Land & Richmond · Houston Interior & Heights; "Houston & surrounding areas" | `eba7e4b` "update deployment zones to **real Houston areas** and clean up placeholders" |
| **Since 2000** | `d351bd7` "update since 2014→2000" (and "Years in Business 10+ → 25+" in the database) |
| Domain `mobilgaragedoor.com` | `40e35f7` (metadataBase set to production domain); `wrangler.jsonc` routes |
| Services: springs, openers, off-track and stuck doors, new installations, builder and contractor work | The services the site lists (services page copy, live service records), the request flow and the portfolio |
| Houston, Texas | Portfolio copy ("across Texas"), project fallback "Houston, TX" |

### Tier B — template-era claims
These entered with the Jan–Feb 2026 template redesigns (`4a08694`, `a56acfa`, `990274c`, `97bb413`, `05692f7`, `b09a805`, `9a3bdc6`) and were never confirmed. **Each is preserved where it already was, at the same or lower prominence.** None is used in titles, meta descriptions or structured data. Tobias should verify or remove each; ⚠ marks the highest risk.

| Claim | Where |
|---|---|
| Typically on-site within 2 hours; wait time under 2 minutes; 2-hour arrival window; "within hours, not days"; "contact you within minutes" | home hero, value stack, services section, contact form |
| Volume pricing, guaranteed scheduling, white-label installation, bulk pricing | home contractor panel, contact hero |
| No hidden fees; flat-rate pricing approved before work starts | value stack |
| Background-checked, uniformed, drug-tested W-2 employees; no random subcontractors | value stack |
| "No-headache" guarantee | value stack badge |
| Stats: 58m average response; ⚠ 12% faster than the market; 3 active technicians; 842 projects this year; 100% satisfaction; 5-star; 5,000+ repairs; 1.2k+ total projects | home "By the numbers", services, portfolio |
| Industrial-grade parts; "highest-rated components in the industry"; smart doors add value and security | services page |
| ⚠ Authorized dealer and installer for LiftMaster, Chamberlain, Amarr, Clopay | services page. Trademark authorisation claims need the dealer agreements |
| Secure transmission · 256-bit encryption | contact form |
| Service area "Houston metro + 50 miles" (was "Houston Metro + 50mi") | contact page map caption. The footer names four areas, not a radius. A Google Business Profile can't use a radius either (areas must be cities or postal codes) |
| Emails `dispatch@mobilgarage.com`, `privacy@mobilegaragedoor.com` | contact and privacy pages. ⚠ No mailbox can receive mail at either: undecided, see §3.3. Unchanged |

### Removed — claims Tobias confirmed are not true (2026-09-14)
Tobias answered question C5: the licence, insurer, BBB, IDA and "#1" claims are not real. Every licence, insurance, accreditation, membership and ranking claim is gone from every page in all three languages, together with the generic lines that rested on them. Where a section existed only to hold them, it now holds facts he confirmed (tier A).

| Claim (es and vi said the same) | Where | Now |
|---|---|---|
| "State License #9942-B-RES" and "Liberty Mutual • $2M Agg", under "Official Data" | footer, on every public page | The column is gone. The brand column now ends with **"24/7 emergency calls"** above the phone link |
| "Fully licensed and insured" and "$2M in liability coverage per project site" | home value stack, first card | **"24/7 emergency calls": "Locked out of your garage? Call 832-419-1293, day or night."** |
| "Rated #1 by local contractors" | home builders panel, fine print | Removed. The panel keeps its heading, description and links, so nothing was left empty |
| "Licensed, insured and accredited" over four tiles: License "TX Registered & Bonded" and Insurance "$2M Policy" (from the dashboard settings row, or code fallbacks), "IDA member: Certified technicians", "Rating: A+ BBB accredited" | about page | **"Mobil Garage Door at a glance"**: "Locked out of your garage? We take emergency calls around the clock." Tiles: emergency calls 24/7, phone (tel link), service area, in business since 2000 |
| "…and license and insurance details" | about page meta description | "…and takes emergency calls 24/7." |
| "Licensed & Insured" (`home.licensed_insured`) | No component renders it, but the public layout passes the whole message catalogue to the client, so it was in every public page's source | Deleted |

- **Structured data** never carried these claims. The JSON-LD guard now also rejects `hasCredential`, `hasCertification`, `memberOf` and `award`, the schema.org Organization properties that would carry them.
- **Dashboard.** The settings form's License Number, Liability Insurance and BBB Rating fields are unchanged, because that is dashboard functionality. The about page now selects only `id` and `mission_statement` from the settings row, so whatever those fields hold can't reach a public page. The smoke suite stores sentinel values in them, then scans every public page in every locale, including the inline hydration payload, for the sentinels and for every claim above.
- **Still live and still unconfirmed** (tier B, above): arrival and wait times, "5-star rated" and "100%" satisfaction, the stat counts, background-checked W-2 technicians, the "no-headache" guarantee, and the dealer authorisations. Tobias didn't address these, so they stay flagged in C5.

### Removed — UI the code proves false, or that does nothing
Removing these adds nothing and changes no behaviour.

| Removed | Proof |
|---|---|
| "ID: 4871-VERIFIED" / "ID: 8742-VERIFIED" badges on testimonials | Computed in `TrustIndicators.tsx` as `1000 + ((i + 1) * 3871) % 9000` from the array index. Presenting testimonials as verified when nothing verifies them is the kind of misrepresentation the FTC's reviews rule (effective 2024-10-21) targets |
| "System Online • Accepting Jobs", "SYSTEMS OPERATIONAL", pulsing green dots | Static strings in JSX and messages |
| "Real-time fleet metrics and verified project feedback" | The metrics are constants in `TrustIndicators.tsx` |
| "In your area" under the technician count | The constant `'3'`; the site never reads the visitor's location |
| "Verified" in "5-Star Verified" and "Verified Installs" | No verification exists in the code |
| "Sort By: Date (Newest) \| Scale" | Plain `<span>`s with `cursor-pointer` and no handler; the list is always newest first |
| "5 MIN READ" on every blog card | One constant for every post |
| "IMG_MISSING_001" on project cards without photos | A debug string, shown on every live project today |
| Footer `href="#"` links: the four service areas, "SLA Documentation", "Terms of Service", "Sitemap" | They go nowhere. Areas stay as text; no terms page exists (question) |
| Footer "IG" / "LN" circles | `<div>`s styled as buttons, no links |
| 🚨 emoji in contact strings | Decorative; screen readers read "police car light" |
| "Online" pulsing status and "Initializing Uplink..." on the service-area map; "Active Sector" | Static strings in `ServiceAreaMap.tsx`; relabelled "Service area" and "Loading map…" |

### Softened (⬇), never strengthened
- "We Fix It Now." → dropped; the stated arrival time stays
- "A system that makes failure impossible" → "We built our process to prevent that"
- "Don't get trapped" → removed (fear)
- "The premier automated access solution" → what, where, for whom, since when
- "Our engineers are ready to architect the perfect access solution" → "we'll help you choose the right door"
- "Our techs are ready to deploy" / "standing by" → describes the real request flow
- "Expert technicians" → "technicians"
- "Delivers industrial-grade security and performance" → what the company does
- "DISPATCH TECHNICIAN NOW" → "Request emergency service" (the button opens the payment step)
- "Read our Service Level Agreement" → "Ask about our service terms" (it linked to the contact form)
- "We don't sell doors. We sell Security." → "We don't *just* sell doors. We sell security." (they do sell doors)

### Translation drift corrected
- **Hero arrival time, es.** Said "llega en **menos de** 2 horas" (arrives in under 2 hours). The English says "**typically** within 2 hours". The Spanish now says "normalmente llega en un plazo de 2 horas".

## 3. Questions for Tobias

### 3.1 Answered on 2026-09-14
| # | Question | Answer | What changed |
|---|---|---|---|
| C4 | Is "24/7" true for phone *and* dispatch? | Yes. 832-419-1293 is the working line, and he takes emergency calls around the clock, for example garage lockouts | "24/7" moved to tier A. The lockout example is on the home value stack and the about page. No response time was added. Opening hours stay out of the JSON-LD, because 24/7 covers emergency calls, not every service (`seo.md` §4.5) |
| C5 (part) | The licence number, insurer, IDA membership, BBB rating and "#1" ranking | Not real | All removed, in all three languages (§2 "Removed — claims Tobias confirmed are not true") |
| C10 | Which email address is real? | Undecided | Nothing changed. The findings are recorded as an open decision (§3.3) |

### 3.2 Still open
These are claims that would help conversion but that the site doesn't make today, so the copy leaves them out, plus the tier-B claims nobody has confirmed yet.

| # | Would help | What I need |
|---|---|---|
| C1 | Real review proof (Google rating and count, with a link) | Profile URL; permission to show the rating with its source and date |
| C2 | Warranty terms (the footer offers "Submit a warranty claim", but nothing says what the warranty covers) | The written terms |
| C3 | The **$99 trip fee** up front, before the form. The request flow charges `99.00`, and the booking copy says the fee is "credited towards your repair" (and renders it as "The 9 Trip Fee", a pre-existing bug in the out-of-scope `booking` namespace) | Confirm the amount and the credit policy |
| C5 (rest) | The remaining tier-B claims in §2: dealer authorisations (LiftMaster, Chamberlain, Amarr, Clopay), arrival and wait times, "5-star rated" and "100%" satisfaction, the stat counts, background-checked W-2 technicians, the "no-headache" guarantee | Proof or removal |
| C6 | Owner or team names and photos ("who shows up at my house") | Names, roles, photos, consent |
| C7 | Real project photos (every live project shows a placeholder) | Photos uploaded through the dashboard (database content) |
| C8 | Same-day service (the database's company values say "Same-day service is our standard") | Confirm before it appears in page copy |
| C9 | A terms of service page (the login page tells users they agree to one) | The terms text |

### 3.3 Open decision: email addresses
Tobias hasn't decided which address is real, so **no address changes in this PR**, and none goes into the JSON-LD. The coordinating session found that none of the addresses the code uses can receive mail. I re-checked the DNS records with DNS-over-HTTPS (Cloudflare's resolver) on 2026-09-14 at 02:55 UTC:

| Address | Used by | DNS |
|---|---|---|
| `dispatch@mobilgarage.com` | contact page, contact card (`mailto:`) | `mobilgarage.com` is a different domain, parked at NameBright (nameservers `nsg1`/`nsg2.namebrightdns.com`). **No MX record** |
| `privacy@mobilegaragedoor.com` | privacy policy | `mobilegaragedoor.com` (note the extra "e") is parked with Afternic, a domain marketplace (nameservers `ns1`/`ns2.afternic.com`), where the coordinating session found it listed for sale. **Null MX** (`0 .`: RFC 7505's "this domain accepts no mail") |
| `dispatch@mobilegaragedoor.com` | the dashboard's email replies: the SES "from" default in `dashboard/emails/actions.ts` (used when `SES_FROM_ADDRESS` is unset), also hard-coded in `features/admin/emails/ChatInterface.tsx` | The same misspelled, for-sale domain |
| `service@mobilgaragedoor.com` (settings default, VAPID subject), `noreply@mobilgaragedoor.com` (`lib/email.ts` sender) | dashboard and notifications | The site's own domain, but **it has no MX records**. Without one, senders fall back to the domain's A records (RFC 5321's implicit MX), and those are Cloudflare proxy addresses (`104.21.34.11`, `172.67.194.176`), not a mail server |

**Decision for Tobias:** pick the mailbox, then either publish MX records for `mobilgaragedoor.com` (and SPF, DKIM and DMARC before sending from it) or name another address he controls. Once that's decided, a follow-up changes the contact card, the privacy policy and the dashboard default together.

## 4. Structure changes that moved copy
- **Two `h1`s became one.** The home contractor panel became an `h2` (`hero.contractor_title`). The services page's two `h1`s became `services_page.title` plus two `h2` path cards.
- **Split headings merged into one translatable string.** `*_accent` keys (e.g. "Garage" + "Intel"), which forced English word order on es and vi, are gone.
- **Hard-coded English moved into messages.** The header "DASHBOARD" (`nav.dashboard`); the about page tiles (their English "LICENSE", "INSURANCE", "IDA MEMBER" and "RATING" labels went with the claims; the new tiles read `about_page.*_label/_value`); privacy data labels (`privacy.*_label`); every contact success, status and ASAP string (`contact_page.*`); the footer, which read the English messages in every locale because it called `getTranslations('footer')` without a locale.
- **Phone links.** The number is interpolated from one constant (`{phone}`) and rendered as `tel:+18324191293` (RFC 3966 global form). The visible format stays `832-419-1293`.

## 5. Every change, before → after

### `nav`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `portfolio` | en | Portfolio | Projects | "Portfolio" is agency language; homeowners look for "projects". URL stays /portfolio. | no claim |
|  | es | Portafolio | Proyectos |  |  |
|  | vi | Dự án đã thực hiện | Dự án |  |  |
| `login` | en | Portal Login | Portal Login | es: natural word order ("Portal de Acceso" read as a proper name). en/vi unchanged. | no claim |
|  | es | Portal de Acceso | Acceso al portal |  |  |
|  | vi | Đăng nhập cổng thông tin | Đăng nhập cổng thông tin |  |  |
| `dashboard` | en | — | Dashboard | Was a hard-coded English "DASHBOARD" in every locale. | no claim |
|  | es | — | Panel |  |  |
|  | vi | — | Bảng điều khiển |  |  |
| `call` | en | — | Call {phone} | Header click-to-call (the number the site already shows). | ✅ tier A kept |
|  | es | — | Llame al {phone} |  |  |
|  | vi | — | Gọi {phone} |  |  |
| `call_short` | en | — | Call | Mobile action bar and 48px header call button label. | ✅ tier A kept |
|  | es | — | Llamar |  |  |
|  | vi | — | Gọi |  |  |
| `request_service` | en | — | Request service | Header and mobile action bar link to the existing request form. | no claim |
|  | es | — | Solicitar servicio |  |  |
|  | vi | — | Yêu cầu dịch vụ |  |  |
| `menu_open` | en | — | Open menu | Accessible name for the menu button (was an English-only aria-label). | no claim |
|  | es | — | Abrir menú |  |  |
|  | vi | — | Mở menu |  |  |
| `menu_close` | en | — | Close menu | Accessible name when the menu is open. | no claim |
|  | es | — | Cerrar menú |  |  |
|  | vi | — | Đóng menu |  |  |
| `main_navigation` | en | — | Main | Label for the header <nav> landmark. | no claim |
|  | es | — | Principal |  |  |
|  | vi | — | Chính |  |  |
| `quick_actions` | en | — | Quick actions | Label for the mobile action bar landmark. | no claim |
|  | es | — | Acciones rápidas |  |  |
|  | vi | — | Thao tác nhanh |  |  |
| `skip_to_content` | en | — | Skip to main content | New skip link (WCAG 2.4.1). | no claim |
|  | es | — | Saltar al contenido principal |  |  |
|  | vi | — | Chuyển đến nội dung chính |  |  |

### `hero`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `eyebrow` | en | — | Since 2000 · Houston & surrounding areas | Leads with the two strongest real facts: time in business and service area. | ✅ tier A kept |
|  | es | — | Desde 2000 · Houston y áreas cercanas |  |  |
|  | vi | — | Từ năm 2000 · Houston và khu vực lân cận |  |  |
| `title` | en | — | Garage door repair and installation in Houston | The one h1: says what and where in the words customers search with (replaces two competing h1s). | ✅ tier A kept |
|  | es | — | Reparación e instalación de puertas de garaje en Houston |  |  |
|  | vi | — | Sửa chữa và lắp đặt cửa gara tại Houston |  |  |
| `lead` | en | — | We fix stuck doors, broken springs, openers and off-track doors, and install new doors for homeowners and builders. | Names the services the site lists (stuck door, springs, openers, off-track, new installs, builders) in one plain sentence. | ✅ tier A kept |
|  | es | — | Reparamos puertas atoradas, resortes rotos, abridores y puertas descarriladas, e instalamos puertas nuevas para propietarios y constructores. |  |  |
|  | vi | — | Chúng tôi sửa cửa bị kẹt, lò xo gãy, bộ mở cửa và cửa lệch ray, đồng thời lắp đặt cửa mới cho chủ nhà và nhà xây dựng. |  |  |
| `call` | en | — | Call {phone} | Primary hero action for urgent callers. | ✅ tier A kept |
|  | es | — | Llame al {phone} |  |  |
|  | vi | — | Gọi {phone} |  |  |
| `door_stuck` | en | Door Stuck? | *(removed)* | Headline replaced by the descriptive h1 above ("Door Stuck?"). | ⬇ claim softened, nothing added |
|  | es | ¿Puerta Atorada? | *(removed)* |  |  |
|  | vi | Cửa bị kẹt? | *(removed)* |  |  |
| `fix_now` | en | We Fix It Now. | *(removed)* | "We Fix It Now." promised immediacy the site does not support; the arrival claim below is the stated one. | ⬇ claim softened, nothing added |
|  | es | La Reparamos Ya. | *(removed)* |  |  |
|  | vi | Chúng tôi sửa ngay lập tức. | *(removed)* |  |  |
| `emergency_badge` | en | 24/7 Emergency Response | 24/7 emergency response | Sentence case, same claim, same place. 24/7 confirmed by Tobias on 2026-09-14 (he takes emergency calls around the clock). | ✅ tier A kept |
|  | es | Respuesta de Emergencia 24/7 | Respuesta de emergencia 24/7 |  |  |
|  | vi | Phản ứng khẩn cấp 24/7 | Ứng cứu khẩn cấp 24/7 |  |  |
| `left_desc` | en | Don't get trapped. Our Rapid Response fleet is typically on-site within 2 hours. | Our rapid response team is typically on-site within 2 hours. | Drops "Don't get trapped" (the brand voice says: avoid fear-mongering). es previously said "llega en menos de 2 horas" (arrives in under 2 hours), stronger than the English "typically within": now matches. | ✅ tier B kept, not amplified |
|  | es | No se quede atrapado. Nuestra flotilla de respuesta rápida llega en menos de 2 horas. | Nuestro equipo de respuesta rápida normalmente llega en un plazo de 2 horas. |  |  |
|  | vi | Đừng để bị kẹt. Đội ngũ Phản ứng nhanh của chúng tôi thường có mặt tại hiện trường trong vòng 2 giờ. | Đội phản ứng nhanh của chúng tôi thường có mặt trong vòng 2 giờ. |  |  |
| `ai_diagnosis` | en | Live AI Diagnosis | Try the live AI diagnosis | Descriptive link text instead of a label. | no claim |
|  | es | Diagnóstico AI en Vivo | Pruebe el diagnóstico con IA en vivo |  |  |
|  | vi | Chẩn đoán AI trực tiếp | Thử chẩn đoán AI trực tiếp |  |  |
| `request_callback` → `request_service` | en | Request Callback | Request service | The link opens the service request form, not a callback request; the label now matches the destination. | no claim |
|  | es | Solicitar Llamada | Solicitar servicio |  |  |
|  | vi | Yêu cầu gọi lại | Yêu cầu dịch vụ |  |  |
| `wait_time` | en | Wait time: < 2 minutes | Wait time: under 2 minutes | Same claim, same position, written out instead of "<". | ✅ tier B kept, not amplified |
|  | es | Tiempo de espera: < 2 minutos | Tiempo de espera: menos de 2 minutos |  |  |
|  | vi | Thời gian chờ: < 2 phút | Thời gian chờ: dưới 2 phút |  |  |
| `rated_badge` | en | Rated #1 by Local Contractors | *(removed)* | "Rated #1 by Local Contractors" (es: "#1 Entre Contratistas Locales") is not true (Tobias, 2026-09-14). The line is gone; the builders panel keeps its heading, description and links. | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | #1 Entre Contratistas Locales | *(removed)* |  |  |
|  | vi | Được xếp hạng #1 bởi các nhà thầu địa phương | *(removed)* |  |  |
| `contractor_eyebrow` | en | — | For builders & contractors | Labels the secondary path so it cannot be mistaken for the emergency one. | no claim |
|  | es | — | Para constructores y contratistas |  |  |
|  | vi | — | Dành cho nhà thầu và nhà xây dựng |  |  |
| `contractor_title` | en | The Contractor's | Garage doors for home builders and general contractors | Was "The Contractor's / Secret Weapon." (a second h1, now an h2). Plain words a builder searches for. | no claim |
|  | es | El Arma Secreta | Puertas de garaje para constructores de viviendas y contratistas generales |  |  |
|  | vi | Vũ khí bí mật | Cửa gara cho nhà xây dựng nhà ở và tổng thầu |  |  |
| `secret_weapon` | en | Secret Weapon. | *(removed)* | Merged into contractor_title. | ⬇ claim softened, nothing added |
|  | es | del Contratista. | *(removed)* |  |  |
|  | vi | của nhà thầu. | *(removed)* |  |  |
| `right_desc` | en | Volume pricing, guaranteed scheduling, and white-label installation for home builders and general contractors. | Volume pricing, guaranteed scheduling and white-label installation. | The audience moved into the heading; the three claims are unchanged. | ✅ tier B kept, not amplified |
|  | es | Precios por volumen, horarios garantizados e instalación marca blanca para constructores y contratistas generales. | Precios por volumen, horarios garantizados e instalación de marca blanca. |  |  |
|  | vi | Giá ưu đãi theo khối lượng, lịch trình đảm bảo và lắp đặt nhãn trắng cho các nhà xây dựng nhà ở và nhà thầu tổng hợp. | Giá theo khối lượng, lịch trình được đảm bảo và lắp đặt nhãn trắng. |  |  |
| `view_catalog` | en | View Deployment Catalog | See our installation projects | "View Deployment Catalog" is jargon for the projects page it links to. | no claim |
|  | es | Ver Catálogo de Proyectos | Ver nuestros proyectos de instalación |  |  |
|  | vi | Xem danh mục triển khai | Xem các dự án lắp đặt |  |  |
| `builder_portal` | en | Builder Portal | Builder portal login | Says the link goes to a login. | no claim |
|  | es | Portal de Constructores | Acceso al portal de constructores |  |  |
|  | vi | Cổng thông tin nhà thầu | Đăng nhập cổng nhà thầu |  |  |
| `proof_label` | en | — | About our service | Accessible name of the hero proof card. | no claim |
|  | es | — | Sobre nuestro servicio |  |  |
|  | vi | — | Về dịch vụ của chúng tôi |  |  |
| `areas_heading` | en | — | Service areas | Heading for the service areas the footer already lists (area names are not translated). | ✅ tier A kept |
|  | es | — | Áreas de servicio |  |  |
|  | vi | — | Khu vực phục vụ |  |  |

### `services_landing`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `heading` | en | Diagnosis & | What we fix and install | Was "Diagnosis & / Solutions." Plain and specific. | no claim |
|  | es | Diagnóstico y | Lo que reparamos e instalamos |  |  |
|  | vi | Chẩn đoán & | Những gì chúng tôi sửa chữa và lắp đặt |  |  |
| `heading_accent` | en | Solutions. | *(removed)* | Merged into heading. | ⬇ claim softened, nothing added |
|  | es | Soluciones. | *(removed)* |  |  |
|  | vi | Giải pháp. | *(removed)* |  |  |
| `subheading` | en | Identify your issue below. We deploy the right specialist within hours, not days. | Find your problem below. We send the right specialist within hours, not days. | "Deploy" is jargon; same response-time claim. | ✅ tier B kept, not amplified |
|  | es | Identifique su problema abajo. Desplegamos al especialista indicado en horas, no días. | Encuentre su problema abajo. Enviamos al especialista indicado en horas, no en días. |  |  |
|  | vi | Xác định vấn đề của bạn bên dưới. Chúng tôi triển khai chuyên gia phù hợp trong vòng vài giờ, không phải vài ngày. | Tìm vấn đề của bạn bên dưới. Chúng tôi cử đúng chuyên gia trong vài giờ, không phải vài ngày. |  |  |
| `high_priority` | en | High Priority | Priority repair | Says what gets priority. | no claim |
|  | es | Alta Prioridad | Reparación prioritaria |  |  |
|  | vi | Ưu tiên cao | Sửa chữa ưu tiên |  |  |
| `cta_portal` | en | Access Pro Portal | Contractor inquiry | "Access Pro Portal" linked to the contact form, not a portal: the label now matches the destination. | no claim |
|  | es | Acceder Portal Pro | Consulta para contratistas |  |  |
|  | vi | Truy cập Cổng thông tin chuyên nghiệp | Yêu cầu dành cho nhà thầu |  |  |
| `cta_gallery` | en | Browse Gallery | See installation projects | Descriptive link text. | no claim |
|  | es | Ver Galería | Ver proyectos de instalación |  |  |
|  | vi | Duyệt thư viện ảnh | Xem dự án lắp đặt |  |  |
| `cta_emergency` | en | Request Emergency Tech | Get emergency repair help | Links to the hero (#repair), which holds the call and request actions. | no claim |
|  | es | Solicitar Técnico de Emergencia | Obtener ayuda de reparación urgente |  |  |
|  | vi | Yêu cầu kỹ thuật viên khẩn cấp | Nhận hỗ trợ sửa chữa khẩn cấp |  |  |

### `value_stack`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `badge` | en | The "No-Headache" Guarantee | Our "no-headache" guarantee | Sentence case; same claim. | ✅ tier B kept, not amplified |
|  | es | La Garantía "Sin Dolor de Cabeza" | Nuestra garantía "sin dolores de cabeza" |  |  |
|  | vi | Đảm bảo "Không Đau Đầu" | Cam kết "không đau đầu" của chúng tôi |  |  |
| `title` | en | — | We handle the risks other contractors ignore. | Was "We kill the risks / that others ignore." Same idea without the aggression the brand voice rules out. | no claim |
|  | es | — | Nos encargamos de los riesgos que otros contratistas ignoran. |  |  |
|  | vi | — | Chúng tôi xử lý những rủi ro mà các nhà thầu khác bỏ qua. |  |  |
| `title_1` | en | We kill the risks | *(removed)* | Merged into title. | ⬇ claim softened, nothing added |
|  | es | Eliminamos los riesgos | *(removed)* |  |  |
|  | vi | Chúng tôi loại bỏ mọi rủi ro | *(removed)* |  |  |
| `title_2` | en | that others ignore. | *(removed)* | Merged into title. | ⬇ claim softened, nothing added |
|  | es | que otros ignoran. | *(removed)* |  |  |
|  | vi | mà những người khác bỏ qua. | *(removed)* |  |  |
| `desc` | en | Most contractors fail on schedule, price, or quality. We engineered a system that makes failure impossible. | Most contractors slip on schedule, price or quality. We built our process to prevent that. | "A system that makes failure impossible" is an absolute no one can promise; softened. | ⬇ claim softened, nothing added |
|  | es | La mayoría de contratistas fallan en tiempo, precio o calidad. Nosotros diseñamos un sistema que hace imposible fallar. | La mayoría de los contratistas fallan en tiempos, precio o calidad. Diseñamos nuestro proceso para evitarlo. |  |  |
|  | vi | Hầu hết các nhà thầu thất bại về tiến độ, giá cả hoặc chất lượng. Chúng tôi đã thiết kế một hệ thống giúp loại bỏ mọi khả năng thất bại. | Hầu hết các nhà thầu gặp vấn đề về tiến độ, giá cả hoặc chất lượng. Chúng tôi xây dựng quy trình để ngăn điều đó. |  |  |
| `sla_link` | en | Read our Service Level Agreement | Ask about our service terms | "Read our Service Level Agreement" linked to the contact form; no agreement document exists on the site. | ⬇ claim softened, nothing added |
|  | es | Lea nuestro Acuerdo de Nivel de Servicio | Pregunte por nuestras condiciones de servicio |  |  |
|  | vi | Đọc Thỏa thuận Mức Dịch vụ của chúng tôi | Hỏi về điều khoản dịch vụ của chúng tôi |  |  |
| `licensed_title` | en | Fully Licensed & Insured | *(removed)* | "Fully Licensed & Insured" is not true (Tobias, 2026-09-14). The card now holds the confirmed 24/7 emergency line (emergency_title). | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Licencia y Seguro Completos | *(removed)* |  |  |
|  | vi | Được cấp phép & Bảo hiểm đầy đủ | *(removed)* |  |  |
| `licensed_desc` | en | $2M Liability Coverage per project site. | *(removed)* | "$2M Liability Coverage per project site" rested on the same insurance claim: removed. | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | $2M de cobertura de responsabilidad por sitio. | *(removed)* |  |  |
|  | vi | Bảo hiểm trách nhiệm 2 triệu đô la cho mỗi công trường dự án. | *(removed)* |  |  |
| `emergency_title` | en | — | 24/7 emergency calls | Replaces the licence card with a fact Tobias confirmed on 2026-09-14: he takes emergency calls around the clock. | ✅ tier A kept |
|  | es | — | Llamadas de emergencia 24/7 |  |  |
|  | vi | — | Cuộc gọi khẩn cấp 24/7 |  |  |
| `emergency_desc` | en | — | Locked out of your garage? Call {phone}, day or night. | Tobias's own example of an emergency call (a garage lockout) and the confirmed line. No response time is promised. | ✅ tier A kept |
|  | es | — | ¿No puede entrar a su garaje? Llame al {phone}, de día o de noche. |  |  |
|  | vi | — | Không vào được gara? Hãy gọi {phone}, dù ngày hay đêm. |  |  |
| `fees_title` | en | Zero Hidden Fees | No hidden fees | Sentence case; same claim. | ✅ tier B kept, not amplified |
|  | es | Cero Cargos Ocultos | Sin cargos ocultos |  |  |
|  | vi | Không có phí ẩn | Không phí ẩn |  |  |
| `fees_desc` | en | Flat-rate pricing approved before we start. | Flat-rate pricing you approve before we start. | Active voice: says who approves. | ✅ tier B kept, not amplified |
|  | es | Precios fijos aprobados antes de comenzar. | Precio fijo que usted aprueba antes de empezar. |  |  |
|  | vi | Giá cố định được phê duyệt trước khi chúng tôi bắt đầu. | Giá trọn gói được bạn duyệt trước khi chúng tôi bắt đầu. |  |  |
| `window_title` | en | 2-Hour Window | 2-hour arrival window | Says what the window is for. | ✅ tier B kept, not amplified |
|  | es | Ventana de 2 Horas | Ventana de llegada de 2 horas |  |  |
|  | vi | Khoảng thời gian 2 giờ | Khung giờ đến 2 tiếng |  |  |
| `background_title` | en | Background Checked | Background-checked technicians | Says who is checked. | ✅ tier B kept, not amplified |
|  | es | Verificación de Antecedentes | Técnicos con verificación de antecedentes |  |  |
|  | vi | Kiểm tra lý lịch | Kỹ thuật viên đã được kiểm tra lý lịch |  |  |
| `background_desc` | en | Uniformed, drug-tested W2 employees. No random subs. | Uniformed, drug-tested W-2 employees, never random subcontractors. | Spells out "subs"; same claims. | ✅ tier B kept, not amplified |
|  | es | Empleados uniformados, W2, con pruebas antidoping. Sin subcontratistas. | Empleados W-2 uniformados y con pruebas antidoping, nunca subcontratistas al azar. |  |  |
|  | vi | Nhân viên W2 có đồng phục, được kiểm tra ma túy. Không thuê ngoài ngẫu nhiên. | Nhân viên W-2 mặc đồng phục, đã kiểm tra ma túy, không bao giờ thuê thầu phụ ngẫu nhiên. |  |  |

### `trust`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `title` | en | Operational Status. | By the numbers | Was "Operational Status." — the section is not a live status. | 🗑 false by construction, removed |
|  | es | Estado Operacional. | En cifras |  |  |
|  | vi | Tình trạng hoạt động. | Những con số |  |  |
| `subtitle` | en | Real-time fleet metrics and verified project feedback. | Our track record, and what customers say about our work. | "Real-time fleet metrics and verified project feedback" was false by construction: the numbers are constants and nothing verifies the testimonials. | 🗑 false by construction, removed |
|  | es | Métricas de flota en tiempo real y comentarios de proyectos verificados. | Nuestra trayectoria y lo que dicen los clientes de nuestro trabajo. |  |  |
|  | vi | Số liệu thống kê đội xe theo thời gian thực và phản hồi dự án đã xác minh. | Thành tích của chúng tôi và nhận xét của khách hàng về công việc. |  |  |
| `system_online` | en | System Online • Accepting Jobs | *(removed)* | "System Online • Accepting Jobs" with a pulsing dot was a static string, not a status. | 🗑 false by construction, removed |
|  | es | Sistema en Línea • Aceptando Trabajos | *(removed)* |  |  |
|  | vi | Hệ thống trực tuyến • Đang nhận việc | *(removed)* |  |  |
| `avg_response` | en | Avg Response Time | Average response time | Sentence case; number (58m) unchanged in code. | ✅ tier B kept, not amplified |
|  | es | Tiempo Promedio de Respuesta | Tiempo promedio de respuesta |  |  |
|  | vi | Thời gian phản hồi trung bình | Thời gian phản hồi trung bình |  |  |
| `avg_response_diff` | en | -12% vs Market | 12% faster than the market | "-12% vs Market" written out; same comparative claim (flagged: no source). | ✅ tier B kept, not amplified |
|  | es | -12% vs el Mercado | 12% más rápido que el mercado |  |  |
|  | vi | -12% so với thị trường | Nhanh hơn thị trường 12% |  |  |
| `active_techs` | en | Active Technicians | Active technicians | Sentence case; number (3) unchanged in code. | ✅ tier B kept, not amplified |
|  | es | Técnicos Activos | Técnicos activos |  |  |
|  | vi | Kỹ thuật viên đang hoạt động | Kỹ thuật viên đang hoạt động |  |  |
| `in_your_area` | en | In Your Area | *(removed)* | "In Your Area" sat under a constant; the site does not know where the visitor is. | 🗑 false by construction, removed |
|  | es | En Su Área | *(removed)* |  |  |
|  | vi | Trong khu vực của bạn | *(removed)* |  |  |
| `projects_completed` | en | Projects Completed | Projects completed | Sentence case; number (842) unchanged. | ✅ tier B kept, not amplified |
|  | es | Proyectos Completados | Proyectos completados |  |  |
|  | vi | Dự án đã hoàn thành | Dự án đã hoàn thành |  |  |
| `this_year` | en | This Year | This year | Sentence case. | ✅ tier B kept, not amplified |
|  | es | Este Año | Este año |  |  |
|  | vi | Năm nay | Năm nay |  |  |
| `satisfaction` | en | Customer Satisfaction | Customer satisfaction | Sentence case; number (100%) unchanged. | ✅ tier B kept, not amplified |
|  | es | Satisfacción del Cliente | Satisfacción del cliente |  |  |
|  | vi | Mức độ hài lòng của khách hàng | Mức độ hài lòng của khách hàng |  |  |
| `five_star` | en | 5-Star Verified | 5-star rated | "5-Star Verified": no verification exists, so "Verified" is dropped; the rating claim stays. | ⬇ claim softened, nothing added |
|  | es | Verificado 5 Estrellas | Calificación de 5 estrellas |  |  |
|  | vi | Xác minh 5 sao | Đánh giá 5 sao |  |  |
| `no_reviews` | en | No verified reviews available at this time. | No customer reviews to show yet. | Drops "verified" (nothing verifies them). | 🗑 false by construction, removed |
|  | es | No hay reseñas verificadas disponibles en este momento. | Todavía no hay reseñas de clientes para mostrar. |  |  |
|  | vi | Không có đánh giá đã xác minh vào lúc này. | Chưa có đánh giá nào của khách hàng. |  |  |
| `rating_label` | en | — | Rated {rating} out of 5 | Text equivalent for the star icons (WCAG 1.1.1). Rating comes from the testimonial record. | no claim |
|  | es | — | Calificación: {rating} de 5 |  |  |
|  | vi | — | Đánh giá {rating} trên 5 |  |  |
| `testimonials_heading` | en | — | What customers say | Visible h3 so the testimonials have a heading. | no claim |
|  | es | — | Lo que dicen nuestros clientes |  |  |
|  | vi | — | Khách hàng nói gì |  |  |

### `footer`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `brand_description` | en | The premier automated access solution for residential builders and discerning homeowners. | Garage door repair and installation for Houston-area homeowners and builders since 2000. | "The premier automated access solution for… discerning homeowners" was puffery and jargon; replaced with what, where, for whom and since when. | ✅ tier A kept |
|  | es | La solución principal de acceso automatizado para constructores residenciales y propietarios exigentes. | Reparación e instalación de puertas de garaje para propietarios y constructores del área de Houston desde 2000. |  |  |
|  | vi | Giải pháp truy cập tự động hàng đầu cho các nhà thầu xây dựng nhà ở và chủ nhà có yêu cầu cao. | Sửa chữa và lắp đặt cửa gara cho chủ nhà và nhà xây dựng khu vực Houston từ năm 2000. |  |  |
| `deployment_zones` | en | Deployment Zones | Service areas | Plain words. The area names themselves are unchanged (and no longer dead links). | ✅ tier A kept |
|  | es | Zonas de Servicio | Áreas de servicio |  |  |
|  | vi | Khu vực triển khai | Khu vực phục vụ |  |  |
| `client_support` | en | Client Support | Customer support | Plain words. | no claim |
|  | es | Soporte al Cliente | Atención al cliente |  |  |
|  | vi | Hỗ trợ khách hàng | Hỗ trợ khách hàng |  |  |
| `warranty_claim` | en | Submit Warranty Claim | Submit a warranty claim | Sentence case. | no claim |
|  | es | Enviar Reclamo de Garantía | Presentar un reclamo de garantía |  |  |
|  | vi | Gửi yêu cầu bảo hành | Gửi yêu cầu bảo hành |  |  |
| `builder_portal` | en | Builder Portal | Builder portal login | Says the link goes to a login. | no claim |
|  | es | Portal de Constructores | Acceso al portal de constructores |  |  |
|  | vi | Cổng thông tin nhà thầu | Đăng nhập cổng nhà thầu |  |  |
| `emergency_callback` | en | Emergency Callback Request | Request emergency service | The link opens the request form, not a callback. | no claim |
|  | es | Solicitud de Llamada de Emergencia | Solicitar servicio de emergencia |  |  |
|  | vi | Yêu cầu gọi lại khẩn cấp | Yêu cầu dịch vụ khẩn cấp |  |  |
| `sla_docs` | en | SLA Documentation | *(removed)* | "SLA Documentation" was a dead href="#" link. | 🗑 false by construction, removed |
|  | es | Documentación SLA | *(removed)* |  |  |
|  | vi | Tài liệu SLA | *(removed)* |  |  |
| `official_data` | en | Official Data | *(removed)* | "Official Data" headed a block that held only the state licence number and the insurer, neither of which is true (Tobias, 2026-09-14). The column is gone; the brand column now ends with the 24/7 emergency line and the phone link (emergency_heading). | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Datos Oficiales | *(removed)* |  |  |
|  | vi | Dữ liệu chính thức | *(removed)* |  |  |
| `state_license` | en | State License | *(removed)* | "State License" labelled "#9942-B-RES", which is not a real licence (Tobias, 2026-09-14). | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Licencia Estatal | *(removed)* |  |  |
|  | vi | Giấy phép tiểu bang | *(removed)* |  |  |
| `insurance` | en | Insurance | *(removed)* | "Insurance" labelled "Liberty Mutual • $2M Agg", which is not real (Tobias, 2026-09-14). | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Seguro | *(removed)* |  |  |
|  | vi | Bảo hiểm | *(removed)* |  |  |
| `emergency_heading` | en | — | 24/7 emergency calls | Replaces the licence block with a confirmed fact: a heading in the brand column, directly above the phone link. | ✅ tier A kept |
|  | es | — | Llamadas de emergencia 24/7 |  |  |
|  | vi | — | Cuộc gọi khẩn cấp 24/7 |  |  |
| `hq_dispatch` | en | HQ Dispatch | *(removed)* | "HQ Dispatch" block replaced by the service areas list and the contact block. | ⬇ claim softened, nothing added |
|  | es | Despacho Central | *(removed)* |  |  |
|  | vi | Điều phối từ trụ sở | *(removed)* |  |  |
| `rapid_response` | en | Rapid Response Unit | *(removed)* | "Rapid Response Unit" was a label, not a fact. | ⬇ claim softened, nothing added |
|  | es | Unidad de Respuesta Rápida | *(removed)* |  |  |
|  | vi | Đơn vị phản ứng nhanh | *(removed)* |  |  |
| `terms` | en | Terms of Service | *(removed)* | "Terms of Service" was a dead href="#" link; no terms page exists (question for Tobias). | 🗑 false by construction, removed |
|  | es | Términos de Servicio | *(removed)* |  |  |
|  | vi | Điều khoản dịch vụ | *(removed)* |  |  |
| `sitemap` | en | Sitemap | *(removed)* | "Sitemap" was a dead href="#" link. | 🗑 false by construction, removed |
|  | es | Mapa del Sitio | *(removed)* |  |  |
|  | vi | Sơ đồ trang web | *(removed)* |  |  |
| `systems_operational` | en | SYSTEMS OPERATIONAL | *(removed)* | "SYSTEMS OPERATIONAL" with a green dot was a static string. | 🗑 false by construction, removed |
|  | es | SISTEMAS OPERACIONALES | *(removed)* |  |  |
|  | vi | HỆ THỐNG HOẠT ĐỘNG | *(removed)* |  |  |
| `areas_note` | en | — | Houston & surrounding areas | Was hard-coded English under "HQ Dispatch". | ✅ tier A kept |
|  | es | — | Houston y áreas cercanas |  |  |
|  | vi | — | Houston và khu vực lân cận |  |  |
| `explore` | en | — | Explore | Heading for crawlable links to every main page. | no claim |
|  | es | — | Explorar |  |  |
|  | vi | — | Khám phá |  |  |
| `nav_services` | en | — | Services | Footer navigation. | no claim |
|  | es | — | Servicios |  |  |
|  | vi | — | Dịch vụ |  |  |
| `nav_projects` | en | — | Projects | Footer navigation. | no claim |
|  | es | — | Proyectos |  |  |
|  | vi | — | Dự án |  |  |
| `nav_blog` | en | — | Blog | Footer navigation. | no claim |
|  | es | — | Blog |  |  |
|  | vi | — | Blog |  |  |
| `nav_about` | en | — | About | Footer navigation. | no claim |
|  | es | — | Nosotros |  |  |
|  | vi | — | Về chúng tôi |  |  |
| `nav_contact` | en | — | Request service | Footer navigation to the request form. | no claim |
|  | es | — | Solicitar servicio |  |  |
|  | vi | — | Yêu cầu dịch vụ |  |  |
| `call` | en | — | Call {phone} | Click-to-call in the footer. | ✅ tier A kept |
|  | es | — | Llame al {phone} |  |  |
|  | vi | — | Gọi {phone} |  |  |
| `copyright` | en | — | © {year} Mobil Garage Door. All rights reserved. | Same text as common.copyright; the footer now reads one namespace (and in the page's locale — it was always English). | no claim |
|  | es | — | © {year} Mobil Garage Door. Todos los derechos reservados. |  |  |
|  | vi | — | © {year} Mobil Garage Door. Mọi quyền được bảo lưu. |  |  |
| `privacy_policy` | en | — | Privacy policy | As above. | no claim |
|  | es | — | Política de privacidad |  |  |
|  | vi | — | Chính sách bảo mật |  |  |

### `services_page`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `title` | en | — | Garage door repair and installation services | The page had two h1s ("Something Broken?" and "Something New?"); this is its one h1. | ✅ tier A kept |
|  | es | — | Servicios de reparación e instalación de puertas de garaje |  |  |
|  | vi | — | Dịch vụ sửa chữa và lắp đặt cửa gara |  |  |
| `intro` | en | — | Repairs for springs, openers and off-track doors, plus new door installations for homeowners and builders across the Houston area. | Lead paragraph summarising the listed services and area. | ✅ tier A kept |
|  | es | — | Reparación de resortes, abridores y puertas descarriladas, e instalación de puertas nuevas para propietarios y constructores en el área de Houston. |  |  |
|  | vi | — | Sửa chữa lò xo, bộ mở cửa và cửa lệch ray, cùng lắp đặt cửa mới cho chủ nhà và nhà xây dựng trên khắp khu vực Houston. |  |  |
| `rapid_response` | en | Rapid Response | Repairs | Eyebrow names the path. | no claim |
|  | es | Respuesta Rápida | Reparaciones |  |  |
|  | vi | Phản ứng nhanh | Sửa chữa |  |  |
| `broken_title` | en | Something | Something broken? | One string instead of a split accent; now an h2. | no claim |
|  | es | ¿Algo | ¿Algo se descompuso? |  |  |
|  | vi | Có gì đó | Có gì đó bị hỏng? |  |  |
| `broken_accent` | en | Broken? | *(removed)* | Merged into broken_title. | ⬇ claim softened, nothing added |
|  | es | Roto? | *(removed)* |  |  |
|  | vi | Hỏng? | *(removed)* |  |  |
| `broken_desc` | en | Springs, openers, and off-track doors. We utilize industrial-grade parts for lasting repairs. | Springs, openers and off-track doors. We use industrial-grade parts for repairs that last. | "Utilize" → "use"; same claim. | ✅ tier B kept, not amplified |
|  | es | Resortes, abridores y puertas descarriladas. Utilizamos piezas de grado industrial para reparaciones duraderas. | Resortes, abridores y puertas descarriladas. Usamos piezas de grado industrial para reparaciones duraderas. |  |  |
|  | vi | Lò xo, bộ mở cửa, và cửa lệch ray. Chúng tôi sử dụng phụ tùng cấp công nghiệp để sửa chữa bền vững. | Lò xo, bộ mở cửa và cửa lệch ray. Chúng tôi dùng phụ tùng cấp công nghiệp để sửa chữa bền lâu. |  |  |
| `dispatch_cta` | en | Dispatch Technician | Request a repair | "Dispatch Technician" promised a dispatch; the link opens the request form. | ⬇ claim softened, nothing added |
|  | es | Enviar Técnico | Solicitar una reparación |  |  |
|  | vi | Điều động kỹ thuật viên | Yêu cầu sửa chữa |  |  |
| `project_design` | en | Project & Design | New doors | Eyebrow names the path. | no claim |
|  | es | Proyecto y Diseño | Puertas nuevas |  |  |
|  | vi | Dự án & Thiết kế | Cửa mới |  |  |
| `new_title` | en | Something | Something new? | One string; now an h2. | no claim |
|  | es | ¿Algo | ¿Busca algo nuevo? |  |  |
|  | vi | Có gì đó | Muốn thứ gì đó mới? |  |  |
| `new_accent` | en | New? | *(removed)* | Merged into new_title. | ⬇ claim softened, nothing added |
|  | es | Nuevo? | *(removed)* |  |  |
|  | vi | Mới? | *(removed)* |  |  |
| `new_desc` | en | Upgrade to an insulated, smart-enabled system that increases your home's value and security. | Upgrade to an insulated, smart-enabled door that adds value and security to your home. | "System" → "door"; same claims. | ✅ tier B kept, not amplified |
|  | es | Actualice a un sistema aislado e inteligente que aumenta el valor y la seguridad de su hogar. | Cambie a una puerta aislada e inteligente que aumenta el valor y la seguridad de su hogar. |  |  |
|  | vi | Nâng cấp lên hệ thống cách nhiệt, tích hợp thông minh giúp tăng giá trị và an ninh cho ngôi nhà của bạn. | Nâng cấp lên cửa cách nhiệt, tích hợp thông minh giúp tăng giá trị và an ninh cho ngôi nhà của bạn. |  |  |
| `start_project` | en | Start Your Project | Plan your new door | Specific link text. | no claim |
|  | es | Iniciar Su Proyecto | Planee su puerta nueva |  |  |
|  | vi | Bắt đầu dự án của bạn | Lên kế hoạch cho cửa mới |  |  |
| `capabilities_heading` | en | Technical Capabilities | Everything we handle | "Technical Capabilities" is jargon. | no claim |
|  | es | Capacidades Técnicas | Todo lo que hacemos |  |  |
|  | vi | Năng lực kỹ thuật | Tất cả dịch vụ của chúng tôi |  |  |
| `capabilities_desc` | en | We don't just "swap parts". We engineer solutions for longevity using the highest rated components in the industry. | We don't just swap parts. We build repairs to last, using the highest-rated components in the industry. | "Engineer solutions for longevity" in plain words; same superlative (flagged). | ✅ tier B kept, not amplified |
|  | es | No solo "cambiamos piezas". Diseñamos soluciones para la longevidad usando los componentes mejor calificados de la industria. | No solo cambiamos piezas. Hacemos reparaciones que duran, con los componentes mejor calificados de la industria. |  |  |
|  | vi | Chúng tôi không chỉ "thay thế linh kiện". Chúng tôi thiết kế các giải pháp để đảm bảo tuổi thọ cao bằng cách sử dụng các bộ phận được đánh giá cao nhất trong ngành. | Chúng tôi không chỉ thay linh kiện. Chúng tôi sửa chữa để bền lâu, với các linh kiện được đánh giá cao nhất trong ngành. |  |  |
| `repairs_label` | en | Repairs Completed | Repairs completed | Sentence case; the label now sits above the number (5,000+, unchanged). | ✅ tier B kept, not amplified |
|  | es | Reparaciones Completadas | Reparaciones completadas |  |  |
|  | vi | Lượt sửa chữa đã hoàn thành | Lượt sửa chữa đã hoàn thành |  |  |
| `configure_service` | en | Configure Service | Request this service | "Configure Service" suggested a configurator; the link opens the request form for that service. | no claim |
|  | es | Configurar Servicio | Solicitar este servicio |  |  |
|  | vi | Cấu hình dịch vụ | Yêu cầu dịch vụ này |  |  |
| `dealer_heading` | en | Authorised Dealer & Installer For | Authorized dealer and installer for | US spelling ("Authorised" → "Authorized") for a Houston business; same claim (flagged). | ✅ tier B kept, not amplified |
|  | es | Distribuidor e Instalador Autorizado Para | Distribuidor e instalador autorizado de |  |  |
|  | vi | Đại lý & Lắp đặt ủy quyền cho | Đại lý và đơn vị lắp đặt được ủy quyền của |  |  |

### `about_page`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `heading_1` | en | We don't sell doors. | About Mobil Garage Door | The h1 names the company. The slogan moves to heading_2 below. | ✅ tier A kept |
|  | es | No vendemos puertas. | Sobre Mobil Garage Door |  |  |
|  | vi | Chúng tôi không bán cửa. | Về Mobil Garage Door |  |  |
| `heading_2` | en | We sell Security. | We don't just sell doors. We sell security. | "We don't sell doors. / We sell Security." — they do sell doors, so "just" keeps it true. | ⬇ claim softened, nothing added |
|  | es | Vendemos Seguridad. | No solo vendemos puertas. Vendemos seguridad. |  |  |
|  | vi | Chúng tôi bán An ninh. | Chúng tôi không chỉ bán cửa. Chúng tôi mang đến sự an toàn. |  |  |
| `standard_heading` | en | The Standard. | Our standard | Sentence case, no trailing period. | no claim |
|  | es | El Estándar. | Nuestro estándar |  |  |
|  | vi | Tiêu chuẩn. | Tiêu chuẩn của chúng tôi |  |  |
| `standard_desc` | en | Most contractors maximize profit by minimizing time on site. We maximize lifespan by obsessing over the install details you'll never see. | Most contractors maximize profit by minimizing time on site. We maximize your door's lifespan by caring about the install details you'll never see. | "Obsessing over" → "caring about": warmer, same promise. | no claim |
|  | es | La mayoría de contratistas maximizan ganancias minimizando tiempo en sitio. Nosotros maximizamos la vida útil obsesionándonos con los detalles de instalación que nunca verá. | La mayoría de los contratistas maximizan sus ganancias reduciendo el tiempo en obra. Nosotros maximizamos la vida útil de su puerta cuidando los detalles de instalación que usted nunca verá. |  |  |
|  | vi | Hầu hết các nhà thầu tối đa hóa lợi nhuận bằng cách giảm thiểu thời gian tại công trường. Chúng tôi tối đa hóa tuổi thọ bằng cách chú trọng đến từng chi tiết lắp đặt mà bạn sẽ không bao giờ nhìn thấy. | Hầu hết các nhà thầu tối đa hóa lợi nhuận bằng cách rút ngắn thời gian tại công trình. Chúng tôi kéo dài tuổi thọ cửa của bạn bằng cách chăm chút từng chi tiết lắp đặt mà bạn sẽ không bao giờ thấy. |  |  |
| `licensed_heading` | en | Licensed. Insured. Verified. | *(removed)* | "Licensed. Insured. Verified." headed four tiles of claims that are not true (Tobias, 2026-09-14): licence, insurance, IDA membership with certified technicians, and an A+ BBB rating. The section now holds confirmed facts (facts_heading). | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Licenciados. Asegurados. Verificados. | *(removed)* |  |  |
|  | vi | Được cấp phép. Có bảo hiểm. Đã xác minh. | *(removed)* |  |  |
| `facts_heading` | en | — | Mobil Garage Door at a glance | Heads the section rebuilt around confirmed facts: 24/7 emergency calls, the phone line, the service area and "since 2000". | ✅ tier A kept |
|  | es | — | Mobil Garage Door de un vistazo |  |  |
|  | vi | — | Thông tin nhanh về Mobil Garage Door |  |  |
| `facts_lead` | en | — | Locked out of your garage? We take emergency calls around the clock. | Tobias's answer, in his words: he takes emergency calls around the clock, for example garage lockouts. No response time is promised. | ✅ tier A kept |
|  | es | — | ¿No puede entrar a su garaje? Atendemos llamadas de emergencia las 24 horas del día. |  |  |
|  | vi | — | Không vào được gara? Chúng tôi nhận cuộc gọi khẩn cấp suốt ngày đêm. |  |  |
| `emergency_label` | en | — | Emergency calls | Tile label. | ✅ tier A kept |
|  | es | — | Llamadas de emergencia |  |  |
|  | vi | — | Cuộc gọi khẩn cấp |  |  |
| `emergency_value` | en | — | 24/7 | Tile value, as the hero and contact page already write it. | ✅ tier A kept |
|  | es | — | 24/7 |  |  |
|  | vi | — | 24/7 |  |  |
| `phone_label` | en | — | Phone | Tile label; the value is the tel: link to 832-419-1293, the confirmed line. | ✅ tier A kept |
|  | es | — | Teléfono |  |  |
|  | vi | — | Điện thoại |  |  |
| `area_label` | en | — | Service area | Tile label. | ✅ tier A kept |
|  | es | — | Área de servicio |  |  |
|  | vi | — | Khu vực phục vụ |  |  |
| `area_value` | en | — | Houston & surrounding areas | Same words as the footer and hero (tier A). | ✅ tier A kept |
|  | es | — | Houston y áreas cercanas |  |  |
|  | vi | — | Houston và khu vực lân cận |  |  |
| `since_label` | en | — | In business since | Tile label; the value is the founding year the site states (2000). | ✅ tier A kept |
|  | es | — | En servicio desde |  |  |
|  | vi | — | Hoạt động từ năm |  |  |
| `cta_heading` | en | Work with Mobil Garage Door. | Work with Mobil Garage Door | No trailing period on a heading. | no claim |
|  | es | Trabaje con Mobil Garage Door. | Trabaje con Mobil Garage Door |  |  |
|  | vi | Làm việc với Mobil Garage Door. | Làm việc cùng Mobil Garage Door |  |  |
| `cta_button` | en | Request Service | Request service | Sentence case. | no claim |
|  | es | Solicitar Servicio | Solicitar servicio |  |  |
|  | vi | Yêu cầu dịch vụ | Yêu cầu dịch vụ |  |  |
| `call_cta` | en | — | or call {phone} | Adds the real phone link beside the call-to-action. | ✅ tier A kept |
|  | es | — | o llame al {phone} |  |  |
|  | vi | — | hoặc gọi {phone} |  |  |

### `portfolio_page`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `badge` | en | Project Catalog | Our work | "Project Catalog" is catalogue language. | no claim |
|  | es | Catálogo de Proyectos | Nuestro trabajo |  |  |
|  | vi | Danh mục dự án | Công trình của chúng tôi |  |  |
| `heading` | en | Built for | Garage door installation projects | Was "Built for / Performance." — the h1 now says what the page shows. | no claim |
|  | es | Construido para el | Proyectos de instalación de puertas de garaje |  |  |
|  | vi | Được xây dựng vì | Dự án lắp đặt cửa gara |  |  |
| `heading_accent` | en | Performance. | *(removed)* | Merged into heading. | ⬇ claim softened, nothing added |
|  | es | Rendimiento. | *(removed)* |  |  |
|  | vi | Hiệu suất. | *(removed)* |  |  |
| `subheading` | en | A showcase of technical installations, custom fabrications, and rapid response deployments across Texas. | Installations, custom builds and rapid-response repairs we've completed across Texas. | "Technical installations, custom fabrications and rapid response deployments" in plain words; same scope. | ✅ tier A kept |
|  | es | Una muestra de instalaciones técnicas, fabricaciones personalizadas y despliegues de respuesta rápida en todo Texas. | Instalaciones, trabajos a medida y reparaciones de respuesta rápida que hemos realizado en todo Texas. |  |  |
|  | vi | Một minh chứng cho các công trình lắp đặt kỹ thuật, chế tạo tùy chỉnh và triển khai phản ứng nhanh trên khắp Texas. | Các công trình lắp đặt, làm theo yêu cầu và sửa chữa phản ứng nhanh chúng tôi đã thực hiện trên khắp Texas. |  |  |
| `total_deployments` | en | Total Deployments | Total projects | "Deployments" is jargon; number (1.2k+) unchanged. | ✅ tier B kept, not amplified |
|  | es | Total de Despliegues | Proyectos en total |  |  |
|  | vi | Tổng số lượt triển khai | Tổng số dự án |  |  |
| `active_houston` | en | ACTIVE IN HOUSTON METRO | Serving the Houston metro area | Sentence case. | ✅ tier A kept |
|  | es | ACTIVO EN EL ÁREA DE HOUSTON | Al servicio del área metropolitana de Houston |  |  |
|  | vi | HOẠT ĐỘNG TẠI KHU VỰC HOUSTON | Phục vụ khu vực đô thị Houston |  |  |
| `showing` | en | Showing | *(removed)* | Replaced by showing_count (one string, translatable word order). | no claim |
|  | es | Mostrando | *(removed)* |  |  |
|  | vi | Hiển thị | *(removed)* |  |  |
| `verified` | en | Verified Installs | *(removed)* | "Verified Installs": nothing verifies them. | 🗑 false by construction, removed |
|  | es | Instalaciones Verificadas | *(removed)* |  |  |
|  | vi | Công trình đã xác minh | *(removed)* |  |  |
| `showing_count` | en | — | Projects shown: {count} | Same count, without "verified". | 🗑 false by construction, removed |
|  | es | — | Proyectos mostrados: {count} |  |  |
|  | vi | — | Số dự án hiển thị: {count} |  |  |
| `sort_by` | en | Sort By: | *(removed)* | "Sort By:" labelled controls that did nothing (plain spans). | 🗑 false by construction, removed |
|  | es | Ordenar Por: | *(removed)* |  |  |
|  | vi | Sắp xếp theo: | *(removed)* |  |  |
| `sort_date` | en | Date (Newest) | *(removed)* | Non-functional sort control. | 🗑 false by construction, removed |
|  | es | Fecha (Más Reciente) | *(removed)* |  |  |
|  | vi | Ngày (Mới nhất) | *(removed)* |  |  |
| `sort_scale` | en | Scale | *(removed)* | Non-functional sort control. | 🗑 false by construction, removed |
|  | es | Escala | *(removed)* |  |  |
|  | vi | Quy mô | *(removed)* |  |  |
| `commercial_residential` | en | Commercial & Residential | Commercial & residential | Sentence case. | ✅ tier B kept, not amplified |
|  | es | Comercial y Residencial | Comercial y residencial |  |  |
|  | vi | Thương mại & Dân dụng | Thương mại và dân dụng |  |  |
| `cta_heading` | en | Need a spec sheet or | Need a spec sheet or a custom quote? | One string instead of a split accent. | no claim |
|  | es | ¿Necesita una ficha técnica o | ¿Necesita una ficha técnica o una cotización personalizada? |  |  |
|  | vi | Cần bảng thông số kỹ thuật hay | Cần bảng thông số kỹ thuật hoặc báo giá riêng? |  |  |
| `cta_accent` | en | custom quote? | *(removed)* | Merged into cta_heading. | ⬇ claim softened, nothing added |
|  | es | cotización personalizada? | *(removed)* |  |  |
|  | vi | báo giá tùy chỉnh? | *(removed)* |  |  |
| `cta_contractor` | en | Access Contractor Portal | Contractor inquiry | "Access Contractor Portal" linked to the contact form. | no claim |
|  | es | Acceder Portal de Contratistas | Consulta para contratistas |  |  |
|  | vi | Truy cập Cổng thông tin nhà thầu | Yêu cầu dành cho nhà thầu |  |  |
| `cta_general` | en | General Inquiry | General inquiry | Sentence case. | no claim |
|  | es | Consulta General | Consulta general |  |  |
|  | vi | Yêu cầu chung | Yêu cầu chung |  |  |
| `placeholder_image` | en | — | Photo coming soon | Replaces the debug text "IMG_MISSING_001" shown on every project without a photo. | 🗑 false by construction, removed |
|  | es | — | Foto próximamente |  |  |
|  | vi | — | Ảnh sẽ sớm được cập nhật |  |  |

### `portfolio_detail`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `back` | en | Back to Projects | Back to projects | Sentence case. | no claim |
|  | es | Volver a Proyectos | Volver a proyectos |  |  |
|  | vi | Quay lại Dự án | Quay lại danh sách dự án |  |  |
| `badge` | en | Project Report | Project | "Project Report" → "Project". | no claim |
|  | es | Reporte del Proyecto | Proyecto |  |  |
|  | vi | Báo cáo dự án | Dự án |  |  |
| `completion_label` | en | Completion | Completed | Reads as a label for a date. | no claim |
|  | es | Terminado | Terminado |  |  |
|  | vi | Hoàn thành | Hoàn thành |  |  |
| `challenge_heading` | en | Identifying the | The challenge | Was "Identifying the / Critical Failure." — every project is not a critical failure. | ⬇ claim softened, nothing added |
|  | es | Identificando la | El desafío |  |  |
|  | vi | Xác định | Thách thức |  |  |
| `challenge_accent` | en | Critical Failure. | *(removed)* | Merged into challenge_heading. | ⬇ claim softened, nothing added |
|  | es | Falla Crítica. | *(removed)* |  |  |
|  | vi | Lỗi nghiêm trọng. | *(removed)* |  |  |
| `challenge_badge` | en | The Challenge | *(removed)* | The heading now says it. | no claim |
|  | es | El Desafío | *(removed)* |  |  |
|  | vi | Thử thách | *(removed)* |  |  |
| `solution_heading` | en | Engineered for | Our solution | Was "Engineered for / Longevity." | ⬇ claim softened, nothing added |
|  | es | Diseñado para la | Nuestra solución |  |  |
|  | vi | Được thiết kế cho | Giải pháp của chúng tôi |  |  |
| `solution_accent` | en | Longevity. | *(removed)* | Merged into solution_heading. | ⬇ claim softened, nothing added |
|  | es | Longevidad. | *(removed)* |  |  |
|  | vi | Tuổi thọ cao. | *(removed)* |  |  |
| `solution_badge` | en | The Solution | *(removed)* | The heading now says it. | no claim |
|  | es | La Solución | *(removed)* |  |  |
|  | vi | Giải pháp | *(removed)* |  |  |
| `breakdown_heading` | en | Technical Breakdown | Project details | "Technical Breakdown" → plain words (and an h2 now, not an h3). | no claim |
|  | es | Desglose Técnico | Detalles del proyecto |  |  |
|  | vi | Phân tích kỹ thuật | Chi tiết dự án |  |  |
| `stats_heading` | en | — | By the numbers | Heading for the project stats grid. | no claim |
|  | es | — | En cifras |  |  |
|  | vi | — | Những con số |  |  |
| `cta_heading` | en | Ready to upgrade your infrastructure? | Planning a garage door project? | "Ready to upgrade your infrastructure?" is jargon for a garage door. | no claim |
|  | es | ¿Listo para mejorar su infraestructura? | ¿Está planeando un proyecto de puerta de garaje? |  |  |
|  | vi | Sẵn sàng nâng cấp cơ sở hạ tầng của bạn? | Bạn đang lên kế hoạch cho dự án cửa gara? |  |  |
| `cta_subtitle` | en | Mobil Garage Door delivers industrial-grade security and performance. | Mobil Garage Door installs and repairs garage doors for homeowners and builders across the Houston area. | "Delivers industrial-grade security and performance" (puffery) replaced with what the company does and where. | ✅ tier A kept |
|  | es | Mobil Garage Door ofrece seguridad y rendimiento de grado industrial. | Mobil Garage Door instala y repara puertas de garaje para propietarios y constructores en el área de Houston. |  |  |
|  | vi | Mobil Garage Door mang đến an ninh và hiệu suất cấp công nghiệp. | Mobil Garage Door lắp đặt và sửa chữa cửa gara cho chủ nhà và nhà xây dựng trên khắp khu vực Houston. |  |  |
| `cta_contractor` | en | Contractor Portal | Contractor inquiry | "Contractor Portal" linked to the contact form. | no claim |
|  | es | Portal de Contratistas | Consulta para contratistas |  |  |
|  | vi | Cổng thông tin nhà thầu | Yêu cầu dành cho nhà thầu |  |  |
| `cta_general` | en | General Inquiry | General inquiry | Sentence case. | no claim |
|  | es | Consulta General | Consulta general |  |  |
|  | vi | Yêu cầu chung | Yêu cầu chung |  |  |
| `placeholder_image` | en | — | Photo coming soon | Replaces the debug text "IMG_MISSING_001" on project pages without a photo. | 🗑 false by construction, removed |
|  | es | — | Foto próximamente |  |  |
|  | vi | — | Ảnh sẽ sớm được cập nhật |  |  |

### `blog_page`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `badge` | en | Knowledge Base & Updates | Tips & guides | "Knowledge Base & Updates" → what the posts are. | no claim |
|  | es | Base de Conocimiento y Actualizaciones | Consejos y guías |  |  |
|  | vi | Cơ sở kiến thức & Cập nhật | Mẹo và hướng dẫn |  |  |
| `heading` | en | Garage | Garage door tips and guides | Was "Garage / Intel" — the h1 now says what the page is. | no claim |
|  | es | Garage | Consejos y guías sobre puertas de garaje |  |  |
|  | vi | Thông tin | Mẹo và hướng dẫn về cửa gara |  |  |
| `heading_accent` | en | Intel | *(removed)* | Merged into heading. | ⬇ claim softened, nothing added |
|  | es | Intel | *(removed)* |  |  |
|  | vi | Về Gara | *(removed)* |  |  |
| `subheading` | en | Expert advice, maintenance tips, and industry news from the pros who know garage doors inside and out. | Expert advice, maintenance tips and industry news from the pros who know garage doors inside and out. | Punctuation only in en; es replaces the anglicism "tips". | no claim |
|  | es | Consejos expertos, tips de mantenimiento y noticias de la industria de los profesionales que conocen las puertas de garaje por dentro y por fuera. | Consejos de expertos, recomendaciones de mantenimiento y noticias de la industria de profesionales que conocen las puertas de garaje por dentro y por fuera. |  |  |
|  | vi | Lời khuyên từ chuyên gia, mẹo bảo trì và tin tức ngành từ những người hiểu rõ về cửa gara. | Lời khuyên từ chuyên gia, mẹo bảo trì và tin tức ngành từ những người hiểu rõ về cửa gara. |  |  |
| `no_articles` | en | No Articles Yet | No articles yet | Sentence case (now a paragraph, not an h3). | no claim |
|  | es | Aún No Hay Artículos | Aún no hay artículos |  |  |
|  | vi | Chưa có bài viết nào | Chưa có bài viết nào |  |  |
| `min_read` | en | 5 MIN READ | *(removed)* | "5 MIN READ" was the same constant on every post, whatever its length. | 🗑 false by construction, removed |
|  | es | 5 MIN LECTURA | *(removed)* |  |  |
|  | vi | 5 PHÚT ĐỌC | *(removed)* |  |  |
| `read_article` | en | Read Article | Read article | Sentence case. | no claim |
|  | es | Leer Artículo | Leer artículo |  |  |
|  | vi | Đọc bài viết | Đọc bài viết |  |  |

### `blog_detail`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `back` | en | Back to Intel | Back to all articles | "Back to Intel" — the section is not called Intel any more. | no claim |
|  | es | Volver a Intel | Volver a todos los artículos |  |  |
|  | vi | Quay lại Thông tin | Quay lại tất cả bài viết |  |  |
| `team_name` | en | Mobil Garage Team | The Mobil Garage Door team | Uses the full brand name. | ✅ tier A kept |
|  | es | Equipo Mobil Garage | El equipo de Mobil Garage Door |  |  |
|  | vi | Đội ngũ Mobil Garage | Đội ngũ Mobil Garage Door |  |  |
| `team_subtitle` | en | Expert Technicians & Door Specialists | Garage door technicians and specialists | "Expert Technicians & Door Specialists" without the self-applied "expert". | ⬇ claim softened, nothing added |
|  | es | Técnicos Expertos y Especialistas en Puertas | Técnicos y especialistas en puertas de garaje |  |  |
|  | vi | Kỹ thuật viên & Chuyên gia cửa chuyên nghiệp | Kỹ thuật viên và chuyên gia cửa gara |  |  |
| `cta_heading` | en | Need Expert Help? | Need help with your garage door? | Specific. | no claim |
|  | es | ¿Necesita Ayuda Experta? | ¿Necesita ayuda con su puerta de garaje? |  |  |
|  | vi | Cần trợ giúp chuyên gia? | Cần hỗ trợ với cửa gara của bạn? |  |  |
| `cta_desc` | en | Don't let a broken door slow you down. Our techs are ready to deploy. | Tell us what's wrong and we'll send a technician. | "Don't let a broken door slow you down. Our techs are ready to deploy." — describes the actual request flow instead of an availability promise. | ⬇ claim softened, nothing added |
|  | es | No deje que una puerta rota lo detenga. Nuestros técnicos están listos. | Díganos qué pasa y le enviaremos un técnico. |  |  |
|  | vi | Đừng để một cánh cửa bị hỏng làm chậm trễ công việc của bạn. Các kỹ thuật viên của chúng tôi sẵn sàng triển khai. | Hãy cho chúng tôi biết vấn đề và chúng tôi sẽ cử kỹ thuật viên đến. |  |  |
| `cta_button` | en | Book Service Now | Request service | "Book Service Now": the link opens the request form. | no claim |
|  | es | Reservar Servicio Ahora | Solicitar servicio |  |  |
|  | vi | Đặt lịch dịch vụ ngay | Yêu cầu dịch vụ |  |  |
| `cta_phone` → `cta_phone_prefix` | en | or call 832-419-1293 | or call | The number is now a tap-to-call link, so the words and the number are separate. Rendered text is unchanged. | ✅ tier A kept |
|  | es | o llame al 832-419-1293 | o llame al |  |  |
|  | vi | hoặc gọi 832-419-1293 | hoặc gọi |  |  |

### `contact_hero`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `emergency_badge` | en | 24/7 Emergency Dispatch | 24/7 emergency service | "Dispatch" → "service"; same 24/7 claim, same place (confirmed by Tobias on 2026-09-14). | ✅ tier A kept |
|  | es | Despacho de Emergencia 24/7 | Servicio de emergencia 24/7 |  |  |
|  | vi | Điều động khẩn cấp 24/7 | Dịch vụ khẩn cấp 24/7 |  |  |
| `contractor_badge` | en | Contractor Portal | For contractors | "Contractor Portal" — this page is a form, not the portal. | no claim |
|  | es | Portal de Contratistas | Para contratistas |  |  |
|  | vi | Cổng thông tin nhà thầu | Dành cho nhà thầu |  |  |
| `consultation_badge` | en | Project Consultation | Project consultation | Sentence case. | no claim |
|  | es | Consulta de Proyecto | Consulta de proyecto |  |  |
|  | vi | Tư vấn dự án | Tư vấn dự án |  |  |
| `emergency_heading` | en | System | Need emergency garage door repair? | Was "System / Critical?" — says it in the customer's words. | no claim |
|  | es | Sistema | ¿Necesita una reparación urgente de su puerta de garaje? |  |  |
|  | vi | Hệ thống | Cần sửa cửa gara khẩn cấp? |  |  |
| `emergency_accent` | en | Critical? | *(removed)* | Merged into emergency_heading. | ⬇ claim softened, nothing added |
|  | es | ¿Crítico? | *(removed)* |  |  |
|  | vi | Gặp sự cố nghiêm trọng? | *(removed)* |  |  |
| `contractor_heading` | en | Partner | Contractor and builder inquiries | Was "Partner / Access". | no claim |
|  | es | Acceso de | Consultas de contratistas y constructores |  |  |
|  | vi | Đối tác | Yêu cầu của nhà thầu và nhà xây dựng |  |  |
| `contractor_accent` | en | Access | *(removed)* | Merged into contractor_heading. | ⬇ claim softened, nothing added |
|  | es | Socio | *(removed)* |  |  |
|  | vi | Truy cập | *(removed)* |  |  |
| `install_heading` | en | Build Your | Plan your new garage door | Was "Build Your / Vision". | no claim |
|  | es | Construya Su | Planee su nueva puerta de garaje |  |  |
|  | vi | Xây dựng | Lên kế hoạch cho cửa gara mới |  |  |
| `install_accent` | en | Vision | *(removed)* | Merged into install_heading. | ⬇ claim softened, nothing added |
|  | es | Visión | *(removed)* |  |  |
|  | vi | Tầm nhìn của bạn | *(removed)* |  |  |
| `general_heading` | en | Let's | Request garage door service | Was "Let's / Connect". | no claim |
|  | es | Hablemos | Solicite servicio para su puerta de garaje |  |  |
|  | vi | Hãy cùng | Yêu cầu dịch vụ cửa gara |  |  |
| `general_accent` | en | Connect | *(removed)* | Merged into general_heading. | ⬇ claim softened, nothing added |
|  | es | Juntos | *(removed)* |  |  |
|  | vi | Kết nối | *(removed)* |  |  |
| `emergency_desc` | en | Immediate response required. Our rapid dispatch team is standing by to deploy industrial-grade repair solutions. | Tell us what happened. Our dispatch team will review your request and send a technician. | "Immediate response required… standing by to deploy industrial-grade repair solutions" — now matches what the confirmation screen says actually happens. | ⬇ claim softened, nothing added |
|  | es | Respuesta inmediata requerida. Nuestro equipo de despacho rápido está listo para desplegar soluciones de reparación de grado industrial. | Cuéntenos qué pasó. Nuestro equipo de despacho revisará su solicitud y enviará un técnico. |  |  |
|  | vi | Yêu cầu phản hồi ngay lập tức. Đội ngũ điều động nhanh của chúng tôi luôn sẵn sàng triển khai các giải pháp sửa chữa cấp công nghiệp. | Hãy cho chúng tôi biết chuyện gì đã xảy ra. Đội điều phối sẽ xem xét yêu cầu và cử kỹ thuật viên đến. |  |  |
| `general_desc` | en | Whether it's a new installation or a custom upgrade, our engineers are ready to architect the perfect access solution. | New installation or custom upgrade? Tell us about your project and we'll help you choose the right door. | "Our engineers are ready to architect the perfect access solution" — jargon, and a claim about engineers on staff that nothing supports. | ⬇ claim softened, nothing added |
|  | es | Ya sea una nueva instalación o una actualización personalizada, nuestros ingenieros están listos para diseñar la solución de acceso perfecta. | ¿Instalación nueva o mejora a medida? Cuéntenos sobre su proyecto y le ayudaremos a elegir la puerta adecuada. |  |  |
|  | vi | Cho dù đó là lắp đặt mới hay nâng cấp tùy chỉnh, các kỹ sư của chúng tôi sẵn sàng thiết kế giải pháp truy cập hoàn hảo. | Lắp đặt mới hay nâng cấp theo yêu cầu? Hãy cho chúng tôi biết về dự án và chúng tôi sẽ giúp bạn chọn cửa phù hợp. |  |  |

### `contact_page`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `open_ticket` | en | Open Support Ticket | Request service | "Open Support Ticket" — customers request service, they don't open tickets. | no claim |
|  | es | Abrir Ticket de Soporte | Solicitar servicio |  |  |
|  | vi | Mở phiếu hỗ trợ | Yêu cầu dịch vụ |  |  |
| `ticket_desc` | en | Complete the secure dispatch form below. | Fill in the form and we'll take it from there. | "Complete the secure dispatch form below." | ⬇ claim softened, nothing added |
|  | es | Complete el formulario de despacho seguro a continuación. | Complete el formulario y nosotros nos encargamos del resto. |  |  |
|  | vi | Hoàn thành biểu mẫu điều phối an toàn bên dưới. | Điền vào biểu mẫu và chúng tôi sẽ lo phần còn lại. |  |  |
| `contact_name` | en | Contact Name | Your name | Label speaks to the customer. | no claim |
|  | es | Nombre de Contacto | Su nombre |  |  |
|  | vi | Tên liên hệ | Tên của bạn |  |  |
| `full_name` | en | Full Name | Full name | Sentence case placeholder. | no claim |
|  | es | Nombre Completo | Nombre completo |  |  |
|  | vi | Tên đầy đủ | Họ và tên |  |  |
| `email_label` | en | Email Address | Email | Shorter label. | no claim |
|  | es | Correo Electrónico | Correo electrónico |  |  |
|  | vi | Địa chỉ Email | Email |  |  |
| `phone_label` | en | Phone Number | Phone | Shorter label. | no claim |
|  | es | Número de Teléfono | Teléfono |  |  |
|  | vi | Số điện thoại | Số điện thoại |  |  |
| `location_label` | en | Service Location | Service address | "Service Location" → address is what the field wants. | no claim |
|  | es | Ubicación del Servicio | Dirección del servicio |  |  |
|  | vi | Địa điểm dịch vụ | Địa chỉ dịch vụ |  |  |
| `location_placeholder` | en | Street Address, City, Zip | Street address, city, ZIP | Sentence case. | no claim |
|  | es | Dirección, Ciudad, Código Postal | Dirección, ciudad, código postal |  |  |
|  | vi | Số nhà, Tên đường, Thành phố, Mã bưu chính | Số nhà, tên đường, thành phố, mã bưu chính |  |  |
| `issue_label` | en | Issue Description | What's going on with your door? | "Issue Description" as the question a technician would ask. | no claim |
|  | es | Descripción del Problema | ¿Qué le pasa a su puerta? |  |  |
|  | vi | Mô tả vấn đề | Cửa của bạn gặp vấn đề gì? |  |  |
| `submit_emergency` | en | DISPATCH TECHNICIAN NOW | Request emergency service | "DISPATCH TECHNICIAN NOW" — the button opens the payment step, it does not dispatch. | ⬇ claim softened, nothing added |
|  | es | ENVIAR TÉCNICO AHORA | Solicitar servicio de emergencia |  |  |
|  | vi | ĐIỀU ĐỘNG KỸ THUẬT VIÊN NGAY BÂY GIỜ | Yêu cầu dịch vụ khẩn cấp |  |  |
| `submit_standard` | en | SUBMIT REQUEST | Submit request | Sentence case. | no claim |
|  | es | ENVIAR SOLICITUD | Enviar solicitud |  |  |
|  | vi | GỬI YÊU CẦU | Gửi yêu cầu |  |  |
| `secure_note` | en | Secure Transmission • 256-bit Encryption | Secure transmission · 256-bit encryption | Sentence case; same claim (es "encriptación" → "cifrado"). | ✅ tier B kept, not amplified |
|  | es | Transmisión Segura • Encriptación 256-bit | Transmisión segura · Cifrado de 256 bits |  |  |
|  | vi | Truyền dẫn an toàn • Mã hóa 256-bit | Truyền tải an toàn · Mã hóa 256-bit |  |  |
| `direct_contact` | en | Direct Contact | Talk to us | Plain words. | no claim |
|  | es | Contacto Directo | Hable con nosotros |  |  |
|  | vi | Liên hệ trực tiếp | Liên hệ với chúng tôi |  |  |
| `hotline` | en | 24/7 Hotline | 24/7 hotline | Sentence case; same claim (24/7 confirmed by Tobias on 2026-09-14). | ✅ tier A kept |
|  | es | Línea 24/7 | Línea 24/7 |  |  |
|  | vi | Đường dây nóng 24/7 | Đường dây nóng 24/7 |  |  |
| `email_support` | en | Email Support | Email | The address itself is unchanged (question for Tobias). | ✅ tier B kept, not amplified |
|  | es | Soporte por Email | Correo electrónico |  |  |
|  | vi | Hỗ trợ qua Email | Email |  |  |
| `loading` | en | Establishing Uplink... | Loading the request form… | "Establishing Uplink..." — now used by the loading state, which was hard-coded English "Loading...". | no claim |
|  | es | Estableciendo Conexión... | Cargando el formulario… |  |  |
|  | vi | Đang thiết lập kết nối... | Đang tải biểu mẫu… |  |  |
| `response_time` | en | Response Time | Response time | Sentence case. | no claim |
|  | es | Tiempo de Respuesta | Tiempo de respuesta |  |  |
|  | vi | Thời Gian Phản Hồi | Thời gian phản hồi |  |  |
| `preferred_time` | en | Preferred Date & Time | Preferred date and time | Sentence case. | no claim |
|  | es | Fecha y Hora Preferida | Fecha y hora preferidas |  |  |
|  | vi | Ngày & Giờ Ưa Thích | Ngày và giờ mong muốn |  |  |
| `asap` | en | — | As soon as possible | Was hard-coded English "ASAP". | no claim |
|  | es | — | Lo antes posible |  |  |
|  | vi | — | Sớm nhất có thể |  |  |
| `urgency_label` | en | — | How urgent is it? | Accessible name for the Standard/Emergency toggle group. | no claim |
|  | es | — | ¿Qué tan urgente es? |  |  |
|  | vi | — | Mức độ khẩn cấp? |  |  |
| `ai_diagnosis` | en | — | Try AI diagnosis | Was hard-coded English. | no claim |
|  | es | — | Probar diagnóstico con IA |  |  |
|  | vi | — | Thử chẩn đoán bằng AI |  |  |
| `request_received` | en | — | Request received | Was hard-coded English "REQUEST RECEIVED". | no claim |
|  | es | — | Solicitud recibida |  |  |
|  | vi | — | Đã nhận yêu cầu |  |  |
| `success_intro` | en | — | Your service request for {address} has been submitted. | Was hard-coded English. | no claim |
|  | es | — | Su solicitud de servicio para {address} fue enviada. |  |  |
|  | vi | — | Yêu cầu dịch vụ cho {address} đã được gửi. |  |  |
| `success_emergency` | en | — | Our team is reviewing your emergency request and will assign a technician shortly. You'll get a notification when they're on the way. | Was hard-coded English with a siren emoji; same wording otherwise. | no claim |
|  | es | — | Nuestro equipo está revisando su solicitud de emergencia y asignará un técnico en breve. Recibirá una notificación cuando vaya en camino. |  |  |
|  | vi | — | Đội ngũ của chúng tôi đang xem xét yêu cầu khẩn cấp và sẽ sớm chỉ định kỹ thuật viên. Bạn sẽ nhận được thông báo khi kỹ thuật viên đang trên đường đến. |  |  |
| `success_standard` | en | — | We'll review your request and assign a technician. You'll get a notification with your appointment details. | Was hard-coded English. | no claim |
|  | es | — | Revisaremos su solicitud y asignaremos un técnico. Recibirá una notificación con los detalles de su cita. |  |  |
|  | vi | — | Chúng tôi sẽ xem xét yêu cầu và chỉ định kỹ thuật viên. Bạn sẽ nhận được thông báo kèm chi tiết lịch hẹn. |  |  |
| `status_label` | en | — | Status | Was hard-coded English. | no claim |
|  | es | — | Estado |  |  |
|  | vi | — | Trạng thái |  |  |
| `status_pending` | en | — | Pending review | Was hard-coded English "PENDING REVIEW". | no claim |
|  | es | — | Pendiente de revisión |  |  |
|  | vi | — | Đang chờ xem xét |  |  |
| `priority_label` | en | — | Priority | Was hard-coded English "Priority:". | no claim |
|  | es | — | Prioridad |  |  |
|  | vi | — | Mức ưu tiên |  |  |
| `view_portal` | en | — | View in my portal | Was hard-coded English "View in My Portal →". | no claim |
|  | es | — | Ver en mi portal |  |  |
|  | vi | — | Xem trong cổng của tôi |  |  |
| `address_matching` | en | — | Matching addresses | Address suggestions heading; was hard-coded English "Matching Sites". | no claim |
|  | es | — | Direcciones que coinciden |  |  |
|  | vi | — | Địa chỉ phù hợp |  |  |
| `address_recent` | en | — | Recent addresses | Was hard-coded English "Recent Sites". | no claim |
|  | es | — | Direcciones recientes |  |  |
|  | vi | — | Địa chỉ gần đây |  |  |
| `address_new` | en | — | New address | Was hard-coded English "New Address". | no claim |
|  | es | — | Dirección nueva |  |  |
|  | vi | — | Địa chỉ mới |  |  |
| `map_loading` | en | — | Loading map… | Was hard-coded English "Initializing Uplink...". | no claim |
|  | es | — | Cargando mapa… |  |  |
|  | vi | — | Đang tải bản đồ… |  |  |
| `map_area_label` | en | — | Service area | Was hard-coded English "Active Sector". The pulsing "Online" status beside it was a static string and is removed. | 🗑 false by construction, removed |
|  | es | — | Área de servicio |  |  |
|  | vi | — | Khu vực phục vụ |  |  |
| `map_area_value` | en | — | Houston metro + 50 miles | Was hard-coded English "Houston Metro + 50mi"; same radius claim. | ✅ tier B kept, not amplified |
|  | es | — | Área metropolitana de Houston + 50 millas |  |  |
|  | vi | — | Khu vực đô thị Houston + 50 dặm |  |  |

### `privacy`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `customer_service` | en | maintaining a history of your repairs for warranty and support. | Maintaining a history of your repairs for warranty and support. | Capitalisation only (en and es started lowercase). | no claim |
|  | es | mantener un historial de sus reparaciones para garantía y soporte. | Mantener un historial de sus reparaciones para garantía y soporte. |  |  |
|  | vi | Duy trì lịch sử sửa chữa của bạn cho mục đích bảo hành và hỗ trợ. | Duy trì lịch sử sửa chữa của bạn cho mục đích bảo hành và hỗ trợ. |  |  |
| `identity_label` | en | — | Identity data | Was hard-coded English "Identity Data:". Legal text itself is unchanged. | no claim |
|  | es | — | Datos de identidad |  |  |
|  | vi | — | Dữ liệu nhận dạng |  |  |
| `location_data_label` | en | — | Location data | Was hard-coded English. | no claim |
|  | es | — | Datos de ubicación |  |  |
|  | vi | — | Dữ liệu vị trí |  |  |
| `financial_label` | en | — | Financial data | Was hard-coded English. | no claim |
|  | es | — | Datos financieros |  |  |
|  | vi | — | Dữ liệu tài chính |  |  |
| `technical_label` | en | — | Technical data | Was hard-coded English. | no claim |
|  | es | — | Datos técnicos |  |  |
|  | vi | — | Dữ liệu kỹ thuật |  |  |
| `dispatching_label` | en | — | Dispatching | Was hard-coded English. | no claim |
|  | es | — | Despacho |  |  |
|  | vi | — | Điều phối |  |  |
| `communication_label` | en | — | Communication | Was hard-coded English. | no claim |
|  | es | — | Comunicación |  |  |
|  | vi | — | Liên lạc |  |  |
| `billing_label` | en | — | Billing | Was hard-coded English. | no claim |
|  | es | — | Facturación |  |  |
|  | vi | — | Thanh toán |  |  |
| `customer_service_label` | en | — | Customer service | Was hard-coded English. | no claim |
|  | es | — | Atención al cliente |  |  |
|  | vi | — | Chăm sóc khách hàng |  |  |

### `seo`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `site_name` | en | — | Mobil Garage Door | Brand name, appended to every <title>. | ✅ tier A kept |
|  | es | — | Mobil Garage Door |  |  |
|  | vi | — | Mobil Garage Door |  |  |
| `og_image_alt` | en | — | Mobil Garage Door logo | og:image:alt for the new social image. | ✅ tier A kept |
|  | es | — | Logotipo de Mobil Garage Door |  |  |
|  | vi | — | Logo Mobil Garage Door |  |  |
| `home_title` | en | — | Garage Door Repair & Installation in Houston | Replaces "Mobil Garage Door - Your Trusted Partner for Garage Doors" (identical on every page and locale). | ✅ tier A kept |
|  | es | — | Reparación e instalación de puertas de garaje en Houston |  |  |
|  | vi | — | Sửa chữa và lắp đặt cửa gara tại Houston |  |  |
| `home_description` | en | — | Garage door repair and installation for Houston-area homeowners and builders since 2000: springs, openers, off-track doors and new doors. Call {phone} or request service online. | Site-level description on the home page (Google). | ✅ tier A kept |
|  | es | — | Reparación e instalación de puertas de garaje para propietarios y constructores del área de Houston desde 2000: resortes, abridores, puertas descarriladas y puertas nuevas. Llame al {phone} o solicite servicio en línea. |  |  |
|  | vi | — | Sửa chữa và lắp đặt cửa gara cho chủ nhà và nhà xây dựng khu vực Houston từ năm 2000: lò xo, bộ mở cửa, cửa lệch ray và cửa mới. Gọi {phone} hoặc yêu cầu dịch vụ trực tuyến. |  |  |
| `services_title` | en | — | Garage Door Services: Springs, Openers & New Doors | Unique page title. | ✅ tier A kept |
|  | es | — | Servicios de puertas de garaje: resortes, abridores y puertas nuevas |  |  |
|  | vi | — | Dịch vụ cửa gara: lò xo, bộ mở cửa và cửa mới |  |  |
| `services_description` | en | — | Spring and opener repair, off-track door fixes and new garage door installation for homeowners and builders in Houston and surrounding areas. | Unique page description. | ✅ tier A kept |
|  | es | — | Reparación de resortes y abridores, arreglo de puertas descarriladas e instalación de puertas de garaje nuevas para propietarios y constructores en Houston y áreas cercanas. |  |  |
|  | vi | — | Sửa lò xo và bộ mở cửa, khắc phục cửa lệch ray và lắp đặt cửa gara mới cho chủ nhà và nhà xây dựng tại Houston và khu vực lân cận. |  |  |
| `about_title` | en | — | About Us: Houston Garage Door Service Since 2000 | Unique page title. | ✅ tier A kept |
|  | es | — | Sobre nosotros: servicio de puertas de garaje en Houston desde 2000 |  |  |
|  | vi | — | Về chúng tôi: dịch vụ cửa gara tại Houston từ năm 2000 |  |  |
| `about_description` | en | — | Mobil Garage Door has repaired and installed garage doors in the Houston area since 2000, and takes emergency calls 24/7. Learn about our standards and values. | Unique page description. It no longer promises "license and insurance details" (not true, Tobias 2026-09-14); it states the confirmed 24/7 emergency line instead. | ✅ tier A kept |
|  | es | — | Mobil Garage Door repara e instala puertas de garaje en el área de Houston desde 2000 y atiende llamadas de emergencia 24/7. Conozca nuestros estándares y valores. |  |  |
|  | vi | — | Mobil Garage Door sửa chữa và lắp đặt cửa gara tại khu vực Houston từ năm 2000 và nhận cuộc gọi khẩn cấp 24/7. Tìm hiểu tiêu chuẩn và giá trị của chúng tôi. |  |  |
| `portfolio_title` | en | — | Garage Door Installation Projects | Unique page title. | no claim |
|  | es | — | Proyectos de instalación de puertas de garaje |  |  |
|  | vi | — | Dự án lắp đặt cửa gara |  |  |
| `portfolio_description` | en | — | Garage door installations, custom builds and repairs completed by Mobil Garage Door for homeowners and builders across Texas. | Unique page description. | ✅ tier A kept |
|  | es | — | Instalaciones de puertas de garaje, trabajos a medida y reparaciones realizadas por Mobil Garage Door para propietarios y constructores en todo Texas. |  |  |
|  | vi | — | Các công trình lắp đặt cửa gara, làm theo yêu cầu và sửa chữa do Mobil Garage Door thực hiện cho chủ nhà và nhà xây dựng trên khắp Texas. |  |  |
| `project_title` | en | — | {title} · Garage Door Project | Project pages: title from the project record. | no claim |
|  | es | — | {title} · Proyecto de puerta de garaje |  |  |
|  | vi | — | {title} · Dự án cửa gara |  |  |
| `project_description` | en | — | {title}: a garage door project completed by Mobil Garage Door. | Project pages: description from the project record. | no claim |
|  | es | — | {title}: un proyecto de puerta de garaje realizado por Mobil Garage Door. |  |  |
|  | vi | — | {title}: dự án cửa gara do Mobil Garage Door thực hiện. |  |  |
| `blog_title` | en | — | Garage Door Tips & Guides | Unique page title. | no claim |
|  | es | — | Consejos y guías sobre puertas de garaje |  |  |
|  | vi | — | Mẹo và hướng dẫn về cửa gara |  |  |
| `blog_description` | en | — | Maintenance tips, repair advice and industry news from the Mobil Garage Door team in Houston. | Unique page description (posts use their own excerpt). | ✅ tier A kept |
|  | es | — | Consejos de mantenimiento, recomendaciones de reparación y noticias de la industria del equipo de Mobil Garage Door en Houston. |  |  |
|  | vi | — | Mẹo bảo trì, lời khuyên sửa chữa và tin tức ngành từ đội ngũ Mobil Garage Door tại Houston. |  |  |
| `contact_title` | en | — | Request Garage Door Service | Unique page title. | no claim |
|  | es | — | Solicite servicio para su puerta de garaje |  |  |
|  | vi | — | Yêu cầu dịch vụ cửa gara |  |  |
| `contact_description` | en | — | Request garage door repair or installation online, or call {phone}. Serving Houston and surrounding areas. | Unique page description. | ✅ tier A kept |
|  | es | — | Solicite en línea la reparación o instalación de su puerta de garaje, o llame al {phone}. Servimos a Houston y áreas cercanas. |  |  |
|  | vi | — | Yêu cầu sửa chữa hoặc lắp đặt cửa gara trực tuyến, hoặc gọi {phone}. Phục vụ Houston và khu vực lân cận. |  |  |
| `privacy_title` | en | — | Privacy Policy | Unique page title. | no claim |
|  | es | — | Política de privacidad |  |  |
|  | vi | — | Chính sách bảo mật |  |  |
| `privacy_description` | en | — | How Mobil Garage Door collects, uses and protects your personal and payment information. | Summarises the existing policy; no new commitment. | no claim |
|  | es | — | Cómo Mobil Garage Door recopila, usa y protege su información personal y de pago. |  |  |
|  | vi | — | Cách Mobil Garage Door thu thập, sử dụng và bảo vệ thông tin cá nhân và thanh toán của bạn. |  |  |

### `home`

| Key | Locale | Before | After | Why | Facts |
|---|---|---|---|---|---|
| `licensed_insured` | en | Licensed & Insured | *(removed)* | "Licensed & Insured" is not true (Tobias, 2026-09-14). No component renders this key, but the public layout passes the whole catalogue to the client provider, so it shipped in every public page's inline payload. | 🗑 not true (Tobias, 2026-09-14), removed |
|  | es | Con Licencia y Asegurados | *(removed)* |  |  |
|  | vi | Được Cấp Phép & Bảo Hiểm | *(removed)* |  |  |
