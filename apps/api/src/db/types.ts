import type { ColumnType, Generated, Insertable, Selectable } from "kysely";

export type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;

export interface RegionsTable {
  id: string;
  code: string;
  name_fa: string;
  is_active: boolean;
}

export interface CitiesTable {
  id: string;
  region_id: string;
  code: string;
  name_fa: string;
  is_active: boolean;
  is_village: boolean;
  parent_city_id: string | null;
}

export interface CategoriesTable {
  id: string;
  parent_id: string | null;
  slug: string;
  name_fa: string;
  content_types: unknown;
  metadata_schema: unknown;
  sort_order: number;
  is_active: boolean;
}

export interface UsersTable {
  id: string;
  phone_number: string;
  phone_verified_at: Timestamp | null;
  password_hash: string | null;
  status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserProfilesTable {
  user_id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  primary_city_id: string | null;
  verification_status: string;
  profile_completed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SessionsTable {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Timestamp;
  revoked_at: Timestamp | null;
  created_at: Timestamp;
}

export interface SessionRefreshTokensTable {
  id: string;
  session_id: string;
  token_hash: string;
  expires_at: Timestamp;
  revoked_at: Timestamp | null;
  created_at: Timestamp;
}

export interface UserRolesTable {
  user_id: string;
  role: string;
  granted_at: Timestamp;
}

export interface OtpChallengesTable {
  id: string;
  phone_number: string;
  purpose: string;
  code_hash: string;
  attempts: number;
  max_attempts: number;
  expires_at: Timestamp;
  consumed_at: Timestamp | null;
  created_at: Timestamp;
}

export interface MarketContentsTable {
  id: string;
  content_type: string;
  owner_user_id: string;
  city_id: string;
  category_id: string;
  title: string;
  description: string;
  status: string;
  published_at: Timestamp | null;
  expires_at: Timestamp | null;
  search_text: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  deleted_at: Timestamp | null;
  storefront_id: string | null;
  metadata_json: unknown | null;
}

export interface StorefrontsTable {
  id: string;
  owner_user_id: string;
  category_id: string;
  city_id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  business_type: string;
  address: string | null;
  phone: string | null;
  secondary_phone: string | null;
  working_hours: unknown;
  logo_asset_id: string | null;
  cover_asset_id: string | null;
  status: string;
  rejection_reason: string | null;
  verified_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ListingsTable {
  content_id: string;
  price_amount: number | null;
  price_type: string;
  item_condition: string | null;
  image_data_url: string | null;
  service_area: string | null;
  pricing_model: string | null;
  availability: string | null;
  experience_years: number | null;
}

export interface TransportDetailsTable {
  content_id: string; mode: string; origin_label: string; destination_label: string;
  origin_city_id: string | null; destination_city_id: string | null; departure_date: string;
  time_from: string; time_to: string | null; seats_available: number | null; passenger_count: number | null;
  vehicle_type: string | null; price_type: string; price_amount: number | null; lifecycle_status: string;
  expires_at: Timestamp | null; cancelled_at: Timestamp | null; created_at: Timestamp; updated_at: Timestamp;
}

export interface MediaAssetsTable {
  id: string;
  owner_user_id: string;
  storage_key: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  checksum_sha256: string;
  created_at: Timestamp;
}

export interface IdentityVerificationRequestsTable {
  id: string;
  user_id: string;
  document_type: string;
    national_id_last4: string | null;
  document_mime_type: string;
  document_data: Buffer;
  status: string;
  rejection_reason: string | null;
  reviewed_by: string | null;
    reviewed_at: Timestamp | null;
    verification_method: string;
    verified_at: Timestamp | null;
    revoked_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ListingMediaTable {
  content_id: string;
  asset_id: string;
  media_role: string;
  sort_order: number;
  created_at: Timestamp;
}

export interface SupportTicketsTable {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ContactEventsTable {
  id: string;
  content_id: string;
  requester_user_id: string;
  owner_user_id: string;
  event_type: string;
  status: string;
  created_at: Timestamp;
}

export interface ConversationsTable {
  id: string;
  content_id: string;
  buyer_user_id: string;
  seller_user_id: string;
  status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ConversationMessagesTable {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: Timestamp;
}

export interface ConversationReadsTable {
  conversation_id: string;
  user_id: string;
  last_read_at: Timestamp;
}

export interface ConversationPreferencesTable {
  conversation_id: string;
  user_id: string;
  is_muted: boolean;
  muted_at: Timestamp | null;
  updated_at: Timestamp;
}

export interface ConversationBlocksTable {
  conversation_id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  created_at: Timestamp;
}

export interface PushSubscriptionsTable {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string | null;
  auth: string | null;
  user_agent: string | null;
  status: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface NativePushTokensTable {
  id: string;
  user_id: string;
  token: string;
  platform: string;
  provider: string;
  status: string;
  last_seen_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface NotificationOutboxTable {
  id: string;
  user_id: string;
  channel: string;
  title: string;
  body: string;
  tag: string;
  url: string | null;
  status: string;
  attempts: number;
  available_at: Timestamp;
  locked_at: Timestamp | null;
  sent_at: Timestamp | null;
  last_error: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FavoritesTable {
  user_id: string;
  content_id: string;
  created_at: Timestamp;
}

export interface AnalyticsEventsTable {
  id: Generated<string>;
  actor_user_id: string | null;
  event_name: string;
  target_type: string | null;
  target_id: string | null;
  metadata_json: unknown | null;
  created_at: Timestamp;
}

export interface AnalyticsPreferencesTable {
  user_id: string;
  allow_personalized_events: boolean;
  updated_at: Timestamp;
}

export interface BusinessProfilesTable {
  user_id: string;
  business_name: string;
  business_type: string;
  bio: string | null;
  service_area: string;
  opening_hours: string;
  is_public: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ReportsTable {
  id: string;
  reporter_user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: Timestamp;
}

export interface ModerationCasesTable {
  id: string;
  report_id: string | null;
  target_type: string;
  target_id: string;
  status: string;
  priority: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ModerationDecisionsTable {
  id: string;
  case_id: string;
  actor_user_id: string;
  decision: string;
  reason: string;
  created_at: Timestamp;
}

export interface ContentStatusHistoryTable {
  id: string;
  content_id: string;
  from_status: string | null;
  to_status: string;
  actor_user_id: string | null;
  reason: string | null;
  created_at: Timestamp;
}

export interface AuditLogsTable {
  id: Generated<string>;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata_json: unknown | null;
  created_at: Timestamp;
}

export interface Database {
  regions: RegionsTable;
  cities: CitiesTable;
  categories: CategoriesTable;
  users: UsersTable;
  user_profiles: UserProfilesTable;
  sessions: SessionsTable;
  session_refresh_tokens: SessionRefreshTokensTable;
  user_roles: UserRolesTable;
  otp_challenges: OtpChallengesTable;
  market_contents: MarketContentsTable;
  storefronts: StorefrontsTable;
  listings: ListingsTable;
  transport_details: TransportDetailsTable;
  media_assets: MediaAssetsTable;
  identity_verification_requests: IdentityVerificationRequestsTable;
  listing_media: ListingMediaTable;
  support_tickets: SupportTicketsTable;
  content_status_history: ContentStatusHistoryTable;
  contact_events: ContactEventsTable;
  conversations: ConversationsTable;
  conversation_messages: ConversationMessagesTable;
  conversation_reads: ConversationReadsTable;
  conversation_preferences: ConversationPreferencesTable;
  conversation_blocks: ConversationBlocksTable;
  push_subscriptions: PushSubscriptionsTable;
  native_push_tokens: NativePushTokensTable;
  notification_outbox: NotificationOutboxTable;
  favorites: FavoritesTable;
  analytics_events: AnalyticsEventsTable;
  analytics_preferences: AnalyticsPreferencesTable;
  business_profiles: BusinessProfilesTable;
  reports: ReportsTable;
  moderation_cases: ModerationCasesTable;
  moderation_decisions: ModerationDecisionsTable;
  audit_logs: AuditLogsTable;
}

export type City = Selectable<CitiesTable>;
export type Category = Selectable<CategoriesTable>;
export type MarketContent = Selectable<MarketContentsTable>;
export type NewMarketContent = Insertable<MarketContentsTable>;
