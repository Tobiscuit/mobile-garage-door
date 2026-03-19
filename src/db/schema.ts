import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, real, customType, index } from "drizzle-orm/sqlite-core";

const isoText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(val: string | Date | any) {
    if (val instanceof Date) return val.toISOString();
    return String(val);
  },
  fromDriver(val: string) {
    return val;
  },
});

// Auth tables
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "technician", "dispatcher", "customer"] }).default("customer"),
  customerType: text("customerType", { enum: ["residential", "builder"] }).default("residential"),
  companyName: text("companyName"),
  phone: text("phone"),
  address: text("address"),
  lastLogin: text("lastLogin"),
  pushSubscription: text("pushSubscription"),
  squareCustomerId: text("squareCustomerId"),
  createdAt: isoText("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: isoText("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Push subscriptions — one per device per user
export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull().unique(),
  subscription: text("subscription").notNull(),
  userAgent: text("user_agent"),
  createdAt: isoText("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: isoText("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Business tables
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category"),
  price: real("price"),
  description: text("description"),
  icon: text("icon"),
  highlight: integer("highlight", { mode: "boolean" }).default(false),
  order: integer("order").default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const serviceFeatures = sqliteTable("service_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(),
  order: integer("order").default(0),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  client: text("client"),
  location: text("location"),
  completionDate: text("completion_date"),
  installDate: text("install_date"),
  warrantyExpiration: text("warranty_expiration"),
  description: text("description"),
  challenge: text("challenge"),
  solution: text("solution"),
  htmlDescription: text("html_description"),
  htmlChallenge: text("html_challenge"),
  htmlSolution: text("html_solution"),
  imageStyle: text("image_style"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  filesize: integer("filesize"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  url: text("url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const projectGallery = sqliteTable("project_gallery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").references(() => media.id),
  caption: text("caption"),
  order: integer("order").default(0),
});

export const projectTags = sqliteTable("project_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

export const projectStats = sqliteTable("project_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
});

export const serviceRequests = sqliteTable("service_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull().unique(),
  customerId: text("customer_id").references(() => users.id),
  issueDescription: text("issue_description"),
  urgency: text("urgency", { enum: ["standard", "emergency"] }).default("standard"),
  scheduledTime: text("scheduled_time"),
  status: text("status", { enum: ["pending", "confirmed", "dispatched", "on_site", "completed", "cancelled"] }).default("pending"),
  assignedTechId: text("assigned_tech_id").references(() => users.id),
  tripFeePayment: text("trip_fee_payment"),
  quotedPrice: integer("quoted_price"), // Amount in cents, e.g. 35000 = $350.00
  customerLat: real("customer_lat"),
  customerLng: real("customer_lng"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").default(5),
  featured: integer("featured", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  htmlContent: text("html_content"),
  featuredImageId: integer("featured_image_id").references(() => media.id),
  category: text("category"),
  publishedAt: text("published_at"),
  status: text("status", { enum: ["draft", "published", "pending_review"] }).default("draft"),
  quickNotes: text("quick_notes"),
  aiGenerated: integer("ai_generated", { mode: "boolean" }).default(false),
  aiTopicSource: text("ai_topic_source"), // 'ai_ideation' | 'admin_queue' | null
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const postKeywords = sqliteTable("post_keywords", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  keyword: text("keyword").notNull(),
});

export const postKeywordsRelations = relations(postKeywords, ({ one }) => ({
  post: one(posts, { fields: [postKeywords.postId], references: [posts.id] }),
}));

export const topicQueue = sqliteTable("topic_queue", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topic: text("topic").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'blog_draft' | 'tech_dispatched' | 'job_accepted' | 'tracking_update'
  title: text("title").notNull(),
  body: text("body"),
  actionUrl: text("action_url"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  squareInvoiceId: text("square_invoice_id").notNull().unique(),
  orderId: text("order_id"),
  amount: integer("amount").notNull(),
  status: text("status"),
  customerId: text("customer_id").references(() => users.id),
  publicUrl: text("public_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  squarePaymentId: text("square_payment_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency"),
  status: text("status"),
  sourceType: text("source_type"),
  note: text("note"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const staffInvites = sqliteTable("staff_invites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["technician", "admin"] }).default("technician"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  token: text("token").unique(),
  status: text("status", { enum: ["pending", "accepted", "revoked"] }).default("pending"),
  expiresAt: text("expires_at"),
  acceptedAt: text("accepted_at"),
  invitedById: text("invited_by_id").references(() => users.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const emailThreads = sqliteTable("email_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),
  status: text("status", { enum: ["open", "closed", "archived"] }).default("open"),
  lastMessageAt: text("last_message_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const emailThreadParticipants = sqliteTable("email_thread_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").references(() => emailThreads.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const emails = sqliteTable("emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  from: text("from").notNull(),
  to: text("to").notNull(),
  subject: text("subject"),
  body: text("body"),
  bodyRaw: text("body_raw"),
  threadId: integer("thread_id").references(() => emailThreads.id, { onDelete: "cascade" }),
  direction: text("direction", { enum: ["inbound", "outbound"] }).notNull(),
  messageId: text("message_id").unique(),
  rawMetadata: text("raw_metadata"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const emailAttachments = sqliteTable("email_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  emailId: integer("email_id").references(() => emails.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").references(() => media.id),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").default("Mobil Garage Door"),
  phone: text("phone").default("832-419-1293"),
  email: text("email").default("service@mobilgaragedoor.com"),
  licenseNumber: text("license_number").default("TX Registered & Bonded"),
  insuranceAmount: text("insurance_amount").default("\$2M Policy"),
  bbbRating: text("bbb_rating").default("A+"),
  missionStatement: text("mission_statement"),
  brandVoice: text("brand_voice"),
  brandTone: text("brand_tone"),
  brandAvoid: text("brand_avoid"),
  themePreference: text("theme_preference").default("candlelight"),
  warrantyEnableNotifications: integer("warranty_enable_notifications", { mode: "boolean" }).default(false),
  warrantyNotificationEmailTemplate: text("warranty_notification_email_template"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const settingStats = sqliteTable("setting_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settingId: integer("setting_id").references(() => settings.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
});

export const settingValues = sqliteTable("setting_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settingId: integer("setting_id").references(() => settings.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

// Relations
export const serviceRelations = relations(services, ({ many }) => ({
  features: many(serviceFeatures),
}));

export const projectRelations = relations(projects, ({ many }) => ({
  gallery: many(projectGallery),
  tags: many(projectTags),
  stats: many(projectStats),
}));

export const projectGalleryRelations = relations(projectGallery, ({ one }) => ({
  project: one(projects, { fields: [projectGallery.projectId], references: [projects.id] }),
  media: one(media, { fields: [projectGallery.mediaId], references: [media.id] }),
}));

export const projectTagRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, { fields: [projectTags.projectId], references: [projects.id] }),
}));

export const projectStatsRelations = relations(projectStats, ({ one }) => ({
  project: one(projects, { fields: [projectStats.projectId], references: [projects.id] }),
}));

export const settingsRelations = relations(settings, ({ many }) => ({
  stats: many(settingStats),
  values: many(settingValues),
}));

export const settingStatsRelations = relations(settingStats, ({ one }) => ({
  setting: one(settings, { fields: [settingStats.settingId], references: [settings.id] }),
}));

export const settingValuesRelations = relations(settingValues, ({ one }) => ({
  setting: one(settings, { fields: [settingValues.settingId], references: [settings.id] }),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  featuredImage: one(media, { fields: [posts.featuredImageId], references: [media.id] }),
  keywords: many(postKeywords),
}));

export const emailThreadRelations = relations(emailThreads, ({ many }) => ({
  emails: many(emails),
  participants: many(emailThreadParticipants),
}));

export const emailRelations = relations(emails, ({ one, many }) => ({
  thread: one(emailThreads, { fields: [emails.threadId], references: [emailThreads.id] }),
  attachments: many(emailAttachments),
}));

// Translations table for CMS content in es/vi locales
// English content stays in the main table columns; translations table holds other locales
export const translations = sqliteTable("translations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(), // e.g. 'services', 'projects', 'posts', 'testimonials'
  entityId: integer("entity_id").notNull(), // ID of the row in the entity table
  fieldName: text("field_name").notNull(), // e.g. 'title', 'description', 'content'
  locale: text("locale", { enum: ["es", "vi"] }).notNull(),
  value: text("value").notNull(),
  autoTranslated: integer("auto_translated", { mode: "boolean" }).default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id)
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull()
});

export const passkey = sqliteTable("passkey", {
  id: text("id").primaryKey(),
  name: text("name"),
  publicKey: text("publicKey").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  credentialID: text("credentialID").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("deviceType").notNull(),
  backedUp: integer("backedUp", { mode: "boolean" }).notNull(),
  transports: text("transports"),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  aaguid: text("aaguid"),
}, (table) => [
  index("passkey_userId_idx").on(table.userId),
  index("passkey_credentialID_idx").on(table.credentialID),
]);

export const serviceAddresses = sqliteTable("service_addresses", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  address: text("address").notNull(),
  label: text("label"),
  lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
  useCount: integer("useCount").default(1),
}, (table) => [
  index("service_addresses_userId_idx").on(table.userId),
]);
