import { sitePath, sitePathname } from "./sitePath.js";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellOff,
  Clock3,
  ClipboardList,
  Database,
  Eye,
  Flag,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  UserRound,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Wifi,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getListingFieldPolicy } from "@four-d/shared";
import { getListingAttributes, getListingMedia } from "./components/listingDetailModel.js";
import IdentityBadge from "./components/IdentityBadge.js";
import "./styles.css";
import "./phase73.css";

const AdminWorkspace = React.lazy(() => import("./components/AdminWorkspace.js"));
const ProfileWorkspace = React.lazy(() => import("./components/ProfileWorkspace.js"));
const ChatWorkspace = React.lazy(() => import("./components/ChatWorkspace.js"));
const StorefrontPublicPage = React.lazy(() => import("./components/StorefrontPublicPage.js"));
const ListingDetailPage = React.lazy(() => import("./components/ListingDetailPage.js"));

// Local development must stay on the local API even when the shared root .env
// contains the hosted origin used for production builds. Opt in explicitly
// when a developer really wants to exercise the hosted API from Vite.
const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
const useHostedApiInDev = String(import.meta.env.VITE_USE_HOSTED_API ?? "").toLowerCase() === "true";
const localApiBaseUrl = `http://${window.location.hostname}:4000`;
const API_BASE_URL =
  import.meta.env.MODE === "development" && !useHostedApiInDev
    ? localApiBaseUrl
    : import.meta.env.MODE === "development"
      ? configuredApiBaseUrl
      : configuredApiBaseUrl || "https://api.4dbazar.ir";
const API_HEALTH_READY_PATH = API_BASE_URL ? "/health/ready" : "/api/health/ready";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";
const DEV_USER_ID = "00000000-0000-4000-8000-000000000301";
const SESSION_STORAGE_KEY = "four_d_session_token";
const REFRESH_SESSION_STORAGE_KEY = "four_d_refresh_session_token";
let webRefreshInFlight: Promise<string | null> | null = null;

async function refreshWebSession() {
  const refreshToken = localStorage.getItem(REFRESH_SESSION_STORAGE_KEY);
  if (!refreshToken) return null;
  if (webRefreshInFlight) return webRefreshInFlight;
  webRefreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      if (!response.ok) return null;
      const body = await response.json() as { data?: { token?: string; refresh_token?: string } };
      if (!body.data?.token || !body.data.refresh_token) return null;
      localStorage.setItem(SESSION_STORAGE_KEY, body.data.token);
      localStorage.setItem(REFRESH_SESSION_STORAGE_KEY, body.data.refresh_token);
      return body.data.token;
    } catch {
      return null;
    } finally {
      webRefreshInFlight = null;
    }
  })();
  return webRefreshInFlight;
}

function mediaUrl(value?: string | null) {
  if (!value || value.startsWith("data:") || /^https?:\/\//i.test(value)) return value ?? "";
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function getItemMedia(item: Pick<MarketItem, "image_data_url" | "media">) {
  return getListingMedia(item).map((asset) => asset.url);
}

interface City {
  id: string;
  code: string;
  name_fa: string;
  is_village?: boolean;
  parent_city_id?: string | null;
}

interface Category {
  id: string;
  slug: string;
  name_fa: string;
  content_types?: unknown;
  metadata_schema?: CategoryMetadataField[];
}

interface CategoryMetadataField {
  key: string;
  label_fa: string;
  type: "text" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label_fa: string }>;
}

interface ApiListResponse<T> {
  data: T[];
  meta?: {
    source?: "database" | "fallback" | "unavailable";
  };
}

interface FeedResponse<T> extends ApiListResponse<T> {
  page: {
    next_cursor: string | null;
    has_more: boolean;
  };
}

interface ReadyResponse {
  status: "ok" | "degraded";
  checks: {
    database: "ok" | "unavailable";
    object_storage: string;
    sms?: "configured" | "not_configured" | "disabled";
    sms_vendor?: string;
    sms_transport?: "dns" | "fixed_ip" | "url" | "disabled";
    sms_ip_configured?: boolean;
  };
}

interface ListingForm {
  content_type: "listing" | "service_listing";
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  price_amount: string;
  price_type: "fixed" | "negotiable";
  item_condition: "new" | "used" | "like_new";
  image_data_url: string;
  media_asset_ids: string[];
  service_area: string;
  pricing_model: "quote" | "fixed" | "starting_at" | "hourly" | "daily";
  availability: string;
  experience_years: string;
  storefront_id: string;
  metadata: Record<string, string>;
}

type TransportMode = "offer" | "request";

interface TransportForm {
  mode: TransportMode;
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  origin_label: string;
  destination_label: string;
  departure_date: string;
  time_from: string;
  time_to: string;
  seats_available: string;
  passenger_count: string;
  vehicle_type: string;
  price_type: "fixed" | "negotiable";
  price_amount: string;
}

interface TransportResult {
  id: string;
  title: string;
  description: string;
  mode: TransportMode;
  origin_label: string;
  destination_label: string;
  departure_date: string;
  time_from: string;
  time_to?: string | null;
  seats_available?: number | null;
  passenger_count?: number | null;
  vehicle_type?: string | null;
  price_type?: string | null;
  price_amount?: number | null;
}

interface ListingAiReview {
  score: number;
  suggestions: string[];
  improved_title: string;
  improved_description?: string;
  category_suggestion?: string;
  price_hint?: string;
  attribute_suggestions?: string[];
  image_advice?: string[];
  summary: string;
  provider?: "local" | "avalai" | "openai-compatible" | "fallback";
}

interface ImageMetadata {
  width: number;
  height: number;
  size_bytes: number;
  mime_type: string;
}

interface MarketItem {
  id: string;
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  owner_user_id?: string;
  status: "approved" | "submitted" | "local_preview" | string;
  price_amount?: number | null;
  price_type?: string | null;
  item_condition?: string | null;
  image_data_url?: string | null;
  created_at?: string;
  content_type?: string;
  service_area?: string | null;
  pricing_model?: string | null;
  availability?: string | null;
  experience_years?: number | null;
  storefront_slug?: string | null;
  storefront_name?: string | null;
  view_count?: number;
  media?: Array<{ asset_id: string; url: string; mime_type: string; media_role: string; sort_order: number }>;
  metadata_json?: Record<string, string | number> | null;
  seller_trust?: PublicTrustSummary | null;
}

interface AuthSession {
  token: string;
  refresh_token?: string;
  refresh_expires_at?: string;
  user: {
    id: string;
    phone_number: string;
    mobile_verified: boolean;
  };
}

interface UserProfile {
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  primary_city_id: string | null;
  verification_status: string;
}

interface CurrentUser {
  id: string;
  phone_number: string | null;
  created_at?: string | null;
  account_status?: string | null;
  identity_verification_status?: "not_implemented" | "pending" | "verified" | "rejected";
  mobile_verified: boolean;
  roles: string[];
  profile: UserProfile | null;
  password_set: boolean;
  profile_complete: boolean;
  can_create_listing?: boolean;
  profile_missing_fields?: string[];
  business_profile: BusinessProfile | null;
}

interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_type: string;
  bio: string | null;
  service_area: string;
  opening_hours: string;
  is_public: boolean;
}

interface Storefront {
  id: string;
  owner_user_id: string;
  category_id: string;
  city_id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  business_type: string;
  address?: string | null;
  phone?: string | null;
  secondary_phone?: string | null;
  working_hours?: { text?: string } | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface PublicTrustSummary {
  mobile_verified: boolean;
  profile_complete: boolean;
  identity_verified: boolean;
  identity_verified_at?: string | null;
  storefront_verified: boolean;
  approved_listings: number;
  public_badges?: string[];
  trust_tier?: string;
  seller_response_rate?: number | null;
}

interface AnalyticsSummary {
  totals: { views: number; favorites: number; contacts: number };
  listings: Array<{ id: string; title: string; views: number; favorites: number; contacts: number }>;
}

interface ModerationCase {
  id: string;
  report_id: string | null;
  target_type: string;
  target_id: string;
  status: string;
  priority: string;
  created_at: string;
  reason: string | null;
  description: string | null;
  reporter_user_id: string | null;
  target_preview?: string | null;
}

interface AdminUser {
  id: string;
  phone_number: string;
  phone_verified_at?: string | null;
  status: string;
  created_at: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  verification_status?: string | null;
  primary_city_id?: string | null;
}

interface AdminUserContent {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  city_id: string;
  category_id: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply?: string | null;
  created_at: string;
  updated_at?: string;
  user_phone_number?: string | null;
  user_display_name?: string | null;
  user_first_name?: string | null;
  user_last_name?: string | null;
}

interface Conversation {
  id: string;
  content_id: string;
  buyer_user_id: string;
  seller_user_id: string;
  status: string;
  content_title: string;
  updated_at: string;
  unread_count?: number;
  is_muted?: boolean;
  is_blocked?: boolean;
  is_blocked_by_me?: boolean;
  last_message_body?: string | null;
  last_message_at?: string | null;
  last_message_sender_user_id?: string | null;
  participant?: { user_id: string; display_name: string; city_id?: string | null; city_name?: string | null };
}

interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
}

interface NotificationEvent {
  id: string;
  conversation_id: string;
  title: string;
  body: string;
  created_at: string;
}

interface PushSubscriptionSummary {
  id: string;
  endpoint: string;
  status: string;
  updated_at: string;
}

type Workspace = "market" | "profile" | "admin";
type AuthStep = "phone" | "otp";
type AuthMode = "password" | "sms";
type MarketSort = "newest" | "price_low" | "price_high";

const initialForm: ListingForm = {
  content_type: "listing",
  title: "",
  description: "",
  city_id: "",
  category_id: "",
  price_amount: "",
  price_type: "negotiable",
  item_condition: "used",
  image_data_url: "",
  media_asset_ids: [],
  service_area: "",
  pricing_model: "quote",
  availability: "",
  experience_years: "",
  storefront_id: "",
  metadata: {}
};

const initialTransportForm: TransportForm = {
  mode: "offer",
  title: "",
  description: "",
  city_id: "",
  category_id: "00000000-0000-4000-8000-000000000215",
  origin_label: "",
  destination_label: "",
  departure_date: "",
  time_from: "",
  time_to: "",
  seats_available: "",
  passenger_count: "",
  vehicle_type: "",
  price_type: "negotiable",
  price_amount: ""
};

const initialProfileForm = {
  first_name: "",
  last_name: "",
  primary_city_id: "",
  password: ""
};

const initialBusinessForm = {
  business_name: "",
  business_type: "",
  bio: "",
  service_area: "",
  opening_hours: "",
  is_public: true
};

const initialStorefrontForm = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  business_type: "",
  address: "",
  phone: "",
  secondary_phone: "",
  working_hours: "",
  city_id: "",
  category_id: ""
};

const demoItems: MarketItem[] = [
  {
    id: "00000000-0000-4000-8000-000000000401",
    title: "کولر آبی سالم",
    description: "مناسب خانه یا مغازه کوچک، بازدید در جاجرم.",
    city_id: "00000000-0000-4000-8000-000000000102",
    category_id: "00000000-0000-4000-8000-000000000203",
    status: "approved",
    price_amount: 4200000,
    item_condition: "used"
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    title: "دریل و ابزار کارگاهی",
    description: "چند ابزار سالم برای فروش یکجا یا جداگانه.",
    city_id: "00000000-0000-4000-8000-000000000101",
    category_id: "00000000-0000-4000-8000-000000000204",
    status: "approved",
    price_type: "negotiable",
    item_condition: "used"
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    title: "گوشی A52 تمیز",
    description: "جعبه دارد، باتری خوب، تحویل حضوری در ایور.",
    city_id: "00000000-0000-4000-8000-000000000103",
    category_id: "00000000-0000-4000-8000-000000000202",
    status: "approved",
    price_amount: 8500000,
    item_condition: "like_new"
  }
];

const starterItems = import.meta.env.DEV ? demoItems : [];

function formatPrice(value?: number | string | null, priceType?: string | null) {
  if (priceType === "negotiable" || value === undefined || value === null || value === "") return "توافقی";
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? `${numberValue.toLocaleString("fa-IR")} تومان` : "توافقی";
}

function parseMoneyInput(value: string) {
  const digits = value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

function formatMoneyInput(value: string) {
  const amount = parseMoneyInput(value);
  return amount == null ? "" : amount.toLocaleString("en-US");
}

function getStatusLabel(status: string) {
  if (status === "approved") return "منتشر شده";
  if (status === "submitted") return "در انتظار بررسی";
  if (status === "local_preview") return "پیش‌نمایش محلی";
  return status;
}

function getAuthHeaders(token?: string, options: { json?: boolean } = {}) {
  const contentHeaders = options.json === false ? {} : { "content-type": "application/json" };
  if (token) {
    return {
      ...contentHeaders,
      authorization: `Bearer ${token}`
    };
  }

  return import.meta.env.DEV
    ? {
        ...contentHeaders,
        "x-4d-user-id": DEV_USER_ID,
        "x-4d-mobile-verified": "true"
      }
    : contentHeaders;
}

function getModeratorHeaders(token?: string, options: { json?: boolean } = {}) {
  const contentHeaders = options.json === false ? {} : { "content-type": "application/json" };
  if (token) {
    return {
      ...contentHeaders,
      authorization: `Bearer ${token}`
    };
  }

  return import.meta.env.DEV
    ? {
        ...contentHeaders,
        "x-4d-user-id": DEV_USER_ID,
        "x-4d-mobile-verified": "true",
        "x-4d-roles": "moderator"
      }
    : contentHeaders;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

function getWorkspaceFromLocation(): Workspace {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  if (pathname.endsWith("/profile") || window.location.hash === "#profile") return "profile";
  return pathname.endsWith("/admin") || window.location.hash === "#admin" ? "admin" : "market";
}

function App() {
  const [ready, setReady] = useState<ReadyResponse | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxonomySource, setTaxonomySource] = useState<"database" | "fallback" | "unavailable">("fallback");
  const [items, setItems] = useState<MarketItem[]>(starterItems);
  const [myItems, setMyItems] = useState<MarketItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [aiReviewBusy, setAiReviewBusy] = useState(false);
  const [aiReview, setAiReview] = useState<ListingAiReview | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [mediaAssetIds, setMediaAssetIds] = useState<string[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [metadataFilters, setMetadataFilters] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [marketSort, setMarketSort] = useState<MarketSort>("newest");
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(() => getWorkspaceFromLocation());
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ListingForm>(initialForm);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const deletingListingIdsRef = useRef(new Set<string>());
  const [composeOpen, setComposeOpen] = useState(false);
  const [pendingCreateListing, setPendingCreateListing] = useState(false);
  const [transportOpen, setTransportOpen] = useState(false);
  const [transportForm, setTransportForm] = useState<TransportForm>(initialTransportForm);
  const [transportSubmitting, setTransportSubmitting] = useState(false);
  const [transportQuery, setTransportQuery] = useState("");
  const [transportSearchOpen, setTransportSearchOpen] = useState(false);
  const [transportOriginId, setTransportOriginId] = useState("all");
  const [transportDestinationId, setTransportDestinationId] = useState("all");
  const [transportModeFilter, setTransportModeFilter] = useState<"all" | TransportMode>("all");
  const [transportResults, setTransportResults] = useState<TransportResult[]>([]);
  const [transportSearchBusy, setTransportSearchBusy] = useState(false);
  const [transportNotice, setTransportNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [authPhone, setAuthPhone] = useState("+98");
  const [authOtp, setAuthOtp] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [authBusy, setAuthBusy] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [businessForm, setBusinessForm] = useState(initialBusinessForm);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [myStorefront, setMyStorefront] = useState<Storefront | null>(null);
  const [storefrontForm, setStorefrontForm] = useState(initialStorefrontForm);
  const [storefrontSaving, setStorefrontSaving] = useState(false);
  const [publicStorefront, setPublicStorefront] = useState<{ storefront: Storefront; listings: MarketItem[] } | null>(null);
  const storefrontSlug = sitePathname().match(/^\/storefront\/([^/]+)/)?.[1] ?? "";
  const listingSlug = sitePathname().match(/^\/listing\/([^/]+)/)?.[1] ?? "";
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>({ totals: { views: 0, favorites: 0, contacts: 0 }, listings: [] });
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [analyticsBusy, setAnalyticsBusy] = useState(false);
  const [captchaChallengeId, setCaptchaChallengeId] = useState("");
  const [captchaTarget, setCaptchaTarget] = useState(() => getCaptchaTarget());
  const [captchaY, setCaptchaY] = useState(() => getCaptchaY());
  const [captchaValue, setCaptchaValue] = useState(0);
  const [captchaDragging, setCaptchaDragging] = useState(false);
  const captchaBoardRef = useRef<HTMLDivElement | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(SESSION_STORAGE_KEY) ?? "");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [contactedItemIds, setContactedItemIds] = useState<string[]>([]);
  const [reportedItemIds, setReportedItemIds] = useState<string[]>([]);
  const [moderationCases, setModerationCases] = useState<ModerationCase[]>([]);
  const [pendingContents, setPendingContents] = useState<MarketItem[]>([]);
  const [moderationBusyId, setModerationBusyId] = useState<string>("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUserContents, setAdminUserContents] = useState<AdminUserContent[]>([]);
  const [adminSupport, setAdminSupport] = useState<SupportTicket[]>([]);
  const [adminStorefronts, setAdminStorefronts] = useState<Storefront[]>([]);
  const [adminIdentityVerifications, setAdminIdentityVerifications] = useState<any[]>([]);
  const [mySupport, setMySupport] = useState<SupportTicket[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [reportedMessageIds, setReportedMessageIds] = useState<string[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [notificationEvents, setNotificationEvents] = useState<NotificationEvent[]>([]);
  const [pushSubscriptionCount, setPushSubscriptionCount] = useState(0);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushTestBusy, setPushTestBusy] = useState(false);
  const previousUnreadRef = useRef<Map<string, number>>(new Map());
  const notificationReadyRef = useRef(false);

  useEffect(() => {
    void boot();
  }, []);

  useEffect(() => {
    const syncRoute = () => setActiveWorkspace(getWorkspaceFromLocation());
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  useEffect(() => {
    if (!storefrontSlug) {
      setPublicStorefront(null);
      return;
    }
    let cancelled = false;
    void fetch(`${API_BASE_URL}/api/v1/storefronts/by-slug/${encodeURIComponent(storefrontSlug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ data: { storefront: Storefront; listings: MarketItem[] } }>;
      })
      .then((body) => { if (!cancelled) setPublicStorefront(body.data); })
      .catch(() => { if (!cancelled) setPublicStorefront(null); });
    return () => { cancelled = true; };
  }, [storefrontSlug]);

  useEffect(() => {
    const pageTitles: Record<Workspace, string> = {
      market: "بازار محلی 4D | خرید و فروش در منطقه چهارده",
      profile: "حساب من | بازار محلی 4D",
      admin: "مدیریت | بازار محلی 4D"
    };
    document.title = pageTitles[activeWorkspace];
    const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.content = activeWorkspace === "market"
        ? "index, follow, max-image-preview:large"
        : "noindex, nofollow, noarchive";
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (!authToken) return undefined;
    const intervalId = window.setInterval(() => {
      void refreshData(authToken);
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [authToken]);

  useEffect(() => {
    if (!composeOpen && !transportOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setComposeOpen(false);
        setTransportOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [composeOpen, transportOpen]);

  async function boot() {
    await loadCaptchaChallenge();
    await refreshData(authToken);
    setAuthReady(true);
  }

  async function requestOtp(event?: React.FormEvent) {
    event?.preventDefault();
    if (!normalizedAuthPhone) {
      setNotice("شماره موبایل را با پیش‌شماره 09 یا +98 وارد کن.");
      return;
    }
    if (!captchaSolved) {
      setNotice("اول قطعه پازل را روی نشان هدف بگذار تا ارسال کد فعال شود.");
      return;
    }
    setAuthBusy(true);
    setNotice("");
    try {
      const proof = await requestCaptchaProof();
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/request-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone_number: normalizedAuthPhone, captcha_proof: proof })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }
      setAuthPhone(normalizedAuthPhone);
      setAuthStep("otp");
      setNotice("کد ورود ارسال شد. کد پیامک‌شده را وارد کن.");
    } catch (error) {
      if (error instanceof Error && ["captcha_refresh_required", "captcha_expired", "captcha_invalid"].includes(error.message)) {
        setNotice(error.message === "captcha_invalid" ? "پاسخ پازل درست نبود. دوباره تلاش کن." : "پازل امنیتی منقضی شد. یک بار دیگر قطعه را روی نشان هدف بگذار.");
        await loadCaptchaChallenge();
        return;
      }
      setNotice(
        error instanceof Error && error.message === "HTTP 429"
          ? "درخواست کد زیاد شده؛ کمی صبر کن یا آخرین کد پیامک‌شده را وارد کن."
          : error instanceof Error && !error.message.startsWith("HTTP")
            ? error.message
            : "ارسال کد انجام نشد. شماره موبایل و وضعیت سرویس پیامک را بررسی کن."
      );
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyOtp(event?: React.FormEvent) {
    event?.preventDefault();
    if (!normalizedAuthPhone) {
      setNotice("شماره موبایل معتبر نیست.");
      return "";
    }
    setAuthBusy(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone_number: normalizedAuthPhone, otp: normalizeOtpCode(authOtp) })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const code = errorBody?.error?.code ?? "request_failed";
        const message = typeof errorBody?.error?.message === "string" ? errorBody.error.message : "";
        if (response.status === 503 || code === "service_unavailable") throw new Error("auth_service_unavailable");
        if (code === "invalid_otp") throw new Error("invalid_otp");
        if (code === "otp_expired") throw new Error("otp_expired");
        throw new Error(message || `HTTP ${response.status}`);
      }

      const body = (await response.json()) as { data: AuthSession };
      localStorage.setItem(SESSION_STORAGE_KEY, body.data.token);
      if (body.data.refresh_token) localStorage.setItem(REFRESH_SESSION_STORAGE_KEY, body.data.refresh_token);
      setAuthToken(body.data.token);
      setAuthOtp("");
      setAuthStep("phone");
      resetCaptcha();
      setNotice("ورود انجام شد. حالا می‌توانی آگهی ثبت کنی و آگهی‌های خودت را ببینی.");
      await refreshData(body.data.token);
      return body.data.token;
    } catch (error) {
      setNotice(
        error instanceof Error && error.message === "auth_service_unavailable"
          ? "سرویس احراز هویت موقتاً در دسترس نیست. چند لحظه بعد دوباره تلاش کن."
          : error instanceof Error && error.message === "otp_expired"
            ? "زمان اعتبار کد تمام شده است. کد جدید بگیر."
            : error instanceof Error && error.message === "invalid_otp"
              ? "کد واردشده صحیح نیست."
              : error instanceof Error && error.message.startsWith("HTTP")
                ? "پاسخ احراز هویت نامعتبر بود. دوباره تلاش کن."
                : "ارتباط با سرور برقرار نشد."
      );
      return "";
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    const token = authToken;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(REFRESH_SESSION_STORAGE_KEY);
    setAuthToken("");
    setCurrentUser(null);
    setAuthReady(true);
    resetCaptcha();
    setModerationCases([]);
    setPendingContents([]);
    setAdminUsers([]);
    setAdminSupport([]);
    setMySupport([]);
    setMyItems([]);
    setConversations([]);
    setActiveConversationId("");
    setConversationMessages([]);
    setReportedMessageIds([]);
    setNotificationEvents([]);
    setPushSubscriptionCount(0);
    previousUnreadRef.current = new Map();
    notificationReadyRef.current = false;

    if (token) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(token),
        body: "{}"
      }).catch(() => undefined);
    }

    setNotice("از حساب خارج شدی. برای ثبت آگهی یا دیدن آگهی‌های خودت دوباره وارد شو.");
  }

  function navigateWorkspace(workspace: Workspace) {
    setActiveWorkspace(workspace);
    const nextPath = sitePath(workspace === "admin" ? "/admin" : workspace === "profile" ? "/profile" : "/");
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  }

  function openListingComposer() {
    if (!authToken) {
      setPendingCreateListing(true);
      setComposeOpen(false);
      navigateWorkspace("profile");
      setNotice("برای ثبت آگهی وارد شو؛ بعد از ورود به فرم ثبت آگهی برمی‌گردی.");
      return;
    }
    navigateWorkspace("market");
    setComposeOpen(true);
  }

  async function refreshData(token = authToken) {
    setRefreshing(true);
    setNotice("");
    try {
      const authHeaders = getAuthHeaders(token, { json: false });
      const fetchAuthJson = async <T,>(path: string): Promise<T> => {
        let response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders });
        if (response.status === 401 && token && path !== "/api/v1/auth/refresh") {
          const nextToken = await refreshWebSession();
          if (nextToken) response = await fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders(nextToken, { json: false }) });
        }
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const code = body?.error?.code;
          const error = new Error(code ? `API_ERROR:${code}` : `HTTP ${response.status}`);
          throw error;
        }
        return response.json() as Promise<T>;
      };
      const myContentsPromise: Promise<ApiListResponse<MarketItem>> = token
        ? fetchAuthJson<ApiListResponse<MarketItem>>("/api/v1/me/contents")
        : Promise.resolve({ data: [] });
      const mePromise: Promise<{ data: CurrentUser }> = token
        ? fetchAuthJson<{ data: CurrentUser }>("/api/v1/me")
        : Promise.reject(new Error("no_session"));
      const conversationsPromise: Promise<ApiListResponse<Conversation>> = token
        ? fetchAuthJson<ApiListResponse<Conversation>>("/api/v1/me/conversations")
        : Promise.resolve({ data: [] });
      const pushSubscriptionsPromise: Promise<ApiListResponse<PushSubscriptionSummary>> = token
        ? fetchAuthJson<ApiListResponse<PushSubscriptionSummary>>("/api/v1/me/push-subscriptions")
        : Promise.resolve({ data: [] });
      const favoritesPromise: Promise<ApiListResponse<string>> = token
        ? fetchAuthJson<ApiListResponse<string>>("/api/v1/me/favorites")
        : Promise.resolve({ data: [] });
      const analyticsPromise = token
        ? fetchAuthJson<{ data: AnalyticsSummary }>("/api/v1/me/analytics")
        : Promise.reject(new Error("no_session"));
      const analyticsPreferencesPromise = token
        ? fetchAuthJson<{ data: { allow_personalized_events: boolean } }>("/api/v1/me/analytics/preferences")
        : Promise.reject(new Error("no_session"));
      const mySupportPromise: Promise<ApiListResponse<SupportTicket>> = token
        ? fetchAuthJson<ApiListResponse<SupportTicket>>("/api/v1/me/support")
        : Promise.resolve({ data: [] });
      const myStorefrontPromise: Promise<{ data: Storefront | null }> = token
        ? fetchAuthJson<{ data: Storefront | null }>("/api/v1/me/storefront")
        : Promise.resolve({ data: null });
      const [
        readyResult,
        citiesResult,
        categoriesResult,
        feedResult,
        myContentsResult,
        meResult,
        conversationsResult,
        pushSubscriptionsResult,
        favoritesResult,
        analyticsResult,
        analyticsPreferencesResult,
        mySupportResult,
        myStorefrontResult
      ] = await Promise.allSettled([
        getJson<ReadyResponse>(API_HEALTH_READY_PATH),
        getJson<ApiListResponse<City>>("/api/v1/regions/4d/cities"),
        getJson<ApiListResponse<Category>>("/api/v1/categories"),
        getJson<FeedResponse<MarketItem>>("/api/v1/feed"),
        myContentsPromise,
        mePromise,
        conversationsPromise,
        pushSubscriptionsPromise,
        favoritesPromise,
        analyticsPromise,
        analyticsPreferencesPromise,
        mySupportPromise,
        myStorefrontPromise
      ]);

      if (readyResult.status === "fulfilled") setReady(readyResult.value);
      if (citiesResult.status === "fulfilled") {
        setCities(citiesResult.value.data);
        setTaxonomySource(citiesResult.value.meta?.source ?? "database");
        setForm((current) => ({ ...current, city_id: current.city_id || citiesResult.value.data[0]?.id || "" }));
        setStorefrontForm((current) => ({ ...current, city_id: current.city_id || citiesResult.value.data[0]?.id || "" }));
        setProfileForm((current) => ({
          ...current,
          primary_city_id: citiesResult.value.data.some((city) => city.id === current.primary_city_id)
            ? current.primary_city_id
            : citiesResult.value.data[0]?.id || ""
        }));
      }
      if (categoriesResult.status === "fulfilled") {
        setCategories(categoriesResult.value.data);
        setForm((current) => ({
          ...current,
          category_id: current.category_id || categoriesResult.value.data[0]?.id || ""
        }));
        setStorefrontForm((current) => ({ ...current, category_id: current.category_id || categoriesResult.value.data[0]?.id || "" }));
      }
      if (feedResult.status === "fulfilled" && feedResult.value.meta?.source !== "unavailable") {
        setItems(feedResult.value.data);
      } else if (myContentsResult.status === "fulfilled" && myContentsResult.value.data.length) {
        setItems(myContentsResult.value.data);
      } else {
        setItems(import.meta.env.DEV ? starterItems : []);
      }
      if (myContentsResult.status === "fulfilled") {
        setMyItems(myContentsResult.value.data);
      }
      if (conversationsResult.status === "fulfilled") {
        handleConversationNotifications(conversationsResult.value.data);
        setConversations(conversationsResult.value.data);
      } else {
        setConversations([]);
      }
      if (pushSubscriptionsResult.status === "fulfilled") {
        setPushSubscriptionCount(pushSubscriptionsResult.value.data.length);
      } else {
        setPushSubscriptionCount(0);
      }
      if (favoritesResult.status === "fulfilled" && Array.isArray(favoritesResult.value.data)) setFavoriteIds(favoritesResult.value.data);
      if (analyticsResult.status === "fulfilled" && analyticsResult.value.data) setAnalyticsSummary(analyticsResult.value.data);
      if (analyticsPreferencesResult.status === "fulfilled" && analyticsPreferencesResult.value.data) {
        setAnalyticsConsent(analyticsPreferencesResult.value.data.allow_personalized_events);
      }
      if (mySupportResult.status === "fulfilled" && Array.isArray(mySupportResult.value.data)) setMySupport(mySupportResult.value.data);
      if (myStorefrontResult.status === "fulfilled") {
        const storefront = myStorefrontResult.value.data;
        setMyStorefront(storefront);
        if (storefront) {
          setStorefrontForm({
            name: storefront.name,
            slug: storefront.slug,
            short_description: storefront.short_description,
            description: storefront.description,
            business_type: storefront.business_type,
            address: storefront.address ?? "",
            phone: storefront.phone ?? "",
            secondary_phone: storefront.secondary_phone ?? "",
            working_hours: storefront.working_hours?.text ?? "",
            city_id: storefront.city_id,
            category_id: storefront.category_id
          });
          setForm((current) => ({ ...current, storefront_id: current.storefront_id || storefront.id }));
        }
      }
      if (meResult.status === "fulfilled") {
        setCurrentUser(meResult.value.data);
        const business = meResult.value.data.business_profile;
        if (business) setBusinessForm({ business_name: business.business_name, business_type: business.business_type, bio: business.bio ?? "", service_area: business.service_area, opening_hours: business.opening_hours, is_public: business.is_public });
        const availableCities = citiesResult.status === "fulfilled" ? citiesResult.value.data : cities;
        setProfileForm((current) => ({
          ...current,
          first_name: meResult.value.data.profile?.first_name ?? "",
          last_name: meResult.value.data.profile?.last_name ?? "",
          primary_city_id: availableCities.some((city) => city.id === meResult.value.data.profile?.primary_city_id)
            ? meResult.value.data.profile?.primary_city_id ?? current.primary_city_id
            : current.primary_city_id
        }));
      } else {
        setCurrentUser(null);
        const isUnauthorized = token && meResult.reason instanceof Error && (meResult.reason.message === "HTTP 401" || meResult.reason.message === "API_ERROR:unauthorized");
        if (isUnauthorized && token === authToken) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setAuthToken("");
          setNotice("نشست قبلی منقضی شده است؛ برای ادامه دوباره وارد شو.");
        }
      }
      if (
        [readyResult, citiesResult, categoriesResult].some((result) => result.status === "rejected")
        || (feedResult.status === "fulfilled" && feedResult.value.meta?.source === "unavailable")
      ) {
        setNotice("اتصال API کامل نیست. API را اجرا کن و دوباره تازه‌سازی بزن.");
      }
      const nextIsModerator = meResult.status === "fulfilled" && meResult.value.data.roles.includes("moderator");
      if (nextIsModerator) {
        await refreshModerationCases(token);
        await refreshPendingContents(token);
        await refreshAdminSupport(token);
        await refreshAdminStorefronts(token);
        await refreshAdminIdentityVerifications(token);
        if (meResult.status === "fulfilled" && meResult.value.data.roles.includes("admin")) await refreshAdminUsers(token);
      } else {
        setModerationCases([]);
        setPendingContents([]);
        setAdminSupport([]);
        setAdminStorefronts([]);
        setAdminUsers([]);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function updateAnalyticsConsent(allow: boolean) {
    setAnalyticsBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/me/analytics/preferences`, { method: "PUT", headers: getAuthHeaders(authToken), body: JSON.stringify({ allow_personalized_events: allow }) });
      if (!response.ok) throw new Error("analytics_preferences_failed");
      setAnalyticsConsent(allow);
      setNotice(allow ? "ثبت analytics فعال شد." : "ثبت eventهای شخصی analytics متوقف شد.");
    } catch { setNotice("ذخیره تنظیم analytics انجام نشد."); }
    finally { setAnalyticsBusy(false); }
  }

  async function deleteAnalyticsEvents() {
    setAnalyticsBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/me/analytics/events`, { method: "DELETE", headers: getAuthHeaders(authToken, { json: false }) });
      if (!response.ok) throw new Error("analytics_delete_failed");
      setAnalyticsSummary({ totals: { views: 0, favorites: 0, contacts: 0 }, listings: [] });
      setNotice("داده‌های رفتاری ثبت‌شده برای حساب شما حذف شد.");
    } catch { setNotice("حذف داده‌های analytics انجام نشد."); }
    finally { setAnalyticsBusy(false); }
  }

  function handleConversationNotifications(nextConversations: Conversation[]) {
    const nextUnread = new Map<string, number>();
    const events: NotificationEvent[] = [];

    nextConversations.forEach((conversation) => {
      const unread = conversation.is_muted || conversation.is_blocked ? 0 : conversation.unread_count ?? 0;
      nextUnread.set(conversation.id, unread);
      const previousUnread = previousUnreadRef.current.get(conversation.id) ?? 0;
      const isNewIncoming =
        notificationReadyRef.current &&
        unread > previousUnread &&
        conversation.last_message_sender_user_id !== currentUser?.id &&
        conversation.id !== activeConversationId;

      if (isNewIncoming) {
        events.push({
          id: `${conversation.id}-${conversation.last_message_at ?? conversation.updated_at}`,
          conversation_id: conversation.id,
          title: conversation.content_title,
          body: conversation.last_message_body ? trimText(conversation.last_message_body, 80) : "پیام جدید در گفتگو",
          created_at: conversation.last_message_at ?? conversation.updated_at
        });
      }
    });

    previousUnreadRef.current = nextUnread;
    if (!notificationReadyRef.current) {
      notificationReadyRef.current = true;
      return;
    }
    if (!events.length) return;

    setNotificationEvents((current) => [...events, ...current].slice(0, 4));
    events.slice(0, 2).forEach((event) => {
      if (notificationPermission === "granted" && "Notification" in window) {
        new Notification("پیام جدید در 4D", {
          body: `${event.title}: ${event.body}`,
          tag: event.conversation_id
        });
      }
    });
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      setNotice("مرورگر فعلی اعلان سیستم را پشتیبانی نمی‌کند.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    setNotice(permission === "granted" ? "اعلان مرورگر برای پیام‌های جدید فعال شد." : "اعلان مرورگر فعال نشد؛ اعلان داخل برنامه همچنان کار می‌کند.");
  }

  async function syncPushSubscription() {
    if (!authToken) {
      navigateWorkspace("profile");
      return;
    }
    if (import.meta.env.BASE_URL !== "/" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setNotice("این مرورگر Push واقعی را پشتیبانی نمی‌کند؛ اعلان داخل برنامه همچنان فعال است.");
      return;
    }
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      setNotice("این مرورگر اعلان سیستم را پشتیبانی نمی‌کند.");
      return;
    }

    setPushBusy(true);
    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== "granted") {
        setNotice("برای ثبت Push واقعی باید اعلان مرورگر را مجاز کنی.");
        return;
      }
      if (!VAPID_PUBLIC_KEY) {
        setNotice("کلید VITE_VAPID_PUBLIC_KEY هنوز تنظیم نشده؛ API آماده است اما Push واقعی بعد از تنظیم VAPID ثبت می‌شود.");
        return;
      }

      const registration = await navigator.serviceWorker.register(sitePath("/service-worker.js"));
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }));
      const json = subscription.toJSON();
      const response = await fetch(`${API_BASE_URL}/api/v1/me/push-subscriptions`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setPushSubscriptionCount((count) => Math.max(count, 1));
      setNotice("Push واقعی برای این دستگاه آماده شد.");
    } catch {
      setNotice("ثبت Push واقعی انجام نشد. کلید VAPID، HTTPS و اتصال API را بررسی کن.");
    } finally {
      setPushBusy(false);
    }
  }

  async function sendPushTest() {
    if (!authToken) {
      navigateWorkspace("profile");
      return;
    }
    setPushTestBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/me/push-test`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: "{}"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: { attempted: number; sent: number; skipped: boolean; revoked: number } };
      if (body.data.skipped) {
        setNotice("کلیدهای VAPID سمت API کامل نیستند؛ ارسال تست Push انجام نشد.");
      } else if (body.data.sent > 0) {
        setNotice("اعلان تست Push ارسال شد. notification دستگاه را بررسی کن.");
      } else if (body.data.attempted === 0) {
        setNotice("برای این حساب هنوز دستگاه آماده Push ثبت نشده است.");
      } else {
        setNotice("ارسال تست Push انجام نشد؛ ممکن است permission مرورگر یا subscription منقضی شده باشد.");
      }
      await refreshData();
    } catch {
      setNotice("تست Push انجام نشد. API، کلیدهای VAPID و subscription دستگاه را بررسی کن.");
    } finally {
      setPushTestBusy(false);
    }
  }

  async function refreshModerationCases(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/moderation/cases`, {
        headers: getModeratorHeaders(token)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as FeedResponse<ModerationCase>;
      setModerationCases(body.data);
    } catch {
      setModerationCases([]);
    }
  }

  async function decideModerationCase(caseId: string, decision: "dismiss_report" | "escalate" | "reject_content") {
    setModerationBusyId(caseId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/moderation/cases/${caseId}/decisions`, {
        method: "POST",
        headers: getModeratorHeaders(authToken),
        body: JSON.stringify({
          decision,
          reason: decision === "dismiss_report" ? "گزارش بررسی شد و اقدام عمومی لازم ندارد." : "نیازمند بررسی دقیق‌تر."
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice("تصمیم moderation ثبت شد و صف به‌روز شد.");
      await refreshModerationCases();
      await refreshData();
    } catch {
      setNotice("ثبت تصمیم moderation انجام نشد. وضعیت API/DB را بررسی کن.");
    } finally {
      setModerationBusyId("");
    }
  }

  async function refreshPendingContents(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/moderation/contents`, {
        headers: getModeratorHeaders(token)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as FeedResponse<MarketItem>;
      setPendingContents(body.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes("HTTP 503")) {
        setNotice("صف بررسی آگهی موقتاً در دسترس نیست؛ migration دیتابیس یا وضعیت API را بررسی کن.");
      }
    }
  }

  async function refreshAdminUsers(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, { headers: getModeratorHeaders(token) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: AdminUser[] };
      setAdminUsers(body.data);
    } catch { setAdminUsers([]); }
  }

  async function refreshAdminUserContents(userId: string) {
    if (!userId) { setAdminUserContents([]); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/contents`, { headers: getModeratorHeaders(authToken) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: AdminUserContent[] };
      setAdminUserContents(body.data);
    } catch { setAdminUserContents([]); }
  }

  async function refreshAdminSupport(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/support`, { headers: getModeratorHeaders(token) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: SupportTicket[] };
      setAdminSupport(body.data);
    } catch { setAdminSupport([]); }
  }

  async function refreshAdminStorefronts(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/storefronts`, { headers: getModeratorHeaders(token) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: Storefront[] };
      setAdminStorefronts(body.data);
    } catch { setAdminStorefronts([]); }
  }

  async function refreshAdminIdentityVerifications(token = authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/identity-verifications`, { headers: getModeratorHeaders(token) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: any[] };
      setAdminIdentityVerifications(body.data);
    } catch { setAdminIdentityVerifications([]); }
  }

  async function decideAdminIdentityVerification(requestId: string, decision: "approve" | "reject" | "revoke", reason?: string) {
    setModerationBusyId(requestId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/identity-verifications/${requestId}/decision`, {
        method: "POST", headers: getModeratorHeaders(authToken), body: JSON.stringify({ decision, reason })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice(decision === "approve" ? "احراز هویت تایید شد." : decision === "revoke" ? "تأیید هویت لغو شد." : "درخواست احراز هویت رد شد.");
      await refreshAdminIdentityVerifications();
      await refreshData();
    } catch { setNotice("تصمیم احراز هویت ثبت نشد؛ وضعیت API و migration را بررسی کن."); }
    finally { setModerationBusyId(""); }
  }

  async function getAdminIdentityDocument(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/identity-verifications/${requestId}/document`, { headers: getModeratorHeaders(authToken, { json: false }) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return URL.createObjectURL(await response.blob());
  }

  async function decideAdminStorefront(storefrontId: string, decision: "approve" | "suspend" | "archive") {
    setModerationBusyId(storefrontId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/storefronts/${storefrontId}/decisions`, {
        method: "POST",
        headers: getModeratorHeaders(authToken),
        body: JSON.stringify({ decision, reason: decision === "approve" ? undefined : "غرفه در بررسی ادمین تایید نشد." })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice(decision === "approve" ? "غرفه تایید و فعال شد." : "وضعیت غرفه به‌روز شد.");
      await refreshAdminStorefronts();
      await refreshData();
    } catch { setNotice("تصمیم غرفه ثبت نشد؛ migration و وضعیت API را بررسی کن."); }
    finally { setModerationBusyId(""); }
  }

  async function updateUserVerification(userId: string, status: "verified" | "rejected" | "profile_complete") {
    setModerationBusyId(userId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/verification`, {
        method: "PUT", headers: getModeratorHeaders(authToken), body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice("وضعیت اعتماد کاربر به‌روز شد.");
      await refreshAdminUsers();
    } catch { setNotice("به‌روزرسانی وضعیت کاربر انجام نشد."); }
    finally { setModerationBusyId(""); }
  }

  async function deleteAdminContent(contentId: string) {
    if (!window.confirm("این آگهی برای همیشه حذف شود؟")) return;
    setModerationBusyId(contentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/contents/${contentId}`, { method: "DELETE", headers: getModeratorHeaders(authToken, { json: false }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice("آگهی حذف شد.");
      await refreshPendingContents();
      await refreshData();
    } catch { setNotice("حذف آگهی انجام نشد؛ دسترسی admin و وضعیت API را بررسی کن."); }
    finally { setModerationBusyId(""); }
  }

  async function replyAdminSupport(ticketId: string, reply: string) {
    const text = reply.trim();
    if (!text) return;
    setModerationBusyId(ticketId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/support/${ticketId}`, { method: "PUT", headers: getModeratorHeaders(authToken), body: JSON.stringify({ reply: text, status: "closed" }) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice("پاسخ پشتیبانی ارسال شد.");
      await refreshAdminSupport();
    } catch { setNotice("ارسال پاسخ پشتیبانی انجام نشد."); }
    finally { setModerationBusyId(""); }
  }

  async function getAdminContentDetail(contentId: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/contents/${contentId}`, { headers: getModeratorHeaders(authToken) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    return body.data;
  }

  async function decidePendingContent(contentId: string, decision: "approve" | "reject") {
    setModerationBusyId(contentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/moderation/contents/${contentId}/decisions`, {
        method: "POST",
        headers: getModeratorHeaders(authToken),
        body: JSON.stringify({
          decision,
          reason: decision === "approve" ? "آگهی برای انتشار عمومی تایید شد." : "آگهی با قوانین انتشار سازگار نیست."
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice(decision === "approve" ? "آگهی تایید و منتشر شد." : "آگهی رد شد و از انتشار خارج ماند.");
      await refreshPendingContents();
      await refreshData();
    } catch {
      setNotice("ثبت تصمیم آگهی انجام نشد. وضعیت API/DB را بررسی کن.");
    } finally {
      setModerationBusyId("");
    }
  }

  const filteredItems = useMemo(
    () => {
      const normalizedQuery = normalizeSearchText(query);
      return items
        .map((item) => ({ item, relevance: normalizedQuery ? getSearchRelevance(item, normalizedQuery, cities, categories) : 0 }))
        .filter(({ item, relevance }) => {
        const cityOk = selectedCityId === "all" || item.city_id === selectedCityId;
        const categoryOk = selectedCategoryId === "all" || item.category_id === selectedCategoryId;
        const numericPrice = item.price_amount == null ? null : Number(item.price_amount);
        const minPriceValue = minPrice.trim() ? Number(minPrice.replace(/,/g, "")) : null;
        const maxPriceValue = maxPrice.trim() ? Number(maxPrice.replace(/,/g, "")) : null;
        const minOk = minPriceValue == null || (numericPrice != null && Number.isFinite(minPriceValue) && numericPrice >= minPriceValue);
        const maxOk = maxPriceValue == null || (numericPrice != null && Number.isFinite(maxPriceValue) && numericPrice <= maxPriceValue);
        const metadataOk = Object.entries(metadataFilters).every(([key, value]) => !value || String(item.metadata_json?.[key] ?? "").toLocaleLowerCase("fa").includes(value.toLocaleLowerCase("fa")));
        const queryOk = !normalizedQuery || relevance > 0;
        return cityOk && categoryOk && minOk && maxOk && metadataOk && queryOk;
      })
        .sort((left, right) => {
          if (normalizedQuery && right.relevance !== left.relevance) return right.relevance - left.relevance;
          const leftItem = left.item;
          const rightItem = right.item;
          if (marketSort === "price_low") return (leftItem.price_amount ?? Number.POSITIVE_INFINITY) - (rightItem.price_amount ?? Number.POSITIVE_INFINITY);
          if (marketSort === "price_high") return (rightItem.price_amount ?? Number.NEGATIVE_INFINITY) - (leftItem.price_amount ?? Number.NEGATIVE_INFINITY);
          return String(rightItem.created_at ?? "").localeCompare(String(leftItem.created_at ?? ""));
        })
        .map(({ item }) => item);
    },
    [items, marketSort, maxPrice, minPrice, metadataFilters, query, selectedCategoryId, selectedCityId]
  );

  const serviceCategories = useMemo(
    () => categories.filter((category) => Array.isArray(category.content_types) && category.content_types.map(String).includes("service_listing")),
    [categories]
  );
  const formCategories = useMemo(() => {
    const source = form.content_type === "service_listing" && serviceCategories.length ? serviceCategories : categories;
    return source;
  }, [categories, form.content_type, serviceCategories]);
  const selectedFormCategory = formCategories.find((category) => category.id === form.category_id);
  const formMetadataFields = selectedFormCategory?.metadata_schema ?? [];
  const formFieldPolicy = getListingFieldPolicy(selectedFormCategory?.slug, form.content_type);
  const selectedFilterCategory = categories.find((category) => category.id === selectedCategoryId);
  const filterMetadataFields = selectedFilterCategory?.metadata_schema ?? [];

  const selectedCity = cities.find((city) => city.id === selectedCityId);
  const allKnownItems = useMemo(() => mergeItems(myItems, items), [items, myItems]);
  const selectedItem = allKnownItems.find((item) => item.id === selectedItemId) ?? null;
  const [selectedViewCount, setSelectedViewCount] = useState<number | null>(null);
  const selectedItemMedia = selectedItem ? getItemMedia(selectedItem) : [];
  useEffect(() => setSelectedMediaIndex(0), [selectedItemId]);
  const [selectedBusinessProfile, setSelectedBusinessProfile] = useState<BusinessProfile | null>(null);
  const [selectedTrustSummary, setSelectedTrustSummary] = useState<PublicTrustSummary | null>(null);
  useEffect(() => {
    const ownerId = selectedItem?.owner_user_id;
    if (!ownerId || ownerId === currentUser?.id) {
      setSelectedBusinessProfile(null);
      setSelectedTrustSummary(null);
      return;
    }
    let cancelled = false;
    void Promise.all([
      fetch(`${API_BASE_URL}/api/v1/business-profiles/${ownerId}`).then((response) => response.json()) as Promise<{ data?: BusinessProfile | null }>,
      fetch(`${API_BASE_URL}/api/v1/business-profiles/${ownerId}/trust`).then((response) => response.json()) as Promise<{ data?: PublicTrustSummary | null }>
    ]).then(([profileResult, trustResult]) => {
        if (!cancelled) {
          setSelectedBusinessProfile(profileResult.data ?? null);
          setSelectedTrustSummary(trustResult.data ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedBusinessProfile(null);
          setSelectedTrustSummary(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, selectedItem?.owner_user_id]);
  const similarItems = useMemo(
    () => selectedItem
      ? allKnownItems
          .filter((item) => item.id !== selectedItem.id)
          .map((item) => ({ item, score: getSimilarityScore(selectedItem, item) }))
          .filter(({ score }) => score > 0)
          .sort((left, right) => right.score - left.score)
          .slice(0, 3)
          .map(({ item }) => item)
      : [],
    [allKnownItems, selectedItem]
  );
  const selectedItemConversation = selectedItem
    ? conversations.find((conversation) => conversation.content_id === selectedItem.id)
    : null;
  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null;

  useEffect(() => {
    if (!selectedItem && !activeConversation) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeConversation) setActiveConversationId("");
      else setSelectedItemId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeConversation, selectedItem]);
  const unreadConversationCount = conversations.reduce(
    (total, conversation) => total + (conversation.is_muted ? 0 : conversation.unread_count ?? 0),
    0
  );
  const databaseReady = ready?.checks?.database === "ok";
  const smsReady = ready?.checks?.sms === "configured";
  const approvedCount = items.filter((item) => item.status === "approved").length;
  const isModerator = currentUser?.roles.includes("moderator") ?? false;
  const isAdmin = currentUser?.roles.includes("admin") ?? false;
  const profileComplete = currentUser?.profile_complete ?? false;
  useEffect(() => {
    if (!pendingCreateListing || !authToken || !profileComplete) return;
    setPendingCreateListing(false);
    navigateWorkspace("market");
    setComposeOpen(true);
  }, [authToken, pendingCreateListing, profileComplete]);
  const firstLoad = !authReady && refreshing;
  const normalizedAuthPhone = normalizeIranPhone(authPhone);
  const captchaDistance = Math.abs(captchaValue - captchaTarget);
  const captchaSolved = captchaDistance <= 3;
  const captchaClose = !captchaSolved && captchaDistance <= 10;
  const captchaClassName = captchaSolved ? "puzzle-captcha solved" : captchaClose ? "puzzle-captcha close" : "puzzle-captcha";
  const captchaSceneStyle = {
    "--captcha-value": `${captchaValue}%`,
    "--captcha-target": `${captchaTarget}%`,
    "--captcha-y": `${captchaY}%`
  } as React.CSSProperties;

  function openItem(item: MarketItem) {
    setSelectedItemId(item.id);
    setSelectedViewCount(item.view_count ?? 0);
    void fetch(`${API_BASE_URL}/api/v1/contents/${encodeURIComponent(item.id)}`, { headers: getAuthHeaders() })
      .then((response) => response.ok ? response.json() as Promise<{ data?: { view_count?: number } }> : null)
      .then((body) => { if (body?.data?.view_count != null) setSelectedViewCount(body.data.view_count); })
      .catch(() => undefined);
  }

  function resetCaptcha() {
    void loadCaptchaChallenge();
  }

  async function loadCaptchaChallenge() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/captcha-challenge`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as { data: { challenge_id: string; target: number; y: number } };
      setCaptchaChallengeId(body.data.challenge_id);
      setCaptchaTarget(body.data.target);
      setCaptchaY(body.data.y);
    } catch {
      setCaptchaChallengeId("");
      setCaptchaTarget(getCaptchaTarget());
      setCaptchaY(getCaptchaY());
    } finally {
      setCaptchaValue(0);
      setCaptchaDragging(false);
    }
  }

  async function requestCaptchaProof() {
    if (!captchaChallengeId) throw new Error("captcha_refresh_required");
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/captcha-proof`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challenge_id: captchaChallengeId, value: captchaValue })
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
      throw new Error(body?.error?.code === "captcha_expired" ? "captcha_expired" : "captcha_invalid");
    }
    const body = (await response.json()) as { data: { captcha_proof: string } };
    return body.data.captcha_proof;
  }

  function updateCaptchaFromPointer(clientX: number) {
    const rect = captchaBoardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextValue = ((clientX - rect.left) / rect.width) * 100;
    setCaptchaValue(Math.max(0, Math.min(100, Math.round(nextValue))));
  }

  function startCaptchaDrag(event: React.PointerEvent<HTMLElement>) {
    setCaptchaDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateCaptchaFromPointer(event.clientX);
  }

  function moveCaptchaDrag(event: React.PointerEvent<HTMLElement>) {
    if (!captchaDragging) return;
    updateCaptchaFromPointer(event.clientX);
  }

  function endCaptchaDrag() {
    setCaptchaDragging(false);
  }

  async function passwordLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!normalizedAuthPhone || !authPassword) {
      setNotice("شماره و رمز عبور را وارد کن.");
      return;
    }
    setAuthBusy(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password-login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone_number: normalizedAuthPhone, password: authPassword })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const code = errorBody?.error?.code;
        throw new Error(code === "rate_limited" ? "rate_limited" : code === "service_unavailable" ? "service_unavailable" : code === "invalid_credentials" ? "invalid_credentials" : `HTTP ${response.status}`);
      }
      const body = (await response.json()) as { data: AuthSession };
      localStorage.setItem(SESSION_STORAGE_KEY, body.data.token);
      if (body.data.refresh_token) localStorage.setItem(REFRESH_SESSION_STORAGE_KEY, body.data.refresh_token);
      setAuthToken(body.data.token);
      setAuthPassword("");
      setNotice("با رمز وارد شدی. برای ثبت آگهی، پروفایل باید کامل باشد.");
      await refreshData(body.data.token);
    } catch (error) {
      if (error instanceof Error && error.message === "rate_limited") {
        setNotice("تلاش ورود با رمز زیاد شده است. کمی صبر کن و دوباره امتحان کن.");
        return;
      }
      if (error instanceof Error && error.message === "service_unavailable") {
        setNotice("سرویس ورود موقتاً در دسترس نیست؛ دوباره تلاش کن.");
        return;
      }
      if (error instanceof Error && error.message === "invalid_credentials") {
        setNotice("شماره موبایل یا رمز عبور درست نیست.");
        return;
      }
      setAuthMode("sms");
      setAuthStep("phone");
      resetCaptcha();
      setNotice("برای این شماره هنوز رمز تنظیم نشده یا رمز درست نیست. از ثبت‌نام/فراموشی رمز با پیامک استفاده کن.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setNotice("");
    try {
      if (!authToken) throw new Error("نشست ورود منقضی شده است. دوباره وارد شو.");
      const cityId = profileForm.primary_city_id || cities[0]?.id || "";
      if (!cityId || !cities.some((city) => city.id === cityId)) throw new Error("شهر معتبر انتخاب کن و دوباره تلاش کن.");
      const response = await fetch(`${API_BASE_URL}/api/v1/me/profile`, {
        method: "PUT",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          first_name: profileForm.first_name.trim(),
          last_name: profileForm.last_name.trim(),
          primary_city_id: cityId,
          ...(profileForm.password ? { password: profileForm.password } : {})
        })
      });
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      if (!response.ok) throw new Error(body?.error?.message || `ذخیره پروفایل انجام نشد (${response.status}).`);
      setProfileForm((current) => ({ ...current, password: "" }));
      setNotice("پروفایل و احراز هویت سبک کامل شد. حالا ثبت آگهی فعال است.");
      await refreshData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره پروفایل انجام نشد. اطلاعات را بررسی کن.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveBusinessProfile(event: React.FormEvent) {
    event.preventDefault();
    setBusinessSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/me/business-profile`, {
        method: "PUT",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(businessForm)
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
      setNotice("پروفایل کسب‌وکار ذخیره شد و در اعتماد حساب نمایش داده می‌شود.");
      await refreshData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره پروفایل کسب‌وکار انجام نشد.");
    } finally {
      setBusinessSaving(false);
    }
  }

  async function saveStorefront(event: React.FormEvent) {
    event.preventDefault();
    if (!authToken) {
      setNotice("برای ساخت غرفه، اول وارد حساب کاربری شو.");
      navigateWorkspace("profile");
      return;
    }
    setStorefrontSaving(true);
    try {
      const payload = {
        category_id: storefrontForm.category_id || categories[0]?.id,
        city_id: storefrontForm.city_id || cities[0]?.id,
        name: storefrontForm.name.trim(),
        slug: storefrontForm.slug.trim(),
        short_description: storefrontForm.short_description.trim(),
        description: storefrontForm.description.trim(),
        business_type: storefrontForm.business_type.trim(),
        address: storefrontForm.address.trim() || undefined,
        phone: storefrontForm.phone.trim() || undefined,
        secondary_phone: storefrontForm.secondary_phone.trim() || undefined,
        working_hours: { text: storefrontForm.working_hours.trim() }
      };
      const response = await fetch(`${API_BASE_URL}${myStorefront ? "/api/v1/me/storefront" : "/api/v1/storefronts"}`, {
        method: myStorefront ? "PATCH" : "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(payload)
      });
      const body = await response.json().catch(() => null) as { data?: Storefront; error?: { message?: string } } | null;
      if (!response.ok || !body?.data) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
      setMyStorefront(body.data);
      setForm((current) => ({ ...current, storefront_id: body.data!.id }));
      setNotice("غرفه ذخیره شد و برای بررسی ادمین ارسال شد.");
      await refreshData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره غرفه انجام نشد.");
    } finally {
      setStorefrontSaving(false);
    }
  }

  async function handleImageFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (!authToken) {
      setNotice("برای آپلود عکس آگهی، اول وارد حساب کاربری شو.");
      navigateWorkspace("profile");
      event.target.value = "";
      return;
    }
    const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const supportedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
    const imageFiles = files.filter((file) => supportedImageTypes.has(file.type)).slice(0, 6);
    const videoFiles = files.filter((file) => supportedVideoTypes.has(file.type)).slice(0, 1);
    const rejectedFiles = files.filter((file) => !supportedImageTypes.has(file.type) && !supportedVideoTypes.has(file.type));
    if (rejectedFiles.length) setNotice("فقط JPG، PNG، WEBP برای عکس و MP4، WEBM یا MOV برای ویدیو قابل آپلود است.");
    const selectedFiles = [...imageFiles, ...videoFiles];
    if (!selectedFiles.length) { setNotice("یک عکس یا ویدیوی معتبر انتخاب کن."); return; }
    setNotice("در حال آماده‌سازی و آپلود رسانه‌ها...");
    try {
      const uploaded: Array<{ id: string; url: string }> = [];
      for (const file of selectedFiles) {
        const dataUrl = file.type.startsWith("image/") ? await compressImageFile(file) : await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("خواندن ویدیو انجام نشد.")); reader.readAsDataURL(file); });
        if (file.type.startsWith("image/")) setImageMetadata(await readImageMetadata(dataUrl));
        const response = await fetch(`${API_BASE_URL}/api/v1/media/listing-images`, { method: "POST", headers: getAuthHeaders(authToken), body: JSON.stringify({ media_data_url: dataUrl }) });
        const body = await response.json().catch(() => null) as { data?: { url?: string; asset_id?: string }; error?: { message?: string } };
        if (!response.ok || !body.data?.url || !body.data.asset_id) throw new Error(body.error?.message ?? `HTTP ${response.status}`);
        uploaded.push({ id: body.data.asset_id, url: body.data.url });
      }
      const ids = [...mediaAssetIds, ...uploaded.map((asset) => asset.id)].slice(0, 7);
      const previews = [...mediaPreviews, ...uploaded.map((asset) => asset.url)].slice(0, 7);
      setMediaAssetIds(ids);
      setMediaPreviews(previews);
      // Uploaded files belong in the gallery below the picker. Keep the picker empty
      // so selecting another file always starts from the same neutral affordance.
      setForm((current) => ({ ...current, media_asset_ids: ids, image_data_url: "" }));
      setNotice(`${uploaded.length.toLocaleString("fa-IR")} رسانه جدید اضافه شد؛ مجموع ${ids.length.toLocaleString("fa-IR")} رسانه آماده است.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "آپلود رسانه انجام نشد.");
      event.target.value = "";
    }
  }

  async function startContact(item: Pick<MarketItem, "id" | "title"> & { status?: string }) {
    if (!authToken) {
      setNotice("برای شروع تماس امن، اول با شماره موبایل وارد شو.");
      navigateWorkspace("profile");
      return;
    }
    if (item.status !== "approved") {
      setNotice("این آگهی هنوز منتشر نشده و تا تایید ادمین، گفتگو برای آن باز نمی‌شود.");
      return;
    }
    setContactedItemIds((current) => (current.includes(item.id) ? current : [item.id, ...current]));
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contact-intents`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ content_id: item.id })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }
      const body = (await response.json()) as { data: { conversation?: Conversation } };
      if (body.data.conversation) {
        setConversations((current) => mergeConversations([body.data.conversation!], current));
        await openConversation(body.data.conversation.id);
      }
      setNotice(`چت برای «${item.title}» آماده شد. شماره عمومی نمی‌شود و گفتگو داخل 4D می‌ماند.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "شروع چت انجام نشد. دوباره تلاش کن.");
    }
  }

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setNotificationEvents((current) => current.filter((event) => event.conversation_id !== conversationId));
    setChatBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`, {
        headers: getAuthHeaders(authToken)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as ApiListResponse<ConversationMessage>;
      setConversationMessages(body.data);
      setConversations((current) =>
        current.map((conversation) => (conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation))
      );
    } catch {
      setConversationMessages([]);
      setNotice("پیام‌های چت دریافت نشد. وضعیت API/DB را بررسی کن.");
    } finally {
      setChatBusy(false);
    }
  }

  async function sendChatMessage(event: React.FormEvent) {
    event.preventDefault();
    const body = chatDraft.trim();
    if (!activeConversationId || !body) return;
    if (activeConversation?.is_blocked) {
      setNotice("این گفتگو مسدود شده و ارسال پیام جدید فعال نیست.");
      return;
    }
    setChatBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ body })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as { data: ConversationMessage };
      setConversationMessages((current) => [...current, result.data]);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                updated_at: result.data.created_at,
                unread_count: 0,
                last_message_body: result.data.body,
                last_message_at: result.data.created_at,
                last_message_sender_user_id: result.data.sender_user_id
              }
            : conversation
        )
      );
      setChatDraft("");
      await refreshData();
    } catch {
      setNotice("ارسال پیام انجام نشد. دوباره تلاش کن.");
    } finally {
      setChatBusy(false);
    }
  }

  async function reportMessage(message: ConversationMessage) {
    if (reportedMessageIds.includes(message.id)) return;
    setReportedMessageIds((current) => [message.id, ...current]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          target_type: "message",
          target_id: message.id,
          reason: "inappropriate",
          description: "گزارش پیام داخل چت توسط کاربر"
        })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }
      setNotice("گزارش پیام ثبت شد و برای بررسی ادمین وارد صف شد.");
      await refreshModerationCases();
    } catch (error) {
      setReportedMessageIds((current) => current.filter((id) => id !== message.id));
      setNotice(error instanceof Error ? error.message : "ثبت گزارش پیام انجام نشد. دوباره تلاش کن.");
    }
  }

  async function toggleConversationMute(conversation: Conversation) {
    const nextMuted = !conversation.is_muted;
    setConversations((current) =>
      current.map((item) => (item.id === conversation.id ? { ...item, is_muted: nextMuted } : item))
    );
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversation.id}/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ is_muted: nextMuted })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }
      setNotice(nextMuted ? "این گفتگو بی‌صدا شد و badge پیام جدید نمی‌سازد." : "اعلان‌های این گفتگو دوباره فعال شد.");
      await refreshData();
    } catch (error) {
      setConversations((current) =>
        current.map((item) => (item.id === conversation.id ? { ...item, is_muted: Boolean(conversation.is_muted) } : item))
      );
      setNotice(error instanceof Error ? error.message : "تنظیم mute گفتگو ذخیره نشد. دوباره تلاش کن.");
    }
  }

  async function toggleConversationBlock(conversation: Conversation) {
    const nextBlocked = !conversation.is_blocked_by_me;
    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id ? { ...item, is_blocked_by_me: nextBlocked, is_blocked: nextBlocked } : item
      )
    );
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversation.id}/block`, {
        method: "PUT",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({ is_blocked: nextBlocked })
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }
      setNotice(nextBlocked ? "این گفتگو مسدود شد و پیام جدیدی ارسال نمی‌شود." : "مسدودسازی این گفتگو برداشته شد.");
      await refreshData();
    } catch (error) {
      setConversations((current) =>
        current.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                is_blocked_by_me: Boolean(conversation.is_blocked_by_me),
                is_blocked: Boolean(conversation.is_blocked)
              }
            : item
        )
      );
      setNotice(error instanceof Error ? error.message : "تنظیم block گفتگو ذخیره نشد. دوباره تلاش کن.");
    }
  }

  async function reportItem(item: MarketItem) {
    if (!authToken) {
      setNotice("برای گزارش آگهی، اول وارد حساب کاربری شو.");
      navigateWorkspace("profile");
      return;
    }
    setReportedItemIds((current) => (current.includes(item.id) ? current : [item.id, ...current]));
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          target_type: "content",
          target_id: item.id,
          reason: "other",
          description: "گزارش از UI نسخه MVP"
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice(`ممنون؛ گزارش «${item.title}» ثبت شد.`);
    } catch {
      setNotice(
        `گزارش برای «${item.title}» فعلاً ثبت نشد؛ دوباره تلاش کن.`
      );
    }
  }

  async function toggleFavorite(item: { id: string }) {
    if (favoriteBusyId === item.id) return;
    if (!authToken) {
      setNotice("برای ذخیره آگهی، اول وارد حساب کاربری شو.");
      navigateWorkspace("profile");
      return;
    }
    const isFavorite = favoriteIds.includes(item.id);
    setFavoriteBusyId(item.id);
    setFavoriteIds((current) => isFavorite ? current.filter((id) => id !== item.id) : [item.id, ...current]);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contents/${item.id}/favorite`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: getAuthHeaders(authToken, { json: !isFavorite }),
        ...(isFavorite ? {} : { body: "{}" })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNotice(isFavorite ? "آگهی از ذخیره‌ها حذف شد." : "آگهی در ذخیره‌های تو قرار گرفت.");
    } catch {
      setFavoriteIds((current) => isFavorite ? [item.id, ...current] : current.filter((id) => id !== item.id));
      setNotice("ذخیره آگهی انجام نشد؛ اتصال API و دیتابیس را بررسی کن.");
    } finally {
      setFavoriteBusyId(null);
    }
  }

  async function reviewListingWithAi() {
    if (!authToken) { setNotice("برای استفاده از دستیار آگهی، اول وارد حساب شو."); navigateWorkspace("profile"); return; }
    setAiReviewBusy(true);
    setAiReview(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ai/listing-review`, { method: "POST", headers: getAuthHeaders(authToken), body: JSON.stringify({ title: form.title, description: form.description, price_amount: parseMoneyInput(form.price_amount), category_name: categories.find((category) => category.id === form.category_id)?.name_fa, image_metadata: imageMetadata }) });
      const body = (await response.json()) as { data: ListingAiReview; error?: { message?: string } };
      if (!response.ok) throw new Error(body?.error?.message ?? "AI review failed");
      setAiReview(body.data);
      setNotice(`امتیاز کیفیت آگهی: ${body.data.score}٪. ${body.data.suggestions.join(" ") || body.data.summary}`);
    } catch { setNotice("بررسی هوشمند فعلاً در دسترس نیست؛ آگهی را می‌توانی دستی ثبت کنی."); }
    finally { setAiReviewBusy(false); }
  }

  function applyAiTitle() {
    if (!aiReview?.improved_title) return;
    setForm((current) => ({ ...current, title: aiReview.improved_title }));
    setNotice("عنوان پیشنهادی هوش مصنوعی اعمال شد.");
  }

  function applyAiDescription() {
    if (!aiReview?.improved_description) return;
    setForm((current) => ({ ...current, description: aiReview.improved_description ?? current.description }));
    setNotice("توضیحات پیشنهادی هوش مصنوعی اعمال شد.");
  }

  async function submitListing(event: React.FormEvent) {
    event.preventDefault();
    if (!authToken) {
      setNotice("برای ثبت آگهی، اول با شماره موبایل وارد شو.");
      setPendingCreateListing(true);
      setComposeOpen(false);
      navigateWorkspace("profile");
      return;
    }
    if (!profileComplete) {
      setNotice("برای ثبت آگهی، اول پروفایل را با نام، نام خانوادگی، شهر و رمز عبور کامل کن.");
      navigateWorkspace("profile");
      return;
    }
    setSubmitting(true);
    setNotice("");

    try {
      const priceAmount = parseMoneyInput(form.price_amount);
      const payload = {
        content_type: form.content_type,
        title: form.title.trim(),
        description: form.description.trim(),
        city_id: form.city_id,
        category_id: form.category_id,
        ...(formFieldPolicy.showPrice && priceAmount != null ? { price_amount: priceAmount } : {}),
        ...(formFieldPolicy.showItemCondition ? { item_condition: form.item_condition } : {}),
        ...(Object.keys(form.metadata).length ? { metadata: form.metadata } : {}),
        ...(form.image_data_url ? { image_url: form.image_data_url } : {}),
        ...(mediaAssetIds.length ? { media_asset_ids: mediaAssetIds } : {}),
        ...(form.storefront_id ? { storefront_id: form.storefront_id } : {}),
        ...(form.content_type === "service_listing" ? {
          service_details: {
            service_area: form.service_area.trim(),
            pricing_model: form.pricing_model,
            availability: form.availability.trim(),
            ...(form.experience_years ? { experience_years: Number(form.experience_years) } : {})
          }
        } : {})
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/listings`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error?.message ?? `HTTP ${response.status}`);
      }

      const created = (await response.json()) as { data: MarketItem };
      setItems((current) => [created.data, ...current]);
      setMyItems((current) => [created.data, ...current]);
      setSelectedItemId(created.data.id);
      setNotice("آگهی ثبت شد و در صف بررسی قرار گرفت.");
      setComposeOpen(false);
      setMediaAssetIds([]);
      setMediaPreviews([]);
      setForm((current) => ({ ...initialForm, city_id: current.city_id, category_id: current.category_id, media_asset_ids: [] }));
    } catch (error) {
      if (import.meta.env.DEV) {
      const localItem: MarketItem = {
          id: crypto.randomUUID(),
          title: form.title.trim(),
          description: form.description.trim(),
          city_id: form.city_id,
          category_id: form.category_id,
          status: "local_preview",
          ...(formFieldPolicy.showPrice && parseMoneyInput(form.price_amount) != null ? { price_amount: parseMoneyInput(form.price_amount) as number } : {}),
          price_type: formFieldPolicy.showPrice && parseMoneyInput(form.price_amount) != null ? "fixed" : "negotiable",
          ...(formFieldPolicy.showItemCondition ? { item_condition: form.item_condition } : {}),
          image_data_url: form.image_data_url || null
        };
        setItems((current) => [localItem, ...current]);
        setMyItems((current) => [localItem, ...current]);
        setNotice("ثبت سرور در محیط توسعه انجام نشد؛ یک پیش‌نمایش محلی ساخته شد.");
      } else {
        setNotice(
          error instanceof Error
            ? `ثبت آگهی روی سرور انجام نشد. اطلاعات فرم حفظ شده است؛ دوباره تلاش کن. ${error.message}`
            : "ثبت آگهی روی سرور انجام نشد. اطلاعات فرم حفظ شده است؛ دوباره تلاش کن."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function updateMyListing(contentId: string, event: React.FormEvent) {
    event.preventDefault();
    if (!authToken) return;
    setSubmitting(true);
    try {
      const priceAmount = parseMoneyInput(form.price_amount);
      const response = await fetch(`${API_BASE_URL}/api/v1/me/contents/${contentId}`, {
        method: "PUT", headers: getAuthHeaders(authToken),
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), city_id: form.city_id, category_id: form.category_id, ...(formFieldPolicy.showPrice && priceAmount != null ? { price_amount: priceAmount } : {}), ...(formFieldPolicy.showItemCondition ? { item_condition: form.item_condition } : {}), media_asset_ids: mediaAssetIds, metadata: form.metadata, ...(form.image_data_url ? { image_url: form.image_data_url } : {}) })
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
      const updated = body.data as MarketItem;
      setItems((current) => current.map((item) => item.id === contentId ? { ...item, ...updated } : item));
      setMyItems((current) => current.map((item) => item.id === contentId ? { ...item, ...updated } : item));
      setComposeOpen(false); setEditingListingId(null); setNotice("آگهی ویرایش شد و دوباره برای بررسی ارسال شد.");
    } catch (error) { setNotice(error instanceof Error ? `ویرایش آگهی انجام نشد: ${error.message}` : "ویرایش آگهی انجام نشد."); }
    finally { setSubmitting(false); }
  }

  async function deleteMyListing(contentId: string) {
    if (!authToken || deletingListingIdsRef.current.has(contentId) || !window.confirm("این آگهی حذف شود؟")) return;
    deletingListingIdsRef.current.add(contentId);
    setDeletingListingId(contentId);
    const removeListingLocally = () => {
      setItems((current) => current.filter((item) => item.id !== contentId));
      setMyItems((current) => current.filter((item) => item.id !== contentId));
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/me/contents/${contentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(authToken, { json: false })
      });
      const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
      removeListingLocally();
      setNotice("آگهی حذف شد.");
    } catch (error) {
      // A proxy or stale service worker can lose the response after the server
      // has committed the deletion. Reconcile before showing a false failure.
      try {
        const verification = await fetch(`${API_BASE_URL}/api/v1/me/contents`, {
          headers: getAuthHeaders(authToken, { json: false }),
          cache: "no-store"
        });
        const verificationBody = await verification.json().catch(() => null) as ApiListResponse<MarketItem> | null;
        if (verification.ok && verificationBody && !verificationBody.data.some((item) => item.id === contentId)) {
          removeListingLocally();
          setNotice("آگهی حذف شد.");
          return;
        }
      } catch {
        // Preserve the original delete error when reconciliation is unavailable.
      }
      setNotice(error instanceof Error ? `حذف آگهی انجام نشد: ${error.message}` : "حذف آگهی انجام نشد.");
    }
    finally {
      deletingListingIdsRef.current.delete(contentId);
      setDeletingListingId(null);
    }
  }

  function editMyListing(item: MarketItem) {
    const createdAt = item.created_at ? Date.parse(item.created_at) : NaN;
    if (Number.isFinite(createdAt) && Date.now() - createdAt > 24 * 60 * 60 * 1000) {
      setNotice("مهلت ویرایش این آگهی (۲۴ ساعت) تمام شده است.");
      return;
    }
    const media = item.media ?? [];
    setMediaAssetIds(media.filter((asset) => asset.asset_id && !asset.asset_id.startsWith("legacy-")).map((asset) => asset.asset_id));
    setMediaPreviews(media.map((asset) => asset.url));
    setForm((current) => ({ ...current, title: item.title, description: item.description, city_id: item.city_id, category_id: item.category_id, price_amount: item.price_amount != null ? formatMoneyInput(String(item.price_amount)) : "", price_type: item.price_amount != null ? "fixed" : "negotiable", item_condition: item.item_condition === "new" || item.item_condition === "like_new" ? item.item_condition : "used", image_data_url: item.image_data_url ?? "" }));
    setEditingListingId(item.id); setComposeOpen(true);
  }

  async function submitTransport(event: React.FormEvent) {
    event.preventDefault();
    if (!authToken) {
      setTransportNotice("برای ثبت مسیر، اول با شماره موبایل وارد شو.");
      setTransportOpen(false);
      navigateWorkspace("profile");
      return;
    }
    if (!profileComplete) {
      setTransportNotice("برای ثبت مسیر، ابتدا پروفایل و رمز عبور را کامل کن.");
      setTransportOpen(false);
      navigateWorkspace("profile");
      return;
    }
    setTransportSubmitting(true);
    setTransportNotice("");
    try {
      const transportCategory = categories.find((category) => category.slug === "local-transport");
      const toInteger = (value: string) => value.trim() ? Number.parseInt(value.replace(/,/g, ""), 10) : null;
      const priceAmount = parseMoneyInput(transportForm.price_amount);
      const response = await fetch(`${API_BASE_URL}/api/v1/transport/trips`, {
        method: "POST",
        headers: getAuthHeaders(authToken),
        body: JSON.stringify({
          ...transportForm,
          category_id: transportCategory?.id ?? transportForm.category_id,
          origin_city_id: transportForm.city_id || null,
          destination_city_id: transportForm.city_id || null,
          time_to: transportForm.time_to || null,
          seats_available: toInteger(transportForm.seats_available),
          passenger_count: toInteger(transportForm.passenger_count),
          price_amount: transportForm.price_type === "fixed" ? priceAmount : null
        })
      });
      const body = await response.json().catch(() => null) as { data?: TransportResult; error?: { message?: string } } | null;
      if (!response.ok) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
      setTransportOpen(false);
      setTransportForm((current) => ({ ...initialTransportForm, city_id: current.city_id, category_id: current.category_id }));
      setTransportNotice("مسیر ثبت شد و پس از بررسی در بخش حمل‌ونقل نمایش داده می‌شود.");
      await refreshData();
    } catch (error) {
      setTransportNotice(error instanceof Error ? error.message : "ثبت مسیر انجام نشد؛ دوباره تلاش کن.");
    } finally {
      setTransportSubmitting(false);
    }
  }

  async function searchTransport() {
    const value = transportQuery.trim();
    const origin = cities.find((city) => city.id === transportOriginId)?.name_fa ?? "";
    const destination = cities.find((city) => city.id === transportDestinationId)?.name_fa ?? "";
    if (!value && !origin && !destination && transportModeFilter === "all") {
      setTransportResults([]);
      setTransportNotice("عنوان، مبدأ، مقصد یا نوع مسیر را برای جست‌وجو انتخاب کن.");
      return;
    }
    setTransportSearchBusy(true);
    setTransportNotice("");
    try {
      const params = new URLSearchParams({ limit: "6" });
      if (value) params.set("q", value);
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (transportModeFilter !== "all") params.set("mode", transportModeFilter);
      const response = await fetch(`${API_BASE_URL}/api/v1/transport/search?${params.toString()}`);
      const body = await response.json().catch(() => null) as { data?: TransportResult[] } | null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setTransportResults(body?.data ?? []);
      if (!body?.data?.length) setTransportNotice("مسیر هماهنگی با این جست‌وجو پیدا نشد.");
    } catch {
      setTransportNotice("جست‌وجوی حمل‌ونقل فعلاً در دسترس نیست؛ وضعیت API را بررسی کن.");
    } finally {
      setTransportSearchBusy(false);
    }
  }

  const profileWorkspaceProps = { authToken, authMode, authStep, authPhone, authPassword, authOtp, authBusy, captchaClassName, captchaSceneStyle, captchaSolved, captchaClose, currentUser, profileComplete, profileForm, profileSaving, cities, categories, myItems, deletingListingId, conversations, unreadConversationCount, notificationPermission, pushBusy, pushSubscriptionCount, pushTestBusy, sendPushTest, businessForm, businessSaving, myStorefront, storefrontForm, storefrontSaving, saveStorefront, setStorefrontForm, analyticsSummary, analyticsConsent, analyticsBusy, updateAnalyticsConsent, deleteAnalyticsEvents, mySupport, apiBaseUrl: API_BASE_URL, getAuthHeaders, onSupportCreated: () => void refreshData(), captchaBoardRef, setAuthMode, setAuthPhone, setAuthPassword, setAuthOtp, requestOtp, verifyOtp, passwordLogin, startCaptchaDrag, moveCaptchaDrag, endCaptchaDrag, resetCaptcha, saveProfile, setProfileForm, saveBusinessProfile, setBusinessForm, openItem, editMyListing, deleteMyListing, enableBrowserNotifications, syncPushSubscription, openConversation, navigateWorkspace, getStatusLabel, formatPrice, getConversationPreview, formatCompactDate };
  const chatWorkspaceProps = { activeConversation, conversationMessages, chatBusy, currentUser, reportedMessageIds, reportMessage, toggleConversationMute, toggleConversationBlock, sendChatMessage, chatDraft, setChatDraft, setActiveConversationId, openConversation };

  if (listingSlug) {
    return <>
      <a className="skip-link" href="#listing-page-main">رفتن به محتوای اصلی</a>
      <main id="listing-page-main" className="app-shell listing-route-shell" tabIndex={-1}>
        <header className="topbar listing-route-topbar">
          <a className="listing-route-brand" href={sitePath("/")} aria-label="بازار محلی 4D">
            <img className="listing-route-logo" src={sitePath("/brand/4d-logo-horizontal.png")} alt="4D" />
            <span><strong>بازار محلی 4D</strong><small>جزئیات آگهی</small></span>
          </a>
          <nav className="listing-route-context" aria-label="مسیر صفحه">
            <a href={sitePath("/")}>بازار</a><span aria-hidden="true">/</span><strong>جزئیات آگهی</strong>
          </nav>
          <a className="listing-route-back" href={sitePath("/")} aria-label="بازگشت به بازار"><ArrowLeft size={16} /> بازار</a>
        </header>
        <React.Suspense fallback={<section className="listing-page-state"><Sparkles size={28} /><h1>در حال آماده‌سازی صفحه</h1></section>}>
          <ListingDetailPage id={listingSlug} apiBaseUrl={API_BASE_URL} cities={cities} categories={categories} mediaUrl={mediaUrl} formatPrice={formatPrice} authToken={authToken} isFavorite={favoriteIds.includes(listingSlug)} onToggleFavorite={() => void toggleFavorite({ id: listingSlug })} onStartContact={(listing) => void startContact(listing)} />
        </React.Suspense>
      </main>
    </>;
  }

  return (
    <>
    <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
    <main id="main-content" className="app-shell" tabIndex={-1}>
      <header className="topbar">
        <div className="brand-block">
          <a className="brand-logo" href={sitePath("/")} aria-label="بازار محلی 4D">
            <img src={sitePath("/brand/4d-logo-horizontal.png")} alt="4D چهار ده" />
          </a>
          <div>
            <strong>بازار محلی 4D</strong>
            <span>گرمه، جاجرم، ایور و درق</span>
          </div>
        </div>
        <div className="top-actions">
          <nav className="workspace-tabs" aria-label="بخش‌های محصول">
            <button
              type="button"
              className={activeWorkspace === "market" ? "workspace-tab active" : "workspace-tab"}
              aria-current={activeWorkspace === "market" ? "page" : undefined}
              onClick={() => navigateWorkspace("market")}
            >
              <Store size={17} />
              بازار
            </button>
            <button
              type="button"
              className={activeWorkspace === "profile" ? "workspace-tab active" : "workspace-tab"}
              aria-current={activeWorkspace === "profile" ? "page" : undefined}
              onClick={() => navigateWorkspace("profile")}
            >
              <UserRound size={17} />
              {unreadConversationCount ? <span className="tab-badge">{unreadConversationCount.toLocaleString("fa-IR")}</span> : null}
              حساب من
            </button>
            {isModerator ? (
            <button
              type="button"
              className={activeWorkspace === "admin" ? "workspace-tab active" : "workspace-tab"}
              aria-current={activeWorkspace === "admin" ? "page" : undefined}
              onClick={() => navigateWorkspace("admin")}
            >
              <ClipboardList size={17} />
              ادمین
            </button>
            ) : null}
            <button type="button" className="workspace-tab mobile-create-tab" onClick={openListingComposer}>
              <Plus size={17} />
              ثبت آگهی
            </button>
          </nav>
          <button type="button" className="icon-button" onClick={() => void refreshData()} disabled={refreshing} aria-label="تازه‌سازی">
            <RefreshCw size={18} />
          </button>
          {authToken ? (
            <button type="button" className="ghost-button top-logout" onClick={() => void logout()}>
              خروج
            </button>
          ) : null}
          {activeWorkspace === "market" ? (
            <button type="button" className="primary-link" onClick={openListingComposer}>
              <Plus size={18} />
              ثبت آگهی
            </button>
          ) : (
            <button type="button" className="primary-link" onClick={() => navigateWorkspace("market")}>
              <Store size={18} />
              بازار
            </button>
          )}
        </div>
      </header>

      {storefrontSlug ? (
        <React.Suspense fallback={<section className="storefront-public empty-state"><Store size={28} /><h1>در حال بارگیری غرفه</h1></section>}>
          <StorefrontPublicPage data={publicStorefront} cities={cities} categories={categories} mediaUrl={mediaUrl} formatPrice={formatPrice} />
        </React.Suspense>
      ) : null}

      {activeWorkspace === "market" && !storefrontSlug ? (
        <section className="command-band public-command" aria-label="جستجو">
          <div className="search-box">
            <Search size={20} />
            <input
              aria-label="جستجو در آگهی‌ها"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجو در آگهی‌ها، خدمات و درخواست‌ها"
            />
          </div>
        </section>
      ) : null}

      {activeWorkspace === "admin" && isModerator ? (
        <section className="command-band admin-command" aria-label="وضعیت فنی ادمین">
          <div className="admin-route-card">
            <ShieldCheck size={20} />
            <div>
              <strong>Moderation Console</strong>
              <span>
                {isModerator
                  ? `${pendingContents.length.toLocaleString("fa-IR")} آگهی pending، ${moderationCases.length.toLocaleString("fa-IR")} گزارش باز`
                  : "دسترسی ادمین نیازمند نقش moderator است"}
              </span>
            </div>
          </div>
          <div className="health-pills">
            <span className={ready?.status === "ok" ? "health-pill ok" : "health-pill warn"}>
              <Wifi size={16} />
              API {ready?.status === "ok" ? "آماده" : "نیمه‌آماده"}
            </span>
            <span className={databaseReady ? "health-pill ok" : "health-pill warn"}>
              <Database size={16} />
              DB {databaseReady ? "وصل" : "وصل نیست"}
            </span>
            <span
              className={smsReady ? "health-pill ok" : "health-pill warn"}
              title={ready?.checks?.sms_vendor ? `ارائه‌دهنده: ${ready.checks.sms_vendor} | مسیر: ${ready.checks.sms_transport ?? "نامشخص"}` : undefined}
            >
              <MessageCircle size={16} />
              کاوه‌نگار {smsReady
                ? ready?.checks?.sms_transport === "fixed_ip" ? "آماده با IP ثابت" : "تنظیم شده"
                : ready?.checks?.sms === "disabled" ? "غیرفعال" : "تنظیم ناقص"}
            </span>
            <span className={authToken ? "health-pill ok" : "health-pill warn"}>
              <ShieldCheck size={16} />
              Auth {isModerator ? "moderator" : authToken ? "نشست واقعی" : "stub"}
            </span>
          </div>
        </section>
      ) : null}

      {notice ? (
        <section className="notice" role="status" aria-live="polite">
          <AlertCircle size={18} />
          <span>{notice}</span>
          <button type="button" className="notice-close" onClick={() => setNotice("")} aria-label="بستن پیام">
            <X size={16} />
          </button>
        </section>
      ) : null}

      {(activeWorkspace === "market" || composeOpen) && !storefrontSlug ? (
        <section className="market-hero" aria-label="خلاصه بازار">
          <div className="hero-art" aria-hidden="true" />
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} />
              همین نزدیکی، داخل 4D
            </span>
            <h1>چیزهایی که لازم داری، همین نزدیکی پیدا می‌شوند</h1>
            <p>خرید، فروش و خدمات محلی با آگهی‌های واضح، گفت‌وگوی امن و انتخاب‌های نزدیک به زندگی روزمره.</p>
            <div className="hero-actions">
              <button type="button" className="hero-primary" onClick={openListingComposer}><Plus size={17} /> ثبت آگهی</button>
              <button type="button" className="hero-secondary" onClick={() => document.getElementById("market")?.scrollIntoView({ behavior: "smooth", block: "start" })}>آگهی‌های نزدیک <ArrowLeft size={16} /></button>
            </div>
          </div>
          <div className="hero-stats" aria-label="آمار کوتاه">
            <div>
              <strong>{approvedCount.toLocaleString("fa-IR")}</strong>
              <span>آگهی منتشرشده</span>
            </div>
            <div>
              <strong>{cities.length.toLocaleString("fa-IR")}</strong>
              <span>شهر فعال</span>
            </div>
            <div>
              <strong>{categories.length.toLocaleString("fa-IR")}</strong>
              <span>دسته کاربردی</span>
            </div>
          </div>
        </section>
      ) : null}

      {(activeWorkspace === "market" || composeOpen) && !storefrontSlug ? (
        <section id="market" className={activeWorkspace === "market" ? "market-grid" : "market-grid compose-only"}>
        <aside className={filtersOpen ? "rail rail-open" : "rail"} aria-label="فیلتر بازار">
          <div className="panel tight">
            <div className="panel-title">
              <SlidersHorizontal size={18} />
              <h2>فیلترها</h2>
            </div>
            <label>
              شهر
              <SearchableSelect value={selectedCityId} onChange={setSelectedCityId} allLabel="کل 4D" placeholder="جست‌وجوی شهر" options={cities.map((city) => ({ id: city.id, label: city.name_fa }))} />
            </label>
            <label>
              دسته
              <SearchableSelect value={selectedCategoryId} onChange={(value) => { setSelectedCategoryId(value); setMetadataFilters({}); }} allLabel="همه دسته‌ها" placeholder="جست‌وجوی دسته" options={categories.map((category) => ({ id: category.id, label: category.name_fa }))} />
            </label>
            {filterMetadataFields.length ? <div className="dynamic-filter-fields">
                <span className="field-help">فیلترهای اختصاصی {selectedFilterCategory?.name_fa}</span>
                {filterMetadataFields.map((field) => <label key={field.key}>{field.label_fa}
                  {field.type === "select" ? <select value={metadataFilters[field.key] ?? ""} onChange={(event) => setMetadataFilters((current) => ({ ...current, [field.key]: event.target.value }))}><option value="">همه</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label_fa}</option>)}</select>
                    : <input type={field.type === "number" ? "number" : "text"} value={metadataFilters[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setMetadataFilters((current) => ({ ...current, [field.key]: event.target.value }))} />}
                </label>)}
              </div> : null}
            <div className="filter-price-grid">
              <label>
                حداقل قیمت
                <input inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="مثلاً ۱۰۰۰۰۰۰" />
              </label>
              <label>
                حداکثر قیمت
                <input inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="مثلاً ۱۰۰۰۰۰۰۰" />
              </label>
            </div>
            <label>
              مرتب‌سازی
              <select value={marketSort} onChange={(event) => setMarketSort(event.target.value as MarketSort)}>
                <option value="newest">جدیدترین</option>
                <option value="price_low">ارزان‌ترین</option>
                <option value="price_high">گران‌ترین</option>
              </select>
            </label>
            <button
              type="button"
              className="filter-reset"
              onClick={() => {
                setSelectedCityId("all");
                setSelectedCategoryId("all");
                setMinPrice("");
                setMaxPrice("");
                setMarketSort("newest");
                setQuery("");
              }}
            >
              <X size={15} />
              پاک‌کردن فیلترها
            </button>
          </div>

        </aside>

        <section className="feed-area" aria-label="فید محلی">
          <div className="feed-header">
            <div>
              <span className="eyebrow">
                <MapPin size={16} />
                {selectedCity ? selectedCity.name_fa : "کل 4D"}
              </span>
              <h1>بازار امروز</h1>
            </div>
            <div className="feed-tools">
              <button
                type="button"
                className={filtersOpen ? "mobile-filter-button active" : "mobile-filter-button"}
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((current) => !current)}
              >
                <SlidersHorizontal size={17} />
                فیلتر
              </button>
              <span className="count-badge">{filteredItems.length.toLocaleString("fa-IR")} مورد</span>
            </div>
          </div>

          <div className="category-strip" aria-label="دسته‌ها">
            <button
              type="button"
              className={selectedCategoryId === "all" ? "chip active" : "chip"}
              onClick={() => setSelectedCategoryId("all")}
            >
              همه
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={selectedCategoryId === category.id ? "chip active" : "chip"}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name_fa}
              </button>
            ))}
          </div>

          {transportResults.length ? <section className="market-search-results" aria-live="polite" aria-label="نتیجه جست‌وجوی حمل‌ونقل">
            <div className="transport-results-heading">
              <div><span className="eyebrow"><MapPin size={15} /> نتیجه جست‌وجوی مسیر</span><h2>{transportResults.length.toLocaleString("fa-IR")} مسیر پیدا شد</h2></div>
              <button type="button" className="ghost-button compact-action" onClick={() => setTransportResults([])}>پاک‌کردن</button>
            </div>
            <div className="transport-results transport-results-feed">
              {transportResults.map((route) => <a className="transport-result" href={sitePath(`/listing/${route.id}`)} key={route.id}>
                <div><strong>{route.title}</strong><span>{route.origin_label} ← {route.destination_label}</span></div>
                <small>{route.departure_date} · {route.time_from}{route.time_to ? ` تا ${route.time_to}` : ""}</small>
                <b>{route.price_type === "fixed" ? formatPrice(route.price_amount, route.price_type) : "توافقی"}</b>
              </a>)}
            </div>
          </section> : null}

          {firstLoad ? (
            <div className="skeleton-grid" aria-label="در حال بارگیری آگهی‌ها">
              {[0, 1, 2].map((item) => (
                <div className="listing-card skeleton-card" key={item}>
                  <div className="skeleton-media" />
                  <div className="skeleton-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length ? (
            <div className="listing-grid">
              {filteredItems.map((item, index) => (
                <article
                  className="listing-card listing-card-clickable"
                  key={item.id}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                  role="link"
                  tabIndex={0}
                  onClick={(event) => { if ((event.target as HTMLElement).closest("button, a")) return; window.location.href = sitePath(`/listing/${item.id}`); }}
                  onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !(event.target as HTMLElement).closest("button, a")) { event.preventDefault(); window.location.href = sitePath(`/listing/${item.id}`); } }}
                >
                  <div className="media-tile">
                    {getItemMedia(item)[0] ? <a className="listing-card-media-link" href={sitePath(`/listing/${item.id}`)} aria-label={`صفحه جزئیات ${item.title}`} onClick={(event) => event.stopPropagation()}><img src={mediaUrl(getItemMedia(item)[0])} alt={item.title} loading="lazy" decoding="async" /></a> : <Sparkles size={24} />}
                    {getItemMedia(item).length > 1 ? <span className="media-count-badge">{getItemMedia(item).length.toLocaleString("fa-IR")} عکس</span> : null}
                  </div>
                  <div className="card-body">
                    <div className="card-title-row">
                      <a className="listing-card-title-link" href={sitePath(`/listing/${item.id}`)} onClick={(event) => event.stopPropagation()}>{item.title}</a>
                      <button
                        type="button"
                        className={favoriteIds.includes(item.id) ? "mini-icon favorite-active" : "mini-icon"}
                        disabled={favoriteBusyId === item.id}
                        onClick={(event) => { event.stopPropagation(); void toggleFavorite(item); }}
                        aria-label={favoriteIds.includes(item.id) ? "حذف از ذخیره‌شده‌ها" : "ذخیره آگهی"}
                        aria-pressed={favoriteIds.includes(item.id)}
                      >
                        <Heart size={17} fill={favoriteIds.includes(item.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p>{item.description}</p>
                    <IdentityBadge verified={item.seller_trust?.identity_verified} compact />
                    <div className="meta-row">
                      <span>{cities.find((city) => city.id === item.city_id)?.name_fa ?? "4D"}</span>
                      <span>{categories.find((category) => category.id === item.category_id)?.name_fa ?? "دسته"}</span>
                      {item.storefront_slug ? <a className="storefront-link-chip" href={sitePath(`/storefront/${item.storefront_slug}`)} onClick={(event) => event.stopPropagation()}><Store size={13} /> غرفه {item.storefront_name ?? "فروشنده"}</a> : null}
                    </div>
                    <div className="card-footer">
                      <b>{formatPrice(item.price_amount, item.price_type)}</b>
                      <span className={`status ${item.status}`}>{getStatusLabel(item.status)}</span>
                    </div>
                    <div className="card-actions">
                      <button type="button" className="ghost-button" onClick={(event) => { event.stopPropagation(); openItem(item); }}>
                        جزئیات
                      </button>
                      <button type="button" className="contact-button" onClick={(event) => { event.stopPropagation(); void startContact(item); }}>
                        <MessageCircle size={16} />
                        تماس
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={28} />
              <h2>نتیجه‌ای پیدا نشد</h2>
              <p>فیلترها را کمتر کن، عبارت جستجو را کوتاه‌تر بنویس، یا یک آگهی تازه ثبت کن.</p>
            </div>
          )}
        </section>

        <aside className="compose-column" id="create">
          <div className="compose-launcher market-launcher panel">
            <div>
              <span className="eyebrow"><Plus size={16} /> شروع انتشار</span>
              <h2>آگهی یا خدمتت را معرفی کن</h2>
              <p>فرم کوتاه و مرحله‌ای را فقط وقتی لازم داری باز کن.</p>
            </div>
            <div className="compose-launcher-actions">
              <button type="button" className="compose-launch-button primary" onClick={() => { setForm((current) => ({ ...current, content_type: "listing", category_id: categories[0]?.id ?? current.category_id })); setComposeOpen(true); }}><Store size={17} /> ثبت آگهی</button>
              <button type="button" className="compose-launch-button secondary" onClick={() => { setForm((current) => ({ ...current, content_type: "service_listing", category_id: serviceCategories[0]?.id ?? current.category_id })); setComposeOpen(true); }}><Store size={17} /> ثبت خدمت</button>
            </div>
          </div>
          <section className="transport-launcher market-launcher panel" aria-labelledby="transport-launcher-title">
            <div className="transport-launcher-heading">
              <span className="eyebrow"><MapPin size={16} /> حمل‌ونقل محلی</span>
              <h2 id="transport-launcher-title">مسیرت را پیدا کن یا پیشنهاد بده</h2>
              <p>برای سفرهای گرمه، جاجرم، ایور و درق، مبدأ و مقصد را ساده و سریع هماهنگ کن.</p>
            </div>
            <div className="transport-actions">
              <button type="button" className="compose-launch-button primary" onClick={() => { setTransportNotice(""); setTransportOpen(true); }}><Plus size={17} /> ثبت مسیر</button>
              <button type="button" className="compose-launch-button secondary" onClick={() => { setTransportNotice(""); setTransportSearchOpen(true); window.setTimeout(() => document.getElementById("transport-search")?.focus(), 0); }}><Search size={17} /> جست‌وجوی مسیر</button>
            </div>
            <details className="transport-search-panel" open={transportSearchOpen} onToggle={(event) => setTransportSearchOpen(event.currentTarget.open)}>
              <summary><Search size={16} /> جست‌وجوی پیشرفته مسیر <small>مبدأ، مقصد یا نوع مسیر</small></summary>
              <div className="transport-search-body">
                <div className="transport-search-row">
                  <input id="transport-search" value={transportQuery} onChange={(event) => setTransportQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void searchTransport(); }} placeholder="مثلاً سرویس صبحگاهی یا ایور به جاجرم" aria-label="جست‌وجوی مسیر حمل‌ونقل" />
                  <button type="button" className="ghost-button" onClick={() => void searchTransport()} disabled={transportSearchBusy}><Search size={16} /> {transportSearchBusy ? "در حال جست‌وجو" : "جست‌وجو"}</button>
                </div>
                <div className="transport-filter-row" aria-label="فیلترهای مسیر">
                  <SearchableSelect value={transportOriginId} onChange={setTransportOriginId} placeholder="جست‌وجوی مبدأ" allLabel="همه مبدأها" options={cities.map((city) => ({ id: city.id, label: city.name_fa }))} />
                  <SearchableSelect value={transportDestinationId} onChange={setTransportDestinationId} placeholder="جست‌وجوی مقصد" allLabel="همه مقصدها" options={cities.map((city) => ({ id: city.id, label: city.name_fa }))} />
                  <select value={transportModeFilter} onChange={(event) => setTransportModeFilter(event.target.value as typeof transportModeFilter)} aria-label="نوع مسیر">
                    <option value="all">همه مسیرها</option>
                    <option value="offer">ارائه مسیر</option>
                    <option value="request">درخواست مسیر</option>
                  </select>
                </div>
              </div>
            </details>
            {transportNotice ? <p className="transport-notice" role="status">{transportNotice}</p> : null}
          </section>
          {transportOpen ? <div className="compose-scrim" onClick={() => setTransportOpen(false)}>
            <form className="compose-modal transport-modal" role="dialog" aria-modal="true" aria-labelledby="transport-title" onClick={(event) => event.stopPropagation()} onSubmit={(event) => void submitTransport(event)}>
              <div className="compose-modal-head">
                <div><span className="eyebrow"><MapPin size={16} /> حمل‌ونقل محلی</span><h2 id="transport-title">ثبت مسیر جدید</h2><p>اطلاعات مسیر را وارد کن تا پس از بررسی برای کاربران منطقه نمایش داده شود.</p></div>
                <button type="button" className="icon-button" aria-label="بستن فرم حمل‌ونقل" title="بستن" onClick={() => setTransportOpen(false)}><X size={18} /></button>
              </div>
              <div className="transport-form-grid">
                <div className="transport-mode-switch" role="group" aria-label="نوع مسیر">
                  <button type="button" className={transportForm.mode === "offer" ? "active" : ""} onClick={() => setTransportForm({ ...transportForm, mode: "offer" })}>ارائه مسیر</button>
                  <button type="button" className={transportForm.mode === "request" ? "active" : ""} onClick={() => setTransportForm({ ...transportForm, mode: "request" })}>درخواست جابه‌جایی</button>
                </div>
                <label>عنوان مسیر<input required value={transportForm.title} onChange={(event) => setTransportForm({ ...transportForm, title: event.target.value })} placeholder="مثلاً سرویس ایور به جاجرم" /></label>
                <label>توضیح کوتاه<textarea required value={transportForm.description} onChange={(event) => setTransportForm({ ...transportForm, description: event.target.value })} placeholder="زمان حرکت، شرایط سوار شدن یا توضیح موردنیاز" /></label>
                <div className="form-row"><label>شهر اصلی<SearchableSelect value={transportForm.city_id} onChange={(value) => setTransportForm({ ...transportForm, city_id: value })} placeholder="انتخاب شهر" options={cities.filter((city) => !city.is_village).map((city) => ({ id: city.id, label: city.name_fa }))} /></label><label>نوع وسیله<input value={transportForm.vehicle_type} onChange={(event) => setTransportForm({ ...transportForm, vehicle_type: event.target.value })} placeholder="سواری، وانت، مینی‌بوس..." /></label></div>
                <div className="form-row"><label>مبدأ<input required list="transport-places" value={transportForm.origin_label} onChange={(event) => setTransportForm({ ...transportForm, origin_label: event.target.value })} placeholder="شهر یا روستا" /></label><label>مقصد<input required list="transport-places" value={transportForm.destination_label} onChange={(event) => setTransportForm({ ...transportForm, destination_label: event.target.value })} placeholder="شهر یا روستا" /></label></div>
                <datalist id="transport-places">{cities.map((city) => <option key={city.id} value={city.name_fa} />)}</datalist>
                <div className="form-row"><label>تاریخ حرکت<input required type="date" min={new Date().toISOString().slice(0, 10)} value={transportForm.departure_date} onChange={(event) => setTransportForm({ ...transportForm, departure_date: event.target.value })} /></label><label>ساعت حرکت<input required type="time" value={transportForm.time_from} onChange={(event) => setTransportForm({ ...transportForm, time_from: event.target.value })} /></label></div>
                <div className="form-row"><label>تا ساعت (اختیاری)<input type="time" value={transportForm.time_to} onChange={(event) => setTransportForm({ ...transportForm, time_to: event.target.value })} /></label><label>{transportForm.mode === "offer" ? "ظرفیت خالی" : "تعداد مسافر"}<input type="number" min="1" max="50" value={transportForm.mode === "offer" ? transportForm.seats_available : transportForm.passenger_count} onChange={(event) => setTransportForm({ ...transportForm, [transportForm.mode === "offer" ? "seats_available" : "passenger_count"]: event.target.value })} placeholder="مثلاً ۳" /></label></div>
                <div className="form-row"><label>نوع مبلغ<select value={transportForm.price_type} onChange={(event) => setTransportForm({ ...transportForm, price_type: event.target.value as TransportForm["price_type"] })}><option value="negotiable">توافقی</option><option value="fixed">مبلغ ثابت</option></select></label><label>مبلغ<input inputMode="numeric" disabled={transportForm.price_type !== "fixed"} value={transportForm.price_amount} onChange={(event) => setTransportForm({ ...transportForm, price_amount: formatMoneyInput(event.target.value) })} placeholder="مثلاً ۱۵۰,۰۰۰ تومان" /></label></div>
              </div>
              <div className="form-submit-row"><span className="form-submit-hint">مسیر بعد از بررسی کوتاه منتشر می‌شود.</span><button type="submit" className="submit-button" disabled={transportSubmitting}><Send size={18} /> {transportSubmitting ? "در حال ثبت" : "ثبت و ارسال مسیر"}</button></div>
            </form>
          </div> : null}
          {composeOpen ? (
            <div className="compose-scrim" onClick={() => setComposeOpen(false)}>
              <div className="compose-modal" role="dialog" aria-modal="true" aria-labelledby="compose-title" onClick={(event) => event.stopPropagation()}>
                <div className="compose-modal-head">
                  <div><span className="eyebrow"><Plus size={16} /> انتشار در بازار 4D</span><h2 id="compose-title">{form.content_type === "service_listing" ? "ثبت خدمت" : "ثبت آگهی"}</h2><p>اطلاعات را کامل کن؛ قبل از انتشار در صف بررسی قرار می‌گیرد.</p></div>
                  <button type="button" className="icon-button" aria-label="بستن فرم" title="بستن" onClick={() => setComposeOpen(false)}><X size={18} /></button>
                </div>
          <form className="panel create-form" onSubmit={(event) => void (editingListingId ? updateMyListing(editingListingId, event) : submitListing(event))}>
            <div className="panel-title">
              <Plus size={18} />
              <div>
                <h2>ثبت آگهی</h2>
                <span className="form-hint">بعد از ارسال، آگهی وارد صف بررسی می‌شود.</span>
              </div>
            </div>
            <label>
              دسته آگهی
              <SearchableSelect value={form.category_id} onChange={(value) => { const category = formCategories.find((item) => item.id === value); const allowed = new Set((category?.metadata_schema ?? []).map((field) => field.key)); setForm({ ...form, category_id: value, metadata: Object.fromEntries(Object.entries(form.metadata).filter(([key]) => allowed.has(key))) }); }} placeholder="انتخاب دسته" options={(form.content_type === "service_listing" ? serviceCategories : formCategories).map((category) => ({ id: category.id, label: category.name_fa }))} />
              <span className="field-help">ابتدا دسته را انتخاب کن تا فیلدهای اختصاصی همان دسته نمایش داده شود.</span>
            </label>
            <label>
              عنوان
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="مثلاً گوشی سامسونگ A52"
              />
            </label>
            <label>
              توضیح
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="وضعیت، محل تحویل و توضیح کوتاه"
              />
            </label>
            <label className="image-picker">
              عکس آگهی
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" multiple onChange={handleImageFile} />
              <span className="image-stage">
                <ImagePlus size={24} />
                <small>برای افزودن چند عکس، هم‌زمان چند فایل انتخاب کن یا دوباره همین کادر را بزن</small>
              </span>
              {mediaPreviews.length ? <span className="media-preview-strip">{mediaPreviews.map((preview, index) => preview.includes("listing-videos") ? <video key={preview} src={mediaUrl(preview)} muted controls aria-label={`پیش‌نمایش ویدیو ${index + 1}`} /> : <img key={preview} src={mediaUrl(preview)} alt={`پیش‌نمایش رسانه ${index + 1}`} />)}</span> : null}
              <small className="media-selection-hint">{mediaPreviews.length ? `${mediaPreviews.length.toLocaleString("fa-IR")} رسانه آماده است` : "هنوز رسانه‌ای انتخاب نشده"} · حداکثر ۶ عکس و ۱ ویدیو</small>
            </label>
            <label>
              شهر
              <SearchableSelect value={form.city_id} onChange={(value) => setForm({ ...form, city_id: value })} placeholder="انتخاب شهر" options={cities.map((city) => ({ id: city.id, label: city.name_fa }))} />
            </label>
            {formMetadataFields.length ? <section className="dynamic-metadata-fields" aria-labelledby="metadata-title">
              <div className="service-fields-heading"><SlidersHorizontal size={17} /><strong id="metadata-title">ویژگی‌های اختصاصی {selectedFormCategory?.name_fa}</strong><span>این اطلاعات برای جست‌وجو و نمایش دقیق‌تر آگهی استفاده می‌شود.</span></div>
              <div className="form-row">{formMetadataFields.map((field) => <label key={field.key}>{field.label_fa}{field.required ? " *" : ""}
                {field.type === "select" ? <select required={field.required} value={form.metadata[field.key] ?? ""} onChange={(event) => setForm({ ...form, metadata: { ...form.metadata, [field.key]: event.target.value } })}><option value="">انتخاب کنید</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label_fa}</option>)}</select>
                  : <input required={field.required} type={field.type === "number" ? "number" : "text"} inputMode={field.type === "number" ? "numeric" : undefined} value={form.metadata[field.key] ?? ""} placeholder={field.placeholder} onChange={(event) => setForm({ ...form, metadata: { ...form.metadata, [field.key]: event.target.value } })} />}
              </label>)}</div>
            </section> : null}
            {myStorefront ? (
              <label className="storefront-link-field">
                انتشار در غرفه
                <select value={form.storefront_id} onChange={(event) => setForm({ ...form, storefront_id: event.target.value })}>
                  <option value="">فقط در بازار عمومی</option>
                  <option value={myStorefront.id}>{myStorefront.name} · {myStorefront.status === "active" ? "فعال" : "در انتظار بررسی"}</option>
                </select>
                <span className="field-help">آگهی پس از تایید، در صفحه غرفه هم نمایش داده می‌شود.</span>
              </label>
            ) : null}
            {form.content_type === "service_listing" ? (
              <div className="service-fields service-form-only">
                <div className="service-fields-heading"><Store size={17} /><strong>اطلاعات خدمت</strong><span>مشتری باید بداند چه خدمتی، در چه محدوده‌ای و با چه مدلی ارائه می‌کنی.</span></div>
                <div className="form-row">
                  <label>محدوده ارائه خدمت<input required value={form.service_area} onChange={(event) => setForm({ ...form, service_area: event.target.value })} placeholder="مثلاً گرمه، جاجرم و روستاهای اطراف" /></label>
                  <label>زمان ارائه<input required value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })} placeholder="مثلاً هر روز ۹ تا ۱۸" /></label>
                </div>
                <div className="form-row">
                  <label>مدل قیمت‌گذاری<select value={form.pricing_model} onChange={(event) => setForm({ ...form, pricing_model: event.target.value as ListingForm["pricing_model"] })}><option value="quote">توافقی</option><option value="fixed">مبلغ ثابت</option><option value="starting_at">شروع از</option><option value="hourly">ساعتی</option><option value="daily">روزانه</option></select></label>
                  <label>سابقه فعالیت (اختیاری)<input inputMode="numeric" value={form.experience_years} onChange={(event) => setForm({ ...form, experience_years: event.target.value })} placeholder="مثلاً ۵ سال" /></label>
                </div>
                  {formFieldPolicy.showPrice ? <label>مبلغ خدمت، در صورت وجود<input inputMode="numeric" value={form.price_amount} onChange={(event) => setForm({ ...form, price_amount: formatMoneyInput(event.target.value) })} placeholder={form.pricing_model === "quote" ? "بدون مبلغ یعنی توافقی" : "مثلاً ۱,۵۰۰,۰۰۰ تومان"} /><span className="field-help">اگر مبلغ را وارد کنی ثابت است؛ در غیر این صورت توافقی ثبت می‌شود.</span></label> : null}
              </div>
            ) : (
              <div className="form-row">
              {formFieldPolicy.showPrice ? <label>
                قیمت (اختیاری)
                <input
                  inputMode="numeric"
                  value={form.price_amount}
                  onChange={(event) => setForm({ ...form, price_amount: formatMoneyInput(event.target.value) })}
                  placeholder="بدون مبلغ یعنی توافقی"
                />
                <span className="field-help">مبلغ به تومان؛ جداکننده خودکار اضافه می‌شود. خالی بگذاری، توافقی است.</span>
              </label> : null}
              {formFieldPolicy.showItemCondition ? <label>
                وضعیت
                <select
                  value={form.item_condition}
                  onChange={(event) =>
                    setForm({ ...form, item_condition: event.target.value as ListingForm["item_condition"] })}
                  >
                    <option value="used">کارکرده</option>
                    <option value="like_new">در حد نو</option>
                    <option value="new">نو</option>
                  </select>
              </label> : null}
              {!formFieldPolicy.showPrice && !formFieldPolicy.showItemCondition ? <p className="field-policy-note">برای این دسته، قیمت و وضعیت کالا کاربردی نیست؛ فقط ویژگی‌های اختصاصی مرتبط نمایش داده می‌شود.</p> : null}
              </div>
            )}
              <div className="form-submit-row">
                <span className="form-submit-hint">{submitting ? "اطلاعات در حال ارسال و آماده‌سازی برای بررسی است..." : "عنوان، توضیح و شهر را کامل کن تا آگهی آماده بررسی شود."}</span>
                <button type="submit" className="submit-button" disabled={submitting || !cities.length || !categories.length}>
                  <Send size={18} />
                  {submitting ? "در حال ثبت" : "ارسال برای بررسی"}
                </button>
              </div>
              <button type="button" className="ghost-button ai-review-button" onClick={() => void reviewListingWithAi()} disabled={aiReviewBusy}>
                <Sparkles size={16} />
                {aiReviewBusy ? "در حال بررسی هوشمند" : "کمک هوشمند برای آگهی"}
              </button>
              {aiReview ? (
                <section className="ai-copilot" aria-live="polite">
                  <div className="ai-copilot-header">
                    <div>
                      <span className="ai-eyebrow"><Sparkles size={14} /> دستیار آگهی</span>
                      <h3>پیشنهادهای آماده برای بهتر شدن آگهی</h3>
                    </div>
                    <strong className="ai-score">{aiReview.score}٪</strong>
                  </div>
                  <p className="ai-summary">{aiReview.summary}</p>
                  <div className="ai-suggestion-grid">
                    <article className="ai-suggestion-card">
                      <span>عنوان پیشنهادی</span>
                      <strong>{aiReview.improved_title}</strong>
                      <button type="button" className="text-action" onClick={applyAiTitle}>اعمال عنوان</button>
                    </article>
                    <article className="ai-suggestion-card">
                      <span>توضیحات پیشنهادی</span>
                      <p>{aiReview.improved_description || "برای این آگهی توضیح تازه‌ای پیشنهاد نشد."}</p>
                      <button type="button" className="text-action" onClick={applyAiDescription} disabled={!aiReview.improved_description}>اعمال توضیحات</button>
                    </article>
                  </div>
                  <div className="ai-meta-row">
                    <span>دسته: {aiReview.category_suggestion || "بررسی نشده"}</span>
                    <span>قیمت: {aiReview.price_hint || "راهنمایی نشده"}</span>
                  </div>
                  {aiReview.attribute_suggestions?.length ? (
                    <div className="ai-attribute-row">
                      <span>ویژگی‌های پیشنهادی</span>
                      {aiReview.attribute_suggestions.map((attribute) => <em key={attribute}>{attribute}</em>)}
                    </div>
                  ) : null}
                  {aiReview.image_advice?.length ? (
                    <ul className="ai-tips image-advice-list">
                      {aiReview.image_advice.map((advice) => <li key={advice}>{advice}</li>)}
                    </ul>
                  ) : null}
                  {aiReview.suggestions.length ? (
                    <ul className="ai-tips">
                      {aiReview.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}
                    </ul>
                  ) : null}
                  <small className="ai-provider-note">پیشنهاد هوش مصنوعی است؛ قبل از ارسال خودت بررسی کن.</small>
                </section>
              ) : null}
            </form>

            <div className="timeline panel">
              <div className="panel-title">
                <Clock3 size={18} />
                <h2>مسیر انتشار آگهی</h2>
              </div>
              <ol>
                <li className="done">ثبت با شماره تاییدشده</li>
                <li className="done">افزودن عکس و توضیح کوتاه</li>
                <li className="active">بررسی کوتاه قبل از انتشار</li>
                <li>نمایش در بازار محلی 4D</li>
              </ol>
            </div>
                </div>
            </div>
          ) : null}
          </aside>
        </section>
      ) : null}

      {activeWorkspace === "profile" ? (
        <React.Suspense
          fallback={
            <section className="profile-band" aria-label="حساب کاربری">
              <div className="empty-state compact">
                <UserRound size={24} />
                <h2>در حال آماده‌سازی حساب</h2>
                <p>فضای ورود و پروفایل در حال بارگذاری است.</p>
              </div>
            </section>
          }
        >
          <ProfileWorkspace {...profileWorkspaceProps} />
        </React.Suspense>
      ) : null}

      {activeWorkspace === "admin" ? (
        <React.Suspense
          fallback={
            <section className="admin-band">
              <div className="empty-state compact">
                <ShieldCheck size={24} />
                <h2>در حال آماده‌سازی پنل ادمین</h2>
                <p>بخش مدیریت جداگانه بارگذاری می‌شود تا صفحه اصلی سبک‌تر بماند.</p>
              </div>
            </section>
          }
        >
          <AdminWorkspace
            isModerator={isModerator}
            isAdmin={isAdmin}
            moderationCases={moderationCases}
            pendingContents={pendingContents}
            moderationBusyId={moderationBusyId}
            items={items}
            cities={cities}
            refreshData={refreshData}
            refreshAdminUsers={refreshAdminUsers}
            currentRoles={currentUser?.roles ?? []}
            refreshModerationCases={refreshModerationCases}
            decideModerationCase={decideModerationCase}
            decidePendingContent={decidePendingContent}
            adminUsers={adminUsers}
            adminUserContents={adminUserContents}
            refreshAdminUserContents={refreshAdminUserContents}
            adminSupport={adminSupport}
            adminStorefronts={adminStorefronts}
            adminIdentityVerifications={adminIdentityVerifications}
            updateUserVerification={updateUserVerification}
            deleteAdminContent={deleteAdminContent}
            replyAdminSupport={replyAdminSupport}
            getAdminContentDetail={getAdminContentDetail}
            refreshAdminStorefronts={refreshAdminStorefronts}
            decideAdminStorefront={decideAdminStorefront}
            refreshAdminIdentityVerifications={refreshAdminIdentityVerifications}
            decideAdminIdentityVerification={decideAdminIdentityVerification}
            getAdminIdentityDocument={getAdminIdentityDocument}
            navigateWorkspace={navigateWorkspace}
            mediaUrl={mediaUrl}
          />
        </React.Suspense>
      ) : null}


      {notificationEvents.length ? (
        <section className="notification-stack" aria-label="اعلان‌های گفتگو">
          {notificationEvents.map((event) => (
            <button type="button" key={event.id} onClick={() => void openConversation(event.conversation_id)}>
              <Bell size={15} />
              <span>
                <strong>{event.title}</strong>
                <small>{event.body}</small>
              </span>
            </button>
          ))}
          <button type="button" className="notification-clear" onClick={() => setNotificationEvents([])}>
            پاک کردن
          </button>
        </section>
      ) : null}

      {selectedItem ? (
        <section
          className="detail-scrim"
          aria-label="جزئیات آگهی"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItemId(null);
          }}
        >
          <article className="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="listing-detail-title">
            <div className="detail-hero">
              {selectedItemMedia[selectedMediaIndex] ? <img src={mediaUrl(selectedItemMedia[selectedMediaIndex])} alt={`${selectedItem.title} - تصویر ${selectedMediaIndex + 1}`} /> : <Sparkles size={32} />}
              {selectedItemMedia.length > 1 ? <div className="detail-gallery-controls"><button type="button" className="icon-button" aria-label="تصویر قبلی" onClick={() => setSelectedMediaIndex((current) => (current - 1 + selectedItemMedia.length) % selectedItemMedia.length)}><ArrowLeft size={17} /></button><span>{(selectedMediaIndex + 1).toLocaleString("fa-IR")} / {selectedItemMedia.length.toLocaleString("fa-IR")}</span><button type="button" className="icon-button" aria-label="تصویر بعدی" onClick={() => setSelectedMediaIndex((current) => (current + 1) % selectedItemMedia.length)}><ArrowLeft size={17} className="next-gallery-icon" /></button></div> : null}
              <button type="button" className="icon-button close-button" onClick={() => setSelectedItemId(null)} aria-label="بستن" autoFocus>
                <X size={18} />
              </button>
            </div>
            {selectedItemMedia.length > 1 ? <div className="detail-gallery-thumbs" aria-label="تصاویر آگهی">{selectedItemMedia.map((url, index) => <button type="button" key={url} className={index === selectedMediaIndex ? "active" : ""} onClick={() => setSelectedMediaIndex(index)} aria-label={`نمایش تصویر ${index + 1}`}><img src={mediaUrl(url)} alt="" /></button>)}</div> : null}
            <div className="detail-body">
              <div>
                <span className={`status ${selectedItem.status}`}>{getStatusLabel(selectedItem.status)}</span>
                <h2 id="listing-detail-title">{selectedItem.title}</h2>
                <strong className="detail-price">{formatPrice(selectedItem.price_amount, selectedItem.price_type)}</strong>
                <span className="detail-view-count"><Eye size={15} /> {(selectedViewCount ?? selectedItem.view_count ?? 0).toLocaleString("fa-IR")} بازدید</span>
              </div>
              <p>{selectedItem.description}</p>
              <div className="listing-seller-summary"><UserRound size={16} /><span>فروشنده آگهی</span><IdentityBadge verified={selectedItem.seller_trust?.identity_verified} compact /></div>
              <div className="detail-facts">
                <span>{cities.find((city) => city.id === selectedItem.city_id)?.name_fa ?? "4D"}</span>
                <span>{categories.find((category) => category.id === selectedItem.category_id)?.name_fa ?? "دسته"}</span>
                {getListingFieldPolicy(categories.find((category) => category.id === selectedItem.category_id)?.slug, selectedItem.content_type === "service_listing" ? "service_listing" : "listing").showItemCondition && selectedItem.item_condition ? <span>{selectedItem.item_condition === "like_new" ? "در حد نو" : selectedItem.item_condition === "new" ? "نو" : "کارکرده"}</span> : null}
              </div>
              {getListingAttributes(selectedItem, categories.find((category) => category.id === selectedItem.category_id)?.metadata_schema ?? []).length ? <dl className="detail-attributes">{getListingAttributes(selectedItem, categories.find((category) => category.id === selectedItem.category_id)?.metadata_schema ?? []).map((attribute) => <div key={attribute.key}><dt>{attribute.label}</dt><dd>{attribute.value}</dd></div>)}</dl> : null}
              {selectedBusinessProfile ? (
                <div className="business-seller-card">
                  <Store size={19} />
                  <div>
                    <strong>{selectedBusinessProfile.business_name}</strong>
                    <span>{selectedBusinessProfile.business_type} · {selectedBusinessProfile.service_area}</span>
                    <small>{selectedBusinessProfile.opening_hours}</small>
                    {selectedTrustSummary ? <div className="seller-trust-row">
                      {selectedTrustSummary.mobile_verified ? <span>موبایل تأییدشده</span> : null}
                      {selectedTrustSummary.profile_complete ? <span>پروفایل کامل</span> : null}
                      {selectedTrustSummary.approved_listings > 0 ? <span>{selectedTrustSummary.approved_listings.toLocaleString("fa-IR")} آگهی تأییدشده</span> : null}
                      {selectedTrustSummary.seller_response_rate !== null && selectedTrustSummary.seller_response_rate !== undefined ? <span>{selectedTrustSummary.seller_response_rate.toLocaleString("fa-IR")}٪ پاسخ‌گویی</span> : null}
                    </div> : null}
                  </div>
                  <ShieldCheck size={17} aria-label="پروفایل عمومی" />
                </div>
              ) : null}
              {selectedItem.storefront_slug ? <a className="storefront-detail-link" href={sitePath(`/storefront/${selectedItem.storefront_slug}`)}><Store size={17} /> مشاهده غرفه {selectedItem.storefront_name ?? "فروشنده"}<ArrowLeft size={16} /></a> : null}
              {similarItems.length ? (
                <section className="similar-listings" aria-label="آگهی‌های مشابه">
                  <div className="similar-heading">
                    <Sparkles size={16} />
                    <strong>شاید این‌ها هم به کارت بیاید</strong>
                  </div>
                  <div className="similar-grid">
                    {similarItems.map((item) => (
                      <button type="button" className="similar-card" key={item.id} onClick={() => openItem(item)}>
                        <span className="similar-thumb">
                          {item.image_data_url ? <img src={mediaUrl(item.image_data_url)} alt="" loading="lazy" decoding="async" /> : <Sparkles size={16} />}
                        </span>
                        <span>
                          <strong>{item.title}</strong>
                          <small>{formatPrice(item.price_amount, item.price_type)}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {contactedItemIds.includes(selectedItem.id) ? (
                <div className="trust-note">
                  <ShieldCheck size={18} />
                  درخواست تماس آماده است؛ شماره یا مسیر ارتباطی بعد از تکمیل auth واقعی نمایش داده می‌شود.
                </div>
              ) : null}
              {reportedItemIds.includes(selectedItem.id) ? (
                <div className="report-note">
                  <Flag size={18} />
                  گزارش این آگهی ثبت شد و به‌زودی بررسی می‌شود.
                </div>
              ) : null}
              <div className="detail-actions">
                {selectedItemConversation ? (
                  <button type="button" className="submit-button" onClick={() => void openConversation(selectedItemConversation.id)}>
                    <MessageCircle size={18} />
                    باز کردن چت
                  </button>
                ) : (
                  <button type="button" className="submit-button" onClick={() => void startContact(selectedItem)}>
                    <Phone size={18} />
                    تماس
                  </button>
                )}
                <button type="button" className="ghost-danger" onClick={() => void reportItem(selectedItem)}>
                  <Flag size={18} />
                  گزارش
                </button>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {activeConversation ? (
        <React.Suspense
          fallback={
            <section className="chat-scrim" aria-label="چت داخل برنامه">
              <div className="chat-drawer chat-loading">
                <MessageCircle size={24} />
                <span>در حال آماده‌سازی چت...</span>
              </div>
            </section>
          }
        >
          <ChatWorkspace {...chatWorkspaceProps} />
        </React.Suspense>
      ) : null}
    </main>
    </>
  );
}

function mergeItems(primary: MarketItem[], secondary: MarketItem[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getConversationPreview(conversation: Conversation, currentUserId?: string) {
  if (!conversation.last_message_body) {
    return conversation.seller_user_id === currentUserId ? "نقش شما: فروشنده" : "نقش شما: خریدار";
  }
  const prefix = conversation.last_message_sender_user_id === currentUserId ? "شما: " : "";
  return `${prefix}${trimText(conversation.last_message_body, 58)}`;
}

function trimText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function mergeConversations(primary: Conversation[], secondary: Conversation[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((conversation) => {
    if (seen.has(conversation.id)) return false;
    seen.add(conversation.id);
    return true;
  });
}

function normalizeIranPhone(value: string) {
  const input = value.trim().replace(/\s|-/g, "");
  if (/^9\d{9}$/.test(input)) return `+98${input}`;
  if (/^09\d{9}$/.test(input)) return `+98${input.slice(1)}`;
  if (/^\+989\d{9}$/.test(input)) return input;
  if (/^989\d{9}$/.test(input)) return `+${input}`;
  return "";
}

function normalizeOtpCode(value: string) {
  return value.trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getCaptchaTarget() {
  return 38 + Math.floor(Math.random() * 31);
}

function getCaptchaY() {
  return 36 + Math.floor(Math.random() * 28);
}

function formatCompactDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "به‌تازگی";
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("fa-IR")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ۀة]/g, "ه")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function SearchableSelect({ value, options, placeholder, onChange, allLabel }: {
  value: string;
  options: Array<{ id: string; label: string }>;
  placeholder: string;
  onChange: (value: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.id === value);
  const matching = options.filter((option) => normalizeSearchText(option.label).includes(normalizeSearchText(query)));
  const choose = (nextValue: string) => { onChange(nextValue); setQuery(""); setOpen(false); };
  return <div className="searchable-select" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <button type="button" className="searchable-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{selected?.label ?? allLabel ?? placeholder}</span><span aria-hidden="true">⌄</span>
    </button>
    {open ? <div className="searchable-select-menu" role="listbox">
      <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {allLabel ? <button type="button" role="option" aria-selected={value === "all"} onMouseDown={(event) => event.preventDefault()} onClick={() => choose("all")}>{allLabel}</button> : null}
      {matching.slice(0, 7).map((option) => <button type="button" role="option" key={option.id} aria-selected={option.id === value} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option.id)}>{option.label}</button>)}
      {!matching.length ? <span className="searchable-select-empty">موردی پیدا نشد</span> : null}
      {matching.length > 7 ? <small>برای دیدن موارد بیشتر، جست‌وجو را دقیق‌تر کن.</small> : null}
    </div> : null}
  </div>;
}

function getSearchRelevance(item: MarketItem, query: string, cities: City[], categories: Category[]) {
  const terms = query.split(" ").filter(Boolean);
  const title = normalizeSearchText(item.title);
  const description = normalizeSearchText(item.description);
  const category = normalizeSearchText(categories.find((value) => value.id === item.category_id)?.name_fa ?? "");
  const city = normalizeSearchText(cities.find((value) => value.id === item.city_id)?.name_fa ?? "");
  return terms.reduce((score, term) => {
    if (title.includes(term)) return score + 5;
    if (category.includes(term)) return score + 4;
    if (city.includes(term)) return score + 3;
    if (description.includes(term)) return score + 1;
    return score;
  }, 0);
}

function getSimilarityScore(source: MarketItem, candidate: MarketItem) {
  let score = 0;
  if (source.category_id === candidate.category_id) score += 5;
  if (source.city_id === candidate.city_id) score += 2;
  if (source.item_condition && source.item_condition === candidate.item_condition) score += 1;
  const sourceWords = new Set(normalizeSearchText(source.title).split(" ").filter((word) => word.length > 2));
  const candidateWords = normalizeSearchText(candidate.title).split(" ");
  score += candidateWords.filter((word) => sourceWords.has(word)).length * 2;
  return score;
}

async function compressImageFile(file: File) {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = sourceUrl;
    });

    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas_unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.72, 0.62, 0.52]) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= 1_900_000) return dataUrl;
    }

    const smallerCanvas = document.createElement("canvas");
    smallerCanvas.width = Math.max(1, Math.round(canvas.width * 0.72));
    smallerCanvas.height = Math.max(1, Math.round(canvas.height * 0.72));
    const smallerContext = smallerCanvas.getContext("2d");
    if (!smallerContext) throw new Error("canvas_unavailable");
    smallerContext.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
    return smallerCanvas.toDataURL("image/jpeg", 0.58);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function readImageMetadata(dataUrl: string): Promise<ImageMetadata> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = dataUrl;
  });
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : "";
  const mimeMatch = /^data:([^;]+);/.exec(dataUrl);
  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    size_bytes: Math.floor(base64.length * 0.75),
    mime_type: mimeMatch?.[1] ?? "image/jpeg"
  };
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD && import.meta.env.BASE_URL === "/") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(sitePath("/service-worker.js"), { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => undefined);
  });
}

if ("serviceWorker" in navigator && import.meta.env.DEV) {
  window.addEventListener("load", () => {
    const resetKey = "four-d-dev-service-worker-reset";
    void Promise.all([
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
      "caches" in window
        ? caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("four-d-")).map((key) => caches.delete(key))))
        : Promise.resolve([])
    ]).then(() => {
      if (navigator.serviceWorker.controller && sessionStorage.getItem(resetKey) !== "done") {
        sessionStorage.setItem(resetKey, "done");
        window.location.reload();
        return;
      }
      if (!navigator.serviceWorker.controller) sessionStorage.removeItem(resetKey);
    });
  });
}
