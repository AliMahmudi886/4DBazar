// @ts-nocheck
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { PuzzleCaptcha } from "./components/PuzzleCaptcha";
import {
  getSavedNativePushToken,
  registerNativeNotifications,
} from "./notifications";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.4dbazar.ir"
).replace(/\/$/, "");
const API_HOST = (() => {
  return API_BASE_URL.replace(/^[a-z]+:\/\//i, "").split("/")[0] || API_BASE_URL;
})();
const TOKEN_KEY = "four_d_mobile_session";
const REFRESH_TOKEN_KEY = "four_d_mobile_refresh_session";
let activeAccessToken = "";
let activeRefreshToken = "";
let refreshInFlight: Promise<boolean> | null = null;

async function loadSessionToken() {
  try {
    const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (secureToken) return secureToken;
  } catch {
    // Older/dev clients may not have a native secure-store implementation.
  }
  const legacyToken = await AsyncStorage.getItem(TOKEN_KEY);
  if (legacyToken) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, legacyToken);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {
      // Keep the legacy token usable when running in an older native shell.
    }
  }
  return legacyToken;
}

async function loadRefreshToken() {
  try {
    const secureToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (secureToken) return secureToken;
  } catch {
    // Fall back for older development clients.
  }
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function saveSessionToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  } catch {
    // Fallback keeps Expo Go/old development clients usable.
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

async function saveRefreshToken(token: string) {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  } catch {
    // Fallback keeps Expo Go/old development clients usable.
  }
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
}

async function clearSessionToken() {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
  activeAccessToken = "";
  activeRefreshToken = "";
}

async function refreshMobileSession() {
  if (!activeRefreshToken) return false;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refresh_token: activeRefreshToken }),
      });
      if (!response.ok) return false;
      const body = (await response.json()) as { data?: { token?: string; refresh_token?: string } };
      const nextAccess = body.data?.token;
      const nextRefresh = body.data?.refresh_token;
      if (!nextAccess || !nextRefresh) return false;
      activeAccessToken = nextAccess;
      activeRefreshToken = nextRefresh;
      await Promise.all([saveSessionToken(nextAccess), saveRefreshToken(nextRefresh)]);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
const LOGO = require("./assets/4d-logo-horizontal-clean.png");
function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      source={LOGO}
      style={{ width: compact ? 118 : 160, height: compact ? 42 : 58 }}
      resizeMode="contain"
      accessible
      accessibilityLabel="نشان بازار محلی 4D"
    />
  );
}

function MobileSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  searchable = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value)?.label;
  const visible = options.filter((option) => !query.trim() || option.label.toLocaleLowerCase("fa").includes(query.trim().toLocaleLowerCase("fa")));
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.selectField} onPress={() => { setQuery(""); setOpen(true); }} accessibilityRole="button" accessibilityLabel={`انتخاب ${label}`}>
        <Text style={[styles.selectValue, !selected && styles.selectPlaceholder]}>{selected ?? placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color="#52606d" />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.cardTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} accessibilityLabel="بستن انتخابگر"><Ionicons name="close" size={22} color="#52606d" /></Pressable>
            </View>
            {searchable ? <TextInput value={query} onChangeText={setQuery} style={styles.input} placeholder={`جست‌وجوی ${label}`} textAlign="right" autoFocus /> : null}
            <ScrollView contentContainerStyle={styles.pickerOptions} keyboardShouldPersistTaps="handled">
              {visible.map((option) => <Pressable key={option.value} style={[styles.pickerOption, option.value === value && styles.pickerOptionActive]} onPress={() => { onChange(option.value); setOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: option.value === value }}>
                <Text style={[styles.pickerOptionText, option.value === value && styles.pickerOptionTextActive]}>{option.label}</Text>
                {option.value === value ? <Ionicons name="checkmark" size={19} color="#ffffff" /> : null}
              </Pressable>)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
type Item = {
  id: string;
  content_type?: string;
  title: string;
  description: string;
  city_id: string;
  category_id: string;
  status?: string;
  created_at?: string;
  view_count?: number;
  metadata_json?: Record<string, unknown> | null;
  media?: Array<{ url: string; mime_type?: string | null }>;
  seller_trust?: { identity_verified?: boolean; storefront_verified?: boolean } | null;
  related?: Item[];
  storefront_slug?: string | null;
  storefront_name?: string | null;
  owner_user_id?: string;
  service_area?: string | null;
  availability?: string | null;
  pricing_model?: string | null;
  price_amount?: number | null;
  price_type?: string | null;
  image_data_url?: string | null;
};
type City = { id: string; code: string; name_fa: string };
type CategoryMetadataField = { key: string; label_fa: string; type: "text" | "number" | "select"; required?: boolean; placeholder?: string; options?: Array<{ value: string; label_fa: string }> };
type Category = { id: string; slug: string; name_fa: string; content_types?: unknown; metadata_schema?: CategoryMetadataField[] };
const attributeLabels: Record<string, string> = {
  rooms: "تعداد اتاق",
  area_m2: "متراژ",
  property_type: "نوع ملک",
  condition: "وضعیت",
  brand: "برند",
  model: "مدل",
};
const attributeValues: Record<string, string> = {
  apartment: "آپارتمان",
  house: "خانه",
  villa: "ویلا",
  land: "زمین",
  office: "دفتر کار",
  shop: "مغازه",
  new: "نو",
  used: "کارکرده",
};
const attributeLabel = (key: string) => attributeLabels[key] ?? key.replaceAll("_", " ");
const attributeValue = (key: string, value: unknown) => key === "property_type" || key === "condition" ? (attributeValues[String(value)] ?? String(value)) : String(value);
type Storefront = { id: string; name: string; slug: string; short_description: string; description: string; business_type: string; address?: string | null; phone?: string | null; city_id?: string; category_id?: string; status?: string; owner_trust?: { identity_verified?: boolean } | null };
type Conversation = {
  id: string;
  content_title: string;
  content_id: string;
  unread_count?: number;
  last_message_body?: string | null;
  is_muted?: boolean;
  is_blocked?: boolean;
  is_blocked_by_me?: boolean;
  last_message_at?: string | null;
  updated_at: string;
  participant?: { user_id: string; display_name: string; city_id?: string | null; city_name?: string | null; identity_verified?: boolean };
};
type TransportResult = {
  id: string;
  title: string;
  description: string;
  mode: "offer" | "request";
  origin_label: string;
  destination_label: string;
  departure_date: string;
  time_from: string;
  time_to?: string | null;
  vehicle_type?: string | null;
};
type MeResponse = {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
    display_name?: string | null;
    primary_city_id?: string | null;
  } | null;
  password_set: boolean;
  profile_complete: boolean;
  can_create_listing?: boolean;
  profile_missing_fields?: string[];
  mobile_verified: boolean;
  identity_verification_status?: "not_implemented" | "pending" | "verified" | "rejected";
  roles: string[];
};
type MyItem = Item & { status: string; created_at?: string };
type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  read_by_recipient?: boolean;
};

async function api<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  let response: Response;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const startedAt = Date.now();
  const method = String(options.method ?? "GET").toUpperCase();
  const logRequest = (result: string) => {
    if (__DEV__) {
      console.info(`[4D API] ${method} ${API_HOST}${path} ${result}`);
    }
  };
  try {
    response = await Promise.race([
      fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body != null ? { "content-type": "application/json" } : {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
      }),
      new Promise<Response>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("request_timeout")), 15000);
      }),
      ]);
      logRequest(`${response.status} ${Date.now() - startedAt}ms`);
    } catch (error) {
      if (error instanceof Error && error.message === "request_timeout") {
        logRequest(`TIMEOUT ${Date.now() - startedAt}ms`);
        throw new Error("پاسخ سرویس طول کشید؛ اتصال اینترنت و API را بررسی کنید.");
      }
      logRequest(`NETWORK_ERROR ${Date.now() - startedAt}ms`);
      throw new Error("اتصال اینترنت یا سرویس 4D در دسترس نیست.");
  } finally {
    if (timeout) clearTimeout(timeout);
  }
  if (response.status === 401 && activeRefreshToken && path !== "/api/v1/auth/refresh") {
    const refreshed = await refreshMobileSession();
    if (refreshed) {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body != null ? { "content-type": "application/json" } : {}),
          authorization: `Bearer ${activeAccessToken}`,
          ...(options.headers ?? {}),
        },
      });
      logRequest(`RETRY ${response.status} ${Date.now() - startedAt}ms`);
    }
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = body?.error?.code ?? "request_failed";
    const serverMessage = typeof body?.error?.message === "string" ? body.error.message.trim() : "";
    if (serverMessage && ["validation_failed", "invalid_phone", "invalid_otp", "invalid_credentials", "captcha_invalid", "captcha_expired", "forbidden", "service_unavailable", "not_found"].includes(code)) {
      throw new Error(serverMessage);
    }
    const messages: Record<string, string> = {
      captcha_required: "پازل منقضی شده است؛ دوباره آن را حل کنید.",
      captcha_invalid: "پاسخ پازل امنیتی درست نیست؛ دوباره تلاش کنید.",
      captcha_expired: "پازل امنیتی منقضی شده است؛ دوباره بارگذاری کنید.",
      invalid_phone: "شماره موبایل معتبر نیست.",
      invalid_otp: "کد تایید درست نیست یا منقضی شده است.",
      invalid_credentials: "شماره موبایل یا رمز عبور درست نیست.",
      rate_limited: "تعداد تلاش‌ها زیاد شده است؛ کمی صبر کنید.",
      validation_failed: "اطلاعات واردشده کامل یا معتبر نیست.",
      unauthorized: "نشست شما منقضی شده است؛ دوباره وارد شوید.",
      service_unavailable: "سرویس موقتاً در دسترس نیست؛ دوباره تلاش کنید.",
    };
    throw new Error(
      messages[code] ?? body?.error?.message ?? "درخواست انجام نشد.",
    );
  }
  return body as T;
}

function mediaUrl(value?: string | null) {
  if (!value || value.startsWith("data:") || /^https?:\/\//i.test(value))
    return value ?? "";
  return `${API_BASE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
}

function price(item: Item) {
  return item.price_type === "negotiable" || item.price_amount == null
    ? "توافقی"
    : `${Number(item.price_amount).toLocaleString("fa-IR")} تومان`;
}
function listingFieldPolicy(category?: Category, contentType: "listing" | "service_listing" | "transport" = "listing") {
  const slug = category?.slug ?? "";
  const conditionCategories = new Set(["general-used-goods", "vehicles", "mobile-digital", "home-kitchen", "tools-equipment", "personal-fashion", "sports-hobbies", "business-equipment"]);
  return { showPrice: !new Set(["jobs", "local-transport"]).has(slug), showItemCondition: contentType === "listing" && conditionCategories.has(slug) };
}

function normalizeOtpDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\D/g, "");
}

function formatMoneyInput(value: string) {
  const digits = value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[^0-9]/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [deepLinkConversationId, setDeepLinkConversationId] = useState<
    string | null
  >(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);
  useEffect(() => {
    void Promise.all([loadSessionToken(), loadRefreshToken()]).then(([value, refresh]) => {
      activeAccessToken = value ?? "";
      activeRefreshToken = refresh ?? "";
      setToken(value);
      setBooting(false);
    });
  }, []);
  useEffect(() => {
    const parse = (url: string | null) => {
      const conversation = url?.match(/conversation\/([^/?#]+)/);
      if (conversation?.[1]) setDeepLinkConversationId(conversation[1]);
      const target = url?.match(/\/(listing|transport)\/([^/?#]+)/);
      if (target?.[1] && target[2]) setDeepLinkUrl(`/${target[1]}/${target[2]}`);
    };
    void Linking.getInitialURL().then(parse);
    const subscription = Linking.addEventListener("url", ({ url }) =>
      parse(url),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const parse = (data: Notifications.NotificationResponse) => {
      const conversationId =
        data.notification.request.content.data?.conversationId;
      if (typeof conversationId === "string")
        setDeepLinkConversationId(conversationId);
      const url = data.notification.request.content.data?.url;
      if (typeof url === "string") setDeepLinkUrl(url);
    };
    const subscription =
      Notifications.addNotificationResponseReceivedListener(parse);
    return () => subscription.remove();
  }, []);
  if (booting)
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color="#009688" accessibilityLabel="در حال آماده‌سازی برنامه" />
      </SafeAreaView>
    );
  return (
    <>
      <StatusBar barStyle="dark-content" />
      {token ? (
        <TabsShell
          token={token}
          deepLinkConversationId={deepLinkConversationId}
          deepLinkUrl={deepLinkUrl}
          onLogout={() => {
            void api("/api/v1/auth/logout", { method: "POST", body: "{}" }, token).catch(() => undefined);
            void clearSessionToken();
            setToken(null);
          }}
        />
      ) : (
        <AuthScreenV2
          onSuccess={(value, refreshToken) => {
            activeAccessToken = value;
            void saveSessionToken(value);
            if (refreshToken) {
              activeRefreshToken = refreshToken;
              void saveRefreshToken(refreshToken);
            }
            setToken(value);
          }}
        />
      )}
    </>
  );
}

function TabsShell({
  token,
  deepLinkConversationId,
  deepLinkUrl,
  onLogout,
}: {
  token: string;
  deepLinkConversationId: string | null;
  deepLinkUrl: string | null;
  onLogout: () => void;
}) {
  const [screen, setScreen] = useState<
    "market" | "create" | "inbox" | "profile" | "admin" | "detail" | "storefront" | "transport"
  >("market");
  const [selected, setSelected] = useState<Item | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportResult | null>(null);
  const [selectedStorefrontSlug, setSelectedStorefrontSlug] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    deepLinkConversationId,
  );
  const previousUnreadRef = useRef<Map<string, number> | null>(null);
  const openDetail = (item: Item) => {
    setSelected(item);
    setScreen("detail");
  };
  const openTransport = (item: TransportResult) => {
    setSelectedTransport(item);
    setScreen("transport");
  };
  useEffect(() => {
    if (deepLinkConversationId) {
      setConversationId(deepLinkConversationId);
      setScreen("inbox");
    }
  }, [deepLinkConversationId]);
  useEffect(() => {
    if (!deepLinkUrl) return;
    const listing = deepLinkUrl.match(/^\/listing\/([^/?#]+)/);
    const transport = deepLinkUrl.match(/^\/transport\/([^/?#]+)/);
    if (listing?.[1]) {
      void api<{ data: Item }>(`/api/v1/contents/${listing[1]}`).then((result) => { setSelected(result.data); setScreen("detail"); }).catch(() => undefined);
    } else if (transport?.[1]) {
      void api<{ data: TransportResult }>(`/api/v1/transport/${transport[1]}`).then((result) => { setSelectedTransport(result.data); setScreen("transport"); }).catch(() => undefined);
    }
  }, [deepLinkUrl]);
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const result = await api<{ data: Conversation[] }>("/api/v1/me/conversations", {}, token);
        if (cancelled) return;
        const nextUnread = new Map(result.data.map((item) => [item.id, item.unread_count ?? 0]));
        const previous = previousUnreadRef.current;
        previousUnreadRef.current = nextUnread;
        if (!previous) return;
        const incoming = result.data.filter((item) => (item.unread_count ?? 0) > (previous.get(item.id) ?? 0) && item.last_message_body);
        if (!incoming.length) return;
        const permission = await Notifications.getPermissionsAsync();
        if (permission.status !== "granted") return;
        for (const item of incoming.slice(0, 2)) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "پیام جدید در 4D",
              body: `${item.content_title}: ${item.last_message_body}`,
              data: { conversationId: item.id, url: `/conversation/${item.id}` },
            },
            trigger: null,
          });
        }
      } catch { /* inbox screen displays the API error when opened */ }
    };
    void poll();
    const timer = setInterval(() => void poll(), 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [token]);
  const content =
    screen === "transport" && selectedTransport ? (
      <TransportDetailScreen item={selectedTransport} token={token} onBack={() => setScreen("market")} onConversationReady={(id) => { setConversationId(id); setScreen("inbox"); }} />
    ) : screen === "storefront" && selectedStorefrontSlug ? (
      <StorefrontScreen slug={selectedStorefrontSlug} onBack={() => setScreen("detail")} onListingOpen={(item) => { setSelected(item); setScreen("detail"); }} />
    ) : screen === "detail" && selected ? (
      <DetailScreen
        item={selected}
        token={token}
        onBack={() => setScreen("market")}
        onConversationReady={(id) => {
          setConversationId(id);
          setScreen("inbox");
        }}
        onStorefrontOpen={(slug) => { setSelectedStorefrontSlug(slug); setScreen("storefront"); }}
      />
    ) : screen === "market" ? (
      <MarketScreen onOpen={openDetail} onTransportOpen={openTransport} token={token} />
    ) : screen === "create" ? (
      <CreateScreen token={token} onBack={() => setScreen("market")} />
    ) : screen === "admin" ? (
      <AdminScreen token={token} onBack={() => setScreen("profile")} />
    ) : screen === "inbox" ? (
      <InboxScreenV2
        token={token}
        initialConversationId={conversationId}
      />
    ) : (
      <ProfileScreenV6 token={token} onLogout={onLogout} onOpen={openDetail} onAdmin={() => setScreen("admin")} />
    );
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.routerContent}>{content}</View>
      {screen !== "detail" && screen !== "storefront" && screen !== "transport" && screen !== "create" && screen !== "admin" ? (
        <View style={styles.nav}>
          {(
            [
              ["market", "بازار", "storefront-outline", "storefront"],
              ["create", "ثبت آگهی", "add-circle-outline", "add-circle"],
              [
                "inbox",
                "گفتگو",
                "chatbubble-ellipses-outline",
                "chatbubble-ellipses",
              ],
              ["profile", "پروفایل", "person-circle-outline", "person-circle"],
            ] as const
          ).map(([key, label, icon, activeIcon]) => {
            const isCreate = key === "create";
            const isActive = screen === key;
            return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: screen === key }}
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => setScreen(key)}
            >
              <View
                style={[
                  styles.navIcon,
                  isCreate && styles.navCreateIcon,
                  isActive && styles.navIconActive,
                  isCreate && isActive && styles.navCreateIconActive,
                ]}
              >
                <Ionicons
                  name={isActive ? activeIcon : icon}
                  size={isCreate ? 25 : 22}
                  color={isCreate ? "#ffffff" : isActive ? "#087f79" : "#718079"}
                />
              </View>
              <Text
                style={[styles.navText, isActive && styles.navActive]}
              >
                {label}
              </Text>
            </Pressable>
            );
          })}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function MarketScreen({ onOpen, onTransportOpen, token }: { onOpen: (item: Item) => void; onTransportOpen: (item: TransportResult) => void; token: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [metadataFilters, setMetadataFilters] = useState<Record<string, string>>({});
  const [filterCityId, setFilterCityId] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [marketSort, setMarketSort] = useState<"newest" | "price_low" | "price_high">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [transportQuery, setTransportQuery] = useState("");
  const [transportOriginId, setTransportOriginId] = useState("");
  const [transportDestinationId, setTransportDestinationId] = useState("");
  const [transportMode, setTransportMode] = useState<"all" | "offer" | "request">("all");
  const [transportResults, setTransportResults] = useState<TransportResult[]>([]);
  const [transportNotice, setTransportNotice] = useState("");
  const [transportBusy, setTransportBusy] = useState(false);
  const [transportOpen, setTransportOpen] = useState(false);
  const load = async () => {
    setMessage("");
    try {
      const [feedResult, cityResult, categoryResult, favoriteResult] = await Promise.allSettled([
        api<{ data: Item[] }>("/api/v1/feed"),
        api<{ data: City[] }>("/api/v1/regions/4d/cities"),
        api<{ data: Category[] }>("/api/v1/categories"),
        api<{ data: string[] }>("/api/v1/me/favorites", {}, token),
      ]);
      if (feedResult.status === "rejected") throw feedResult.reason;
      setItems(feedResult.value.data);
      if (cityResult.status === "fulfilled") setCities(cityResult.value.data);
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data);
      if (favoriteResult.status === "fulfilled") setFavoriteIds(favoriteResult.value.data);
    } catch {
      setMessage("اتصال به بازار برقرار نشد.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  const toggleFavorite = async (item: Item) => {
    if (favoriteBusyId) return;
    setFavoriteBusyId(item.id);
    try {
      const isFavorite = favoriteIds.includes(item.id);
      await api(`/api/v1/contents/${item.id}/favorite`, { method: isFavorite ? "DELETE" : "POST", ...(isFavorite ? {} : { body: "{}" }) }, token);
      setFavoriteIds((current) => isFavorite ? current.filter((id) => id !== item.id) : [...current, item.id]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره آگهی انجام نشد.");
    } finally {
      setFavoriteBusyId(null);
    }
  };
  const searchTransport = async () => {
    const value = transportQuery.trim();
    const origin = cities.find((city) => city.id === transportOriginId)?.name_fa ?? "";
    const destination = cities.find((city) => city.id === transportDestinationId)?.name_fa ?? "";
    if (!value && !origin && !destination && transportMode === "all") {
      setTransportNotice("عنوان، مبدأ، مقصد یا نوع مسیر را انتخاب کنید.");
      return;
    }
    setTransportBusy(true);
    setTransportNotice("");
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (value) params.set("q", value);
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      if (transportMode !== "all") params.set("mode", transportMode);
      const result = await api<{ data: TransportResult[] }>(`/api/v1/transport/search?${params.toString()}`);
      setTransportResults(result.data);
      if (!result.data.length) setTransportNotice("مسیر هماهنگی با این جست‌وجو پیدا نشد.");
    } catch (error) {
      setTransportNotice(error instanceof Error ? error.message : "جست‌وجوی حمل‌ونقل در دسترس نیست.");
    } finally {
      setTransportBusy(false);
    }
  };
  const visibleItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("fa");
    return items.filter((item) => {
      const inCategory = categoryId === "all" || item.category_id === categoryId;
      const inSearch = !needle || `${item.title} ${item.description}`.toLocaleLowerCase("fa").includes(needle);
      const inMetadata = Object.entries(metadataFilters).every(([key, value]) => !value || String(item.metadata_json?.[key] ?? "").toLocaleLowerCase("fa").includes(value.toLocaleLowerCase("fa")));
      const inCity = filterCityId === "all" || item.city_id === filterCityId;
      const numericPrice = item.price_amount == null ? null : Number(item.price_amount);
      const minValue = minPrice.trim() ? Number(minPrice.replace(/,/g, "")) : null;
      const maxValue = maxPrice.trim() ? Number(maxPrice.replace(/,/g, "")) : null;
      const inMin = minValue == null || (numericPrice != null && Number.isFinite(minValue) && numericPrice >= minValue);
      const inMax = maxValue == null || (numericPrice != null && Number.isFinite(maxValue) && numericPrice <= maxValue);
      return inCategory && inSearch && inMetadata && inCity && inMin && inMax;
    });
    return filtered.sort((left, right) => marketSort === "price_low" ? (left.price_amount ?? Number.POSITIVE_INFINITY) - (right.price_amount ?? Number.POSITIVE_INFINITY) : marketSort === "price_high" ? (right.price_amount ?? Number.NEGATIVE_INFINITY) - (left.price_amount ?? Number.NEGATIVE_INFINITY) : String(right.created_at ?? "").localeCompare(String(left.created_at ?? "")));
  }, [categoryId, filterCityId, items, marketSort, maxPrice, metadataFilters, minPrice, query]);
  const cityName = (id: string) => cities.find((city) => city.id === id)?.name_fa ?? "منطقه 4D";
  const categoryName = (id: string) => categories.find((category) => category.id === id)?.name_fa ?? "آگهی محلی";
  const filterFields = categoryId === "all" ? [] : categories.find((category) => category.id === categoryId)?.metadata_schema ?? [];
  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <BrandLogo compact />
          <View>
            <Text style={styles.kicker}>بازار محلی 4D</Text>
            <Text style={styles.region}>گرمه · جاجرم · ایور · درق</Text>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>آنلاین</Text>
        </View>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.marketScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground source={require("./assets/4d-market-banner.png")} imageStyle={styles.marketBannerImage} style={styles.marketIntro}>
          <View>
            <Text style={styles.marketEyebrow}>نزدیک، امن، محلی</Text>
            <Text style={styles.title}>چیزهای نزدیک، انتخاب‌های بهتر</Text>
            <Text style={styles.marketBannerText}>خرید، فروش و خدمات محلی در 4D</Text>
          </View>
          <View style={styles.marketCountBadge}>
            <Text style={styles.sectionCount}>{visibleItems.length.toLocaleString("fa-IR")} آگهی</Text>
          </View>
        </ImageBackground>
        <View style={styles.marketSearch}>
          <Ionicons name="search-outline" size={20} color="#08746d" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="جستجو در کالاها و خدمات"
            placeholderTextColor="#87958f"
            style={styles.marketSearchInput}
            accessibilityLabel="جستجو در آگهی‌ها"
            textAlign="right"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} accessibilityLabel="پاک کردن جستجو">
              <Ionicons name="close-circle" size={20} color="#8a9891" />
            </Pressable>
          ) : null}
        </View>
        {categories.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marketCategories}
          >
            <Pressable
              style={[styles.marketCategory, categoryId === "all" && styles.marketCategoryActive]}
              onPress={() => { setCategoryId("all"); setMetadataFilters({}); }}
            >
              <Text style={[styles.marketCategoryText, categoryId === "all" && styles.marketCategoryTextActive]}>همه</Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[styles.marketCategory, categoryId === category.id && styles.marketCategoryActive]}
                onPress={() => { setCategoryId(category.id); setMetadataFilters({}); }}
              >
                <Text style={[styles.marketCategoryText, categoryId === category.id && styles.marketCategoryTextActive]}>
                  {category.name_fa}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <Pressable
          style={styles.filterToggle}
          onPress={() => setFiltersOpen((value) => !value)}
          accessibilityRole="button"
          accessibilityState={{ expanded: filtersOpen }}
          accessibilityLabel="باز و بسته کردن فیلترهای بازار"
        >
          <View style={styles.filterToggleCopy}>
            <Text style={styles.cardTitle}>فیلتر بازار</Text>
            <Text style={styles.filterSummary}>{filterCityId === "all" && !minPrice && !maxPrice && marketSort === "newest" ? "همه آگهی‌ها" : "فیلتر فعال است"}</Text>
          </View>
          <Ionicons name={filtersOpen ? "chevron-up" : "options-outline"} size={20} color="#087f79" />
        </Pressable>
        {filtersOpen ? <View style={styles.marketFilterCard}>
          <Text style={styles.fieldLabel}>شهر</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
            <Pressable style={[styles.choiceChip, filterCityId === "all" && styles.choiceChipActive]} onPress={() => setFilterCityId("all")}><Text style={[styles.choiceText, filterCityId === "all" && styles.choiceTextActive]}>کل 4D</Text></Pressable>
            {cities.map((city) => <Pressable key={city.id} style={[styles.choiceChip, filterCityId === city.id && styles.choiceChipActive]} onPress={() => setFilterCityId(city.id)}><Text style={[styles.choiceText, filterCityId === city.id && styles.choiceTextActive]}>{city.name_fa}</Text></Pressable>)}
          </ScrollView>
          <View style={styles.priceFilterRow}><TextInput value={minPrice} onChangeText={setMinPrice} style={[styles.input, styles.priceFilterInput]} placeholder="حداقل قیمت" keyboardType="numeric" textAlign="right" /><TextInput value={maxPrice} onChangeText={setMaxPrice} style={[styles.input, styles.priceFilterInput]} placeholder="حداکثر قیمت" keyboardType="numeric" textAlign="right" /></View>
          <Text style={styles.fieldLabel}>مرتب‌سازی</Text>
          <View style={styles.transportModes}><Pressable style={[styles.choiceChip, marketSort === "newest" && styles.choiceChipActive]} onPress={() => setMarketSort("newest")}><Text style={[styles.choiceText, marketSort === "newest" && styles.choiceTextActive]}>جدیدترین</Text></Pressable><Pressable style={[styles.choiceChip, marketSort === "price_low" && styles.choiceChipActive]} onPress={() => setMarketSort("price_low")}><Text style={[styles.choiceText, marketSort === "price_low" && styles.choiceTextActive]}>ارزان‌ترین</Text></Pressable><Pressable style={[styles.choiceChip, marketSort === "price_high" && styles.choiceChipActive]} onPress={() => setMarketSort("price_high")}><Text style={[styles.choiceText, marketSort === "price_high" && styles.choiceTextActive]}>گران‌ترین</Text></Pressable></View>
        </View> : null}
        {filterFields.length ? <View style={styles.dynamicFilterCard}>
          <Text style={styles.cardTitle}>فیلتر ویژگی‌ها</Text>
          {filterFields.map((field) => field.type === "select" ? <ScrollView key={field.key} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{(field.options ?? []).map((option) => <Pressable key={option.value} style={[styles.choiceChip, metadataFilters[field.key] === option.value && styles.choiceChipActive]} onPress={() => setMetadataFilters((current) => ({ ...current, [field.key]: current[field.key] === option.value ? "" : option.value }))}><Text style={[styles.choiceText, metadataFilters[field.key] === option.value && styles.choiceTextActive]}>{field.label_fa}: {option.label_fa}</Text></Pressable>)}</ScrollView> : <TextInput key={field.key} value={metadataFilters[field.key] ?? ""} onChangeText={(value) => setMetadataFilters((current) => ({ ...current, [field.key]: value }))} style={styles.input} placeholder={`فیلتر ${field.label_fa}`} keyboardType={field.type === "number" ? "numeric" : "default"} textAlign="right" />)}
        </View> : null}
        <Pressable style={styles.filterToggle} onPress={() => setTransportOpen((value) => !value)} accessibilityRole="button" accessibilityState={{ expanded: transportOpen }} accessibilityLabel="باز و بسته کردن جست‌وجوی حمل‌ونقل">
          <View style={styles.filterToggleCopy}><Text style={styles.cardTitle}>جست‌وجوی حمل‌ونقل</Text><Text style={styles.filterSummary}>{transportResults.length ? `${transportResults.length.toLocaleString("fa-IR")} مسیر` : "جست‌وجوی مسیرهای منطقه 4D"}</Text></View>
          <Ionicons name={transportOpen ? "chevron-up" : "car-outline"} size={20} color="#087f79" />
        </Pressable>
        {transportOpen ? <View style={styles.transportPanel}>
          <View style={styles.transportHeading}>
            <View>
              <Text style={styles.cardTitle}>جست‌وجوی حمل‌ونقل</Text>
              <Text style={styles.subtitle}>مسیرهای فعال منطقه 4D را پیدا کنید.</Text>
            </View>
            <Ionicons name="car-outline" size={25} color="#087f79" />
          </View>
          <TextInput value={transportQuery} onChangeText={setTransportQuery} style={styles.input} placeholder="مثلاً سرویس صبحگاهی" textAlign="right" accessibilityLabel="عبارت جست‌وجوی حمل‌ونقل" />
          <Text style={styles.fieldLabel}>نوع مسیر</Text>
          <View style={styles.transportModes}>
            {([["all", "همه"], ["offer", "پیشنهاد سفر"], ["request", "درخواست سفر"]] as const).map(([value, label]) => (
              <Pressable key={value} style={[styles.choiceChip, transportMode === value && styles.choiceChipActive]} onPress={() => setTransportMode(value)} accessibilityRole="radio" accessibilityState={{ selected: transportMode === value }}>
                <Text style={[styles.choiceText, transportMode === value && styles.choiceTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldLabel}>مبدأ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{cities.map((city) => <Pressable key={`origin-${city.id}`} style={[styles.choiceChip, transportOriginId === city.id && styles.choiceChipActive]} onPress={() => setTransportOriginId(transportOriginId === city.id ? "" : city.id)}><Text style={[styles.choiceText, transportOriginId === city.id && styles.choiceTextActive]}>{city.name_fa}</Text></Pressable>)}</ScrollView>
          <Text style={styles.fieldLabel}>مقصد</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{cities.map((city) => <Pressable key={`destination-${city.id}`} style={[styles.choiceChip, transportDestinationId === city.id && styles.choiceChipActive]} onPress={() => setTransportDestinationId(transportDestinationId === city.id ? "" : city.id)}><Text style={[styles.choiceText, transportDestinationId === city.id && styles.choiceTextActive]}>{city.name_fa}</Text></Pressable>)}</ScrollView>
          <Pressable style={[styles.primary, transportBusy && styles.primaryDisabled]} disabled={transportBusy} onPress={() => void searchTransport()}><Ionicons name="search-outline" size={18} color="#ffffff" /><Text style={styles.primaryText}>{transportBusy ? "در حال جست‌وجو" : "جست‌وجوی مسیر"}</Text></Pressable>
          {transportNotice ? <Text style={styles.notice}>{transportNotice}</Text> : null}
          {transportResults.map((result) => <Pressable key={result.id} style={styles.transportResult} onPress={() => onTransportOpen(result)} accessibilityRole="button" accessibilityLabel={`جزئیات مسیر ${result.title}`}><View style={styles.transportResultTop}><Text style={styles.cardTitle} numberOfLines={2}>{result.title}</Text><Text style={styles.transportModeBadge}>{result.mode === "offer" ? "پیشنهاد" : "درخواست"}</Text></View><Text style={styles.subtitle}>{result.origin_label} ← {result.destination_label}</Text><Text style={styles.transportResultMeta}>{result.departure_date} · {result.time_from}{result.time_to ? ` تا ${result.time_to}` : ""}{result.vehicle_type ? ` · ${result.vehicle_type}` : ""}</Text></Pressable>)}
        </View> : null}
        <FlatList
          data={visibleItems}
          numColumns={1}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load();
          }}
          contentContainerStyle={styles.marketList}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`مشاهده آگهی ${item.title}`}
              style={({ pressed }) => [
                styles.marketCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => onOpen(item)}
            >
              {item.image_data_url ? (
                <Image
                  source={{ uri: mediaUrl(item.image_data_url) }}
                  style={styles.marketThumb}
                />
              ) : (
                <View style={[styles.marketThumb, styles.marketPlaceholder]}>
                  <Ionicons name="image-outline" size={28} color="#08746d" />
                  <Text style={styles.marketPlaceholderText}>4D</Text>
                </View>
              )}
              <View style={styles.marketCardBody}>
                <Text style={styles.marketCardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.seller_trust?.identity_verified ? <View style={styles.identityBadge}><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}
                <Text style={styles.marketCardMeta} numberOfLines={1}>
                  {cityName(item.city_id)} · {categoryName(item.category_id)}
                </Text>
                <View style={styles.marketCardFooter}>
                  <Text style={styles.marketPrice} numberOfLines={1}>{price(item)}</Text>
                  <Pressable
                    hitSlop={8}
                    disabled={favoriteBusyId === item.id}
                    accessibilityRole="button"
                    accessibilityLabel={favoriteIds.includes(item.id) ? "حذف از ذخیره‌ها" : "ذخیره آگهی"}
                    onPress={(event) => { event.stopPropagation(); void toggleFavorite(item); }}
                    onPressIn={(event) => event.stopPropagation()}
                  >
                    {favoriteBusyId === item.id ? <ActivityIndicator size="small" color="#087f79" /> : <Ionicons name={favoriteIds.includes(item.id) ? "heart" : "heart-outline"} size={19} color={favoriteIds.includes(item.id) ? "#d46b5e" : "#8a9891"} />}
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color="#087f79" />
                <Text style={styles.subtitle}>
                  در حال دریافت آگهی‌های نزدیک...
                </Text>
              </View>
            ) : message ? (
              <View style={styles.empty}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={38}
                  color="#8a5d13"
                />
                <Text style={styles.emptyTitle}>بازار در دسترس نیست</Text>
                <Text style={styles.subtitle}>{message}</Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => void load()}
                >
                  <Ionicons name="refresh" size={18} color="#ffffff" />
                  <Text style={styles.retryText}>تلاش دوباره</Text>
                </Pressable>
              </View>
            ) : query || categoryId !== "all" ? (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={38} color="#087f79" />
                <Text style={styles.emptyTitle}>نتیجه‌ای پیدا نشد</Text>
                <Text style={styles.subtitle}>عبارت دیگری بنویسید یا دسته را تغییر دهید.</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="storefront-outline" size={38} color="#087f79" />
                <Text style={styles.emptyTitle}>هنوز آگهی‌ای نیست</Text>
                <Text style={styles.subtitle}>
                  آگهی‌های تازه اینجا نمایش داده می‌شوند.
                </Text>
              </View>
            )
          }
        />
      </ScrollView>
    </View>
  );
}

function TransportDetailScreen({
  item,
  token,
  onBack,
  onConversationReady,
}: {
  item: TransportResult;
  token: string;
  onBack: () => void;
  onConversationReady: (conversationId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const contact = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const result = await api<{ data: { conversation?: { id: string } } }>("/api/v1/contact-intents", { method: "POST", body: JSON.stringify({ content_id: item.id }) }, token);
      const id = result.data.conversation?.id;
      if (id) onConversationReady(id);
      else setNotice("گفتگو ساخته شد؛ آن را در بخش گفتگوها باز کنید.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "شروع گفتگو انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.detail}>
      <Pressable style={styles.backAction} onPress={onBack} accessibilityRole="button" accessibilityLabel="بازگشت به بازار"><Ionicons name="arrow-forward" size={19} color="#176b70" /><Text style={styles.back}>بازگشت به بازار</Text></Pressable>
      <View style={styles.transportDetailCard}>
        <View style={styles.transportResultTop}><Text style={styles.title}>{item.title}</Text><Text style={styles.transportModeBadge}>{item.mode === "offer" ? "پیشنهاد سفر" : "درخواست سفر"}</Text></View>
        <Text style={styles.transportRoute}>{item.origin_label} ← {item.destination_label}</Text>
        <Text style={styles.transportDetailMeta}>تاریخ حرکت: {item.departure_date}</Text>
        <Text style={styles.transportDetailMeta}>ساعت: {item.time_from}{item.time_to ? ` تا ${item.time_to}` : ""}</Text>
        {item.vehicle_type ? <Text style={styles.transportDetailMeta}>وسیله نقلیه: {item.vehicle_type}</Text> : null}
        <Text style={styles.description}>{item.description}</Text>
        <Pressable style={[styles.primary, busy && styles.primaryDisabled]} disabled={busy} onPress={() => void contact()}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#ffffff" /><Text style={styles.primaryText}>{busy ? "در حال شروع گفتگو" : "شروع گفتگو"}</Text></Pressable>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      </View>
    </ScrollView>
  );
}

function DetailScreen({
  item: initialItem,
  token,
  onBack,
  onConversationReady,
  onStorefrontOpen,
}: {
  item: Item;
  token: string;
  onBack: () => void;
  onConversationReady: (conversationId: string) => void;
  onStorefrontOpen: (slug: string) => void;
}) {
  const [item, setItem] = useState(initialItem);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seller, setSeller] = useState<{ business_name?: string; business_type?: string; service_area?: string; opening_hours?: string } | null>(null);
  useEffect(() => {
    void api<{ data: Item }>(`/api/v1/contents/${item.id}`, {}, token)
      .then((result) => setItem(result.data))
      .catch(() => undefined);
  }, [item.id, token]);
  useEffect(() => {
    void Promise.all([
      api<{ data: City[] }>("/api/v1/regions/4d/cities"),
      api<{ data: Category[] }>("/api/v1/categories"),
      api<{ data: string[] }>("/api/v1/me/favorites", {}, token),
    ]).then(([cityResult, categoryResult, favoriteResult]) => {
      setCities(cityResult.data);
      setCategories(categoryResult.data);
      setFavorite(favoriteResult.data.includes(item.id));
    }).catch(() => undefined);
    if (item.owner_user_id) {
      void api<{ data: typeof seller }>(`/api/v1/business-profiles/${item.owner_user_id}`).then((result) => setSeller(result.data)).catch(() => undefined);
    }
  }, [item.id, token]);
  const media = item.media?.length ? item.media : item.image_data_url ? [{ url: item.image_data_url }] : [];
  const cityName = cities.find((city) => city.id === item.city_id)?.name_fa ?? "منطقه 4D";
  const categoryName = categories.find((category) => category.id === item.category_id)?.name_fa ?? "آگهی محلی";
  const attributes = Object.entries(item.metadata_json ?? {}).filter(([, value]) => value !== null && value !== "");
  const toggleFavorite = async () => {
    setBusy(true);
    try {
      await api(`/api/v1/contents/${item.id}/favorite`, { method: favorite ? "DELETE" : "POST", ...(favorite ? {} : { body: "{}" }) }, token);
      setFavorite((value) => !value);
      setNotice(favorite ? "از ذخیره‌ها حذف شد." : "آگهی ذخیره شد.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ذخیره آگهی انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    await Share.share({ message: `آگهی «${item.title}» در بازار 4D\nhttps://4dbazar.ir/listing/${item.id}` });
  };
  const report = async () => {
    try {
      await api("/api/v1/reports", { method: "POST", body: JSON.stringify({ target_type: "content", target_id: item.id, reason: "other" }) }, token);
      setNotice("گزارش شما ثبت شد.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "گزارش آگهی ثبت نشد.");
    }
  };
  const contact = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const result = await api<{
        data: { conversation?: { id: string }; content_id?: string };
      }>(
        "/api/v1/contact-intents",
        { method: "POST", body: JSON.stringify({ content_id: item.id }) },
        token,
      );
      let id = result.data.conversation?.id;
      if (!id) {
        const conversations = await api<{ data: Conversation[] }>("/api/v1/me/conversations", {}, token);
        id = conversations.data.find((conversation) => conversation.content_id === item.id)?.id;
      }
      if (id) onConversationReady(id);
      else setNotice("گفتگو ساخته شد؛ آن را در بخش گفتگوها باز کنید.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "شروع گفتگو انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.detail}>
      <Pressable style={styles.backAction} onPress={onBack} accessibilityRole="button" accessibilityLabel="بازگشت به بازار">
        <Ionicons name="arrow-forward" size={19} color="#176b70" />
        <Text style={styles.back}>بازگشت</Text>
      </Pressable>
      {media.length ? (
        <Image
          source={{ uri: mediaUrl(media[mediaIndex]?.url) }}
          style={styles.hero}
          accessible
          accessibilityLabel={`تصویر آگهی ${item.title}`}
        />
      ) : (
        <View style={[styles.hero, styles.detailPlaceholder]}>
          <Ionicons name="image-outline" size={42} color="#087f79" />
          <Text style={styles.subtitle}>تصویری برای این آگهی ثبت نشده</Text>
        </View>
      )}
      {media.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailMediaRow}>
          {media.map((asset, index) => (
            <Pressable key={`${asset.url}-${index}`} onPress={() => setMediaIndex(index)} style={[styles.detailMediaThumb, mediaIndex === index && styles.detailMediaThumbActive]}>
              <Image source={{ uri: mediaUrl(asset.url) }} style={styles.detailMediaImage} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.detailMetaRow}>
        <Text style={styles.detailFactText}>{categoryName}</Text>
        <Text style={styles.detailFactText}>{cityName}</Text>
        <Text style={styles.detailFactText}>👁 {(item.view_count ?? 0).toLocaleString("fa-IR")} بازدید</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.priceLarge}>{price(item)}</Text>
      <View style={styles.detailFacts}>
        <View style={styles.detailFact}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#176b42" />
          <Text style={styles.detailFactText}>گفتگوی امن داخل 4D</Text>
        </View>
        <View style={styles.detailFact}>
          <Ionicons name="location-outline" size={16} color="#176b70" />
          <Text style={styles.detailFactText}>تحویل محلی در منطقه 4D</Text>
        </View>
      </View>
      {attributes.length ? <View style={styles.detailAttributes}>{attributes.map(([key, value]) => <View key={key} style={styles.detailAttribute}><Text style={styles.detailAttributeKey}>{attributeLabel(key)}</Text><Text style={styles.detailAttributeValue}>{attributeValue(key, value)}</Text></View>)}</View> : null}
      <Text style={styles.detailText}>{item.description}</Text>
      {!seller && item.seller_trust?.identity_verified ? <View style={styles.identityBadge} accessibilityLabel="هویت این کاربر توسط 4D تأیید شده است."><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}
      {seller ? <View style={styles.sellerCard}><Ionicons name="person-circle-outline" size={28} color="#176b70" /><View style={styles.sellerCopy}><Text style={styles.sellerName}>{seller.business_name ?? "فروشنده آگهی"}</Text><Text style={styles.sellerMeta}>{[seller.business_type, seller.service_area].filter(Boolean).join(" · ") || "اطلاعات عمومی فروشنده"}</Text>{seller.opening_hours ? <Text style={styles.sellerMeta}>{seller.opening_hours}</Text> : null}{item.seller_trust?.identity_verified ? <View style={styles.identityBadge}><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}</View><Ionicons name="shield-checkmark-outline" size={18} color="#217a45" /></View> : null}
      {item.storefront_slug ? <Pressable style={styles.storefrontLink} onPress={() => onStorefrontOpen(item.storefront_slug!)}><Ionicons name="storefront-outline" size={20} color="#176b70" /><Text style={styles.storefrontLinkText}>مشاهده غرفه {item.storefront_name ?? "فروشنده"}</Text><Ionicons name="chevron-back" size={18} color="#176b70" /></Pressable> : null}
      <View style={styles.detailActions}>
        <Pressable style={[styles.secondaryAction, favorite && styles.secondaryActionActive]} onPress={() => void toggleFavorite()} disabled={busy}><Ionicons name={favorite ? "heart" : "heart-outline"} size={19} color={favorite ? "#d46b5e" : "#176b70"} /><Text style={styles.secondaryActionText}>{favorite ? "ذخیره شد" : "ذخیره"}</Text></Pressable>
        <Pressable style={styles.secondaryAction} onPress={() => void share()}><Ionicons name="share-social-outline" size={19} color="#176b70" /><Text style={styles.secondaryActionText}>اشتراک‌گذاری</Text></Pressable>
        <Pressable style={styles.secondaryAction} onPress={() => void report()}><Ionicons name="flag-outline" size={19} color="#8a5d13" /><Text style={styles.secondaryActionText}>گزارش</Text></Pressable>
      </View>
      {item.related?.length ? <View style={styles.relatedBlock}><Text style={styles.relatedTitle}>شاید این‌ها هم به کارت بیاد</Text>{item.related.map((related) => <Pressable key={related.id} style={styles.relatedItem} onPress={() => setItem(related)}><Text style={styles.relatedItemTitle}>{related.title}</Text><Text style={styles.relatedItemPrice}>{price(related)}</Text></Pressable>)}</View> : null}
      <Pressable
        style={[styles.primary, busy && styles.primaryDisabled]}
        disabled={busy}
        onPress={() => void contact()}
        accessibilityRole="button"
        accessibilityLabel="شروع گفتگو"
        accessibilityState={{ disabled: busy }}
      >
        {busy ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="chatbubble-ellipses-outline" size={19} color="#ffffff" />}
        <Text style={styles.primaryText}>{busy ? "در حال ساخت گفتگو" : "شروع گفتگو"}</Text>
      </Pressable>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </ScrollView>
  );
}

function StorefrontScreen({ slug, onBack, onListingOpen }: { slug: string; onBack: () => void; onListingOpen: (item: Item) => void }) {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [listings, setListings] = useState<Item[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    void api<{ data: { storefront: Storefront; listings: Item[] } }>(`/api/v1/storefronts/by-slug/${encodeURIComponent(slug)}`)
      .then((result) => { setStorefront(result.data.storefront); setListings(result.data.listings); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "غرفه بارگذاری نشد."));
  }, [slug]);
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.detail}>
      <Pressable style={styles.backAction} onPress={onBack} accessibilityRole="button" accessibilityLabel="بازگشت به آگهی"><Ionicons name="arrow-forward" size={19} color="#176b70" /><Text style={styles.back}>بازگشت به آگهی</Text></Pressable>
      {message ? <View style={styles.empty}><Text style={styles.emptyTitle}>غرفه در دسترس نیست</Text><Text style={styles.subtitle}>{message}</Text></View> : storefront ? <>
        <View style={styles.storefrontHero}><Ionicons name="storefront" size={34} color="#ffffff" /><Text style={styles.storefrontName}>{storefront.name}</Text><Text style={styles.storefrontDescription}>{storefront.short_description}</Text></View>
        <View style={styles.sellerCard}><Ionicons name="briefcase-outline" size={23} color="#176b70" /><View style={styles.sellerCopy}><Text style={styles.sellerName}>{storefront.business_type}</Text><Text style={styles.sellerMeta}>{storefront.address ?? "فعالیت محلی در منطقه 4D"}</Text>{storefront.phone ? <Text style={styles.sellerMeta}>{storefront.phone}</Text> : null}{storefront.owner_trust?.identity_verified ? <View style={styles.identityBadge}><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت مالک تأیید شده</Text></View> : null}</View></View>
        <Text style={styles.detailText}>{storefront.description}</Text>
        <Text style={styles.relatedTitle}>آگهی‌های این غرفه</Text>
        {listings.length ? listings.map((listing) => <Pressable key={listing.id} style={styles.relatedItem} onPress={() => onListingOpen(listing)} accessibilityRole="button" accessibilityLabel={`مشاهده جزئیات ${listing.title}`}><Text style={styles.relatedItemTitle}>{listing.title}</Text><Text style={styles.relatedItemPrice}>{price(listing)}</Text><Text style={styles.sellerMeta}>{(listing.view_count ?? 0).toLocaleString("fa-IR")} بازدید · مشاهده جزئیات</Text></Pressable>) : <Text style={styles.subtitle}>آگهی دیگری در این غرفه وجود ندارد.</Text>}
      </> : <View style={styles.empty}><ActivityIndicator color="#087f79" /><Text style={styles.subtitle}>در حال بارگذاری غرفه...</Text></View>}
    </ScrollView>
  );
}

function AuthScreenV2({ onSuccess }: { onSuccess: (token: string, refreshToken?: string) => void }) {
  const [mode, setMode] = useState<"sms" | "password">("sms");
  const [phone, setPhone] = useState("+98");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [challenge, setChallenge] = useState<{
    challenge_id: string;
    target: number;
    y: number;
  } | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [captchaBusy, setCaptchaBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lastAutoSubmittedCode = useRef("");
  const captchaRequestVersion = useRef(0);
  const modeRef = useRef(mode);
  const loadChallenge = async () => {
    const requestVersion = ++captchaRequestVersion.current;
    try {
      const result = await api<{
        data: { challenge_id: string; target: number; y: number };
      }>("/api/v1/auth/captcha-challenge");
      setChallenge(result.data);
      setProof(null);
      setMessage("");
    } catch (error) {
      if (requestVersion === captchaRequestVersion.current && modeRef.current === "sms") {
        setMessage("پازل امنیتی بارگذاری نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.");
      }
    }
  };
  useEffect(() => {
    modeRef.current = mode;
    if (mode === "sms") {
      void loadChallenge();
    } else {
      captchaRequestVersion.current += 1;
      setMessage("");
      setProof(null);
    }
  }, [mode]);
  const solveCaptcha = async (value: number) => {
    if (!challenge || captchaBusy || proof) return;
    setCaptchaBusy(true);
    try {
      const result = await api<{ data: { captcha_proof: string } }>(
        "/api/v1/auth/captcha-proof",
        {
          method: "POST",
          body: JSON.stringify({
            challenge_id: challenge.challenge_id,
            value,
          }),
        },
      );
      setProof(result.data.captcha_proof);
      setMessage("پازل تایید شد.");
    } catch {
      setMessage("پازل منقضی شد؛ دوباره تلاش کنید.");
      void loadChallenge();
    } finally {
      setCaptchaBusy(false);
    }
  };
  const submit = async () => {
    setMessage("");
    if (!phone.trim()) {
      setMessage("شماره موبایل را وارد کنید.");
      return;
    }
    if (mode === "password" && !password) {
      setMessage("رمز عبور را وارد کنید.");
      return;
    }
    if (mode === "sms" && step === "phone" && !proof) {
      setMessage("ابتدا پازل امنیتی را حل کنید.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "password") {
        const result = await api<{ data: { token: string; refresh_token?: string } }>(
          "/api/v1/auth/password-login",
          {
            method: "POST",
            body: JSON.stringify({ phone_number: phone, password }),
          },
        );
        onSuccess(result.data.token, result.data.refresh_token);
      } else if (step === "phone") {
        await api("/api/v1/auth/request-otp", {
          method: "POST",
          body: JSON.stringify({ phone_number: phone, captcha_proof: proof }),
        });
        lastAutoSubmittedCode.current = "";
        setCode("");
        setStep("code");
        setMessage("کد ارسال شد.");
      } else {
        const result = await api<{ data: { token: string; refresh_token?: string } }>(
          "/api/v1/auth/verify-otp",
          {
            method: "POST",
            body: JSON.stringify({ phone_number: phone, otp: normalizeOtpDigits(code) }),
          },
        );
        onSuccess(result.data.token, result.data.refresh_token);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `ورود انجام نشد: ${error.message}`
          : "ورود انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (
      mode !== "sms" ||
      step !== "code" ||
      code.length !== 6 ||
      busy ||
      lastAutoSubmittedCode.current === code
    ) {
      return;
    }

    lastAutoSubmittedCode.current = code;
    void submit();
  }, [busy, code, mode, step]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.auth}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authBrand}>
          <BrandLogo />
          <Text style={styles.title}>ورود به بازار محلی</Text>
          <Text style={styles.subtitle}>با پیامک یا رمز عبور وارد شوید.</Text>
        </View>
        <View style={styles.authCard}>
          <View style={styles.authModes}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "sms" }}
              style={[styles.authMode, mode === "sms" && styles.authModeActive]}
              onPress={() => {
                setMode("sms");
                setStep("phone");
              }}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={18}
                color={mode === "sms" ? "#ffffff" : "#52606d"}
              />
              <Text
                style={[
                  styles.authModeText,
                  mode === "sms" && styles.authModeTextActive,
                ]}
              >
                ورود با پیامک
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "password" }}
              style={[
                styles.authMode,
                mode === "password" && styles.authModeActive,
              ]}
              onPress={() => { modeRef.current = "password"; captchaRequestVersion.current += 1; setMode("password"); }}
            >
              <Ionicons
                name="key-outline"
                size={18}
                color={mode === "password" ? "#ffffff" : "#52606d"}
              />
              <Text
                style={[
                  styles.authModeText,
                  mode === "password" && styles.authModeTextActive,
                ]}
              >
                ورود با رمز
              </Text>
            </Pressable>
          </View>
          <Text style={styles.fieldLabel}>شماره موبایل</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            accessibilityLabel="شماره موبایل"
            keyboardType="phone-pad"
            placeholder="+989..."
            textAlign="left"
          />
          {mode === "password" ? (
            <>
              <Text style={styles.fieldLabel}>رمز عبور</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="رمز عبور"
                secureTextEntry
                placeholder="رمز عبور"
                textAlign="right"
              />
            </>
          ) : (
            <>
              {step === "phone" ? (
                <PuzzleCaptcha
                  challenge={challenge}
                  busy={captchaBusy}
                  verified={Boolean(proof)}
                  onRefresh={() => void loadChallenge()}
                  onVerify={(value) => void solveCaptcha(value)}
                />
              ) : (
                <>
                  <Text style={styles.fieldLabel}>کد پیامک‌شده</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    value={code}
                    onChangeText={(value) =>
                      setCode(normalizeOtpDigits(value).slice(0, 6))
                    }
                    accessibilityLabel="کد پیامک‌شده"
                    keyboardType="number-pad"
                    autoComplete={
                      Platform.OS === "android" ? "sms-otp" : "one-time-code"
                    }
                    textContentType="oneTimeCode"
                    importantForAutofill="yes"
                    placeholder="ــــــ"
                    maxLength={6}
                    textAlign="center"
                  />
                  <Text style={styles.otpHint}>
                    پیشنهاد کد سیستم‌عامل را انتخاب کنید؛ با کامل شدن ۶ رقم،
                    ورود خودکار بررسی می‌شود.
                  </Text>
                  <Pressable
                    style={styles.textAction}
                    onPress={() => {
                      setStep("phone");
                      setCode("");
                      lastAutoSubmittedCode.current = "";
                      void loadChallenge();
                    }}
                  >
                    <Text style={styles.textActionLabel}>ارسال دوباره کد</Text>
                  </Pressable>
                </>
              )}
            </>
          )}
          <Pressable
            style={[
              styles.primary,
              busy && styles.primaryDisabled,
            ]}
            disabled={busy}
            onPress={() => void submit()}
          >
            <Text style={styles.primaryText}>
              {busy
                ? "در حال بررسی"
                : mode === "password"
                  ? "ورود با رمز"
                  : step === "phone"
                    ? "ارسال کد"
                    : "تایید و ورود"}
            </Text>
          </Pressable>
          {message ? (
            <View style={styles.authNotice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#8a5d13"
              />
              <Text style={[styles.notice, styles.authNoticeText]}>
                {message}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CreateScreen({ token, onBack }: { token: string; onBack: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityId, setCityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contentType, setContentType] = useState<"listing" | "service_listing" | "transport">("listing");
  const [citySearch, setCitySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [serviceArea, setServiceArea] = useState("");
  const [availability, setAvailability] = useState("");
  const [pricingModel, setPricingModel] = useState<"quote" | "fixed" | "starting_at" | "hourly" | "daily">("quote");
  const [priceType, setPriceType] = useState<"negotiable" | "fixed">(
    "negotiable",
  );
  const [priceAmount, setPriceAmount] = useState("");
  const [itemCondition, setItemCondition] = useState<"new" | "used" | "like_new">("used");
  const [transportMode, setTransportMode] = useState<"offer" | "request">("offer");
  const [originLabel, setOriginLabel] = useState("");
  const [destinationLabel, setDestinationLabel] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    void Promise.all([
      api<{ data: City[] }>("/api/v1/regions/4d/cities"),
      api<{ data: Category[] }>("/api/v1/categories"),
    ])
      .then(([cityResult, categoryResult]) => {
        setCities(cityResult.data);
        setCategories(categoryResult.data);
        setCityId((current) => current || cityResult.data[0]?.id || "");
        setCategoryId((current) => current || categoryResult.data[0]?.id || "");
      })
      .catch(() =>
        setMessage(
          "شهرها و دسته‌بندی‌ها بارگذاری نشدند. دوباره وارد این بخش شوید.",
        ),
      );
  }, []);
  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("اجازه دسترسی به تصاویر لازم است.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      const selected = result.assets.filter((asset) => asset.base64).slice(0, 6).map((asset) => `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`);
      setImages(selected);
      setImage(selected[0] ?? null);
    }
  };
  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setMessage("اجازه دسترسی به ویدیو لازم است."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], base64: true, videoMaxDuration: 30 });
    if (!result.canceled && result.assets[0]?.base64) setVideo(`data:${result.assets[0].mimeType ?? "video/mp4"};base64,${result.assets[0].base64}`);
  };
  const submit = async () => {
    setBusy(true);
    try {
      if (contentType === "transport") {
        if (!title.trim() || !description.trim() || !cityId || !categoryId || !originLabel.trim() || !destinationLabel.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeFrom)) {
          throw new Error("اطلاعات سفر کامل نیست؛ تاریخ را به شکل ۱۴۰۵-۰۱-۰۱ و ساعت را به شکل ۰۹:۰۰ وارد کنید.");
        }
        await api("/api/v1/transport/trips", { method: "POST", body: JSON.stringify({ mode: transportMode, title: title.trim(), description: description.trim(), city_id: cityId, category_id: categoryId, origin_label: originLabel.trim(), destination_label: destinationLabel.trim(), departure_date: departureDate, time_from: timeFrom, ...(timeTo ? { time_to: timeTo } : {}), ...(vehicleType.trim() ? { vehicle_type: vehicleType.trim() } : {}), ...(seatsAvailable ? { seats_available: Number(seatsAvailable) } : {}), price_type: priceType, ...(priceType === "fixed" && priceAmount ? { price_amount: Number(priceAmount.replace(/,/g, "")) } : {}) }) }, token);
        setTitle(""); setDescription(""); setOriginLabel(""); setDestinationLabel(""); setDepartureDate(""); setTimeFrom(""); setTimeTo(""); setVehicleType(""); setSeatsAvailable("");
        setMessage("مسیر برای بررسی ارسال شد.");
        return;
      }
      const assets: Array<{ url: string; asset_id: string }> = [];
      for (const dataUrl of [...images, ...(video ? [video] : [])]) {
        const upload = await api<{ data: { url: string; asset_id: string } }>("/api/v1/media/listing-images", { method: "POST", body: JSON.stringify({ media_data_url: dataUrl }) }, token);
        assets.push(upload.data);
      }
      await api(
        "/api/v1/listings",
        {
          method: "POST",
          body: JSON.stringify({
            content_type: contentType,
            title,
            description,
            city_id: cityId,
            category_id: categoryId,
            price_type: listingFieldPolicy(categories.find((category) => category.id === categoryId), contentType).showPrice ? priceType : "negotiable",
            ...(listingFieldPolicy(categories.find((category) => category.id === categoryId), contentType).showItemCondition ? { item_condition: itemCondition } : {}),
            ...(priceType === "fixed" && priceAmount
              ? { price_amount: Number(priceAmount.replace(/,/g, "")) }
              : {}),
            ...(assets[0] ? { image_url: assets[0].url } : {}),
            ...(assets.length ? { media_asset_ids: assets.map((asset) => asset.asset_id) } : {}),
            ...(contentType === "service_listing" ? { service_details: { service_area: serviceArea, pricing_model: pricingModel, availability } } : {}),
            metadata,
          }),
        },
        token,
      );
      setTitle("");
      setDescription("");
      setImage(null);
      setImages([]);
      setVideo(null);
      setPriceAmount("");
      setPriceType("negotiable");
      setContentType("listing");
      setServiceArea("");
      setAvailability("");
      setMessage("آگهی برای بررسی ارسال شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت آگهی انجام نشد. پروفایل را کامل کنید.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={styles.safe} contentContainerStyle={[styles.form, styles.flowForm]}>
      <View style={styles.flowHeader}>
        <Pressable onPress={() => {
          if (title.trim() || description.trim()) {
            Alert.alert("آگهی هنوز کامل نشده است", "از فرم خارج می‌شوید؟ اطلاعات فعلی ذخیره نمی‌شود.", [
              { text: "ادامه", style: "cancel" },
              { text: "خروج", style: "destructive", onPress: onBack },
            ]);
          } else onBack();
        }} accessibilityRole="button" accessibilityLabel="بازگشت از ثبت آگهی">
          <Ionicons name="arrow-forward" size={22} color="#176b70" />
        </Pressable>
        <View style={styles.flowHeaderCopy}>
          <Text style={styles.cardTitle}>ثبت آگهی</Text>
          <Text style={styles.subtitle}>فرم ثبت آگهی</Text>
        </View>
        <Text style={styles.flowStep}>مرحله ۱ از ۱</Text>
      </View>
      <View style={styles.pageHeading}>
        <View style={styles.pageHeadingIcon}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </View>
        <View style={styles.pageHeadingCopy}>
          <Text style={styles.title}>ثبت آگهی</Text>
          <Text style={styles.subtitle}>
            اطلاعات دقیق‌تر، اعتماد و پاسخ بیشتری می‌سازد.
          </Text>
        </View>
      </View>
      <Text style={styles.fieldLabel}>عنوان آگهی</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="مثلاً کولر آبی سالم"
        maxLength={90}
        textAlign="right"
      />
      <Text style={styles.fieldLabel}>توضیحات</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="وضعیت، ابعاد، محل تحویل و جزئیات مهم را بنویسید"
        multiline
        maxLength={2500}
        textAlign="right"
      />
      <View style={styles.priceModes}>
        <Pressable style={[styles.priceMode, contentType === "listing" && styles.priceModeActive]} onPress={() => setContentType("listing")}><Text style={contentType === "listing" ? styles.priceModeTextActive : styles.priceModeText}>آگهی کالا</Text></Pressable>
        <Pressable style={[styles.priceMode, contentType === "service_listing" && styles.priceModeActive]} onPress={() => setContentType("service_listing")}><Text style={contentType === "service_listing" ? styles.priceModeTextActive : styles.priceModeText}>ثبت خدمت</Text></Pressable>
        <Pressable style={[styles.priceMode, contentType === "transport" && styles.priceModeActive]} onPress={() => { setContentType("transport"); setCategoryId(categories.find((category) => Array.isArray(category.content_types) && category.content_types.map(String).includes("transport_offer"))?.id ?? categoryId); }}><Text style={contentType === "transport" ? styles.priceModeTextActive : styles.priceModeText}>حمل‌ونقل</Text></Pressable>
      </View>
      <MobileSelect
        label="شهر"
        value={cityId}
        placeholder="انتخاب شهر"
        searchable
        options={cities.map((city) => ({ value: city.id, label: city.name_fa }))}
        onChange={setCityId}
      />
      <MobileSelect
        label="دسته‌بندی"
        value={categoryId}
        placeholder="انتخاب دسته‌بندی"
        searchable
        options={categories
          .filter((category) => contentType === "listing" || (Array.isArray(category.content_types) && category.content_types.map(String).includes(contentType === "transport" ? "transport_offer" : "service_listing")))
          .map((category) => ({ value: category.id, label: category.name_fa }))}
        onChange={(value) => { setCategoryId(value); const allowed = new Set(categories.find((category) => category.id === value)?.metadata_schema?.map((field) => field.key) ?? []); setMetadata((current) => Object.fromEntries(Object.entries(current).filter(([key]) => allowed.has(key)))); }}
      />
      {contentType !== "transport" && (categories.find((category) => category.id === categoryId)?.metadata_schema ?? []).length ? <View style={styles.dynamicFieldsCard}>
        <Text style={styles.cardTitle}>ویژگی‌های اختصاصی {categories.find((category) => category.id === categoryId)?.name_fa}</Text>
        <Text style={styles.subtitle}>این اطلاعات برای نمایش و جست‌وجوی دقیق‌تر استفاده می‌شود.</Text>
        {(categories.find((category) => category.id === categoryId)?.metadata_schema ?? []).map((field) => field.type === "select" ? <View key={field.key}><Text style={styles.fieldLabel}>{field.label_fa}{field.required ? " *" : ""}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{(field.options ?? []).map((option) => <Pressable key={option.value} style={[styles.choiceChip, metadata[field.key] === option.value && styles.choiceChipActive]} onPress={() => setMetadata((current) => ({ ...current, [field.key]: option.value }))}><Text style={[styles.choiceText, metadata[field.key] === option.value && styles.choiceTextActive]}>{option.label_fa}</Text></Pressable>)}</ScrollView></View> : <View key={field.key}><Text style={styles.fieldLabel}>{field.label_fa}{field.required ? " *" : ""}</Text><TextInput style={styles.input} value={metadata[field.key] ?? ""} onChangeText={(value) => setMetadata((current) => ({ ...current, [field.key]: value }))} placeholder={field.placeholder} keyboardType={field.type === "number" ? "numeric" : "default"} textAlign="right" /></View>)}
      </View> : null}
      {contentType === "service_listing" ? <>
        <Text style={styles.fieldLabel}>حوزه خدمت</Text>
        <TextInput style={styles.input} value={serviceArea} onChangeText={setServiceArea} placeholder="مثلاً تعمیرات و نصب" textAlign="right" />
        <Text style={styles.fieldLabel}>زمان ارائه خدمت</Text>
        <TextInput style={styles.input} value={availability} onChangeText={setAvailability} placeholder="مثلاً هر روز ۹ تا ۱۸" textAlign="right" />
      </> : null}
      {contentType === "transport" ? <>
        <Text style={styles.fieldLabel}>نوع سفر</Text>
        <View style={styles.priceModes}><Pressable style={[styles.priceMode, transportMode === "offer" && styles.priceModeActive]} onPress={() => setTransportMode("offer")}><Text style={transportMode === "offer" ? styles.priceModeTextActive : styles.priceModeText}>پیشنهاد سفر</Text></Pressable><Pressable style={[styles.priceMode, transportMode === "request" && styles.priceModeActive]} onPress={() => setTransportMode("request")}><Text style={transportMode === "request" ? styles.priceModeTextActive : styles.priceModeText}>درخواست سفر</Text></Pressable></View>
        <Text style={styles.fieldLabel}>مبدأ</Text><TextInput style={styles.input} value={originLabel} onChangeText={setOriginLabel} placeholder="مثلاً گرمه" textAlign="right" />
        <Text style={styles.fieldLabel}>مقصد</Text><TextInput style={styles.input} value={destinationLabel} onChangeText={setDestinationLabel} placeholder="مثلاً جاجرم" textAlign="right" />
        <Text style={styles.fieldLabel}>تاریخ حرکت</Text><TextInput style={styles.input} value={departureDate} onChangeText={setDepartureDate} placeholder="۱۴۰۵-۰۱-۰۱" keyboardType="numbers-and-punctuation" textAlign="left" />
        <Text style={styles.fieldLabel}>ساعت حرکت</Text><TextInput style={styles.input} value={timeFrom} onChangeText={setTimeFrom} placeholder="۰۹:۰۰" keyboardType="numbers-and-punctuation" textAlign="left" />
        <Text style={styles.fieldLabel}>ساعت پایان (اختیاری)</Text><TextInput style={styles.input} value={timeTo} onChangeText={setTimeTo} placeholder="۱۷:۰۰" keyboardType="numbers-and-punctuation" textAlign="left" />
        <Text style={styles.fieldLabel}>وسیله نقلیه (اختیاری)</Text><TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="مثلاً سواری" textAlign="right" />
        <Text style={styles.fieldLabel}>ظرفیت (اختیاری)</Text><TextInput style={styles.input} value={seatsAvailable} onChangeText={setSeatsAvailable} placeholder="مثلاً ۴" keyboardType="number-pad" textAlign="left" />
      </> : null}
      {listingFieldPolicy(categories.find((category) => category.id === categoryId), contentType).showItemCondition ? <><Text style={styles.fieldLabel}>وضعیت کالا</Text><View style={styles.priceModes}><Pressable style={[styles.priceMode, itemCondition === "new" && styles.priceModeActive]} onPress={() => setItemCondition("new")}><Text style={itemCondition === "new" ? styles.priceModeTextActive : styles.priceModeText}>نو</Text></Pressable><Pressable style={[styles.priceMode, itemCondition === "like_new" && styles.priceModeActive]} onPress={() => setItemCondition("like_new")}><Text style={itemCondition === "like_new" ? styles.priceModeTextActive : styles.priceModeText}>در حد نو</Text></Pressable><Pressable style={[styles.priceMode, itemCondition === "used" && styles.priceModeActive]} onPress={() => setItemCondition("used")}><Text style={itemCondition === "used" ? styles.priceModeTextActive : styles.priceModeText}>کارکرده</Text></Pressable></View></> : null}
      {listingFieldPolicy(categories.find((category) => category.id === categoryId), contentType).showPrice ? <><Text style={styles.fieldLabel}>قیمت</Text>
      <View style={styles.priceModes}>
        <Pressable
          style={[
            styles.priceMode,
            priceType === "negotiable" && styles.priceModeActive,
          ]}
          onPress={() => setPriceType("negotiable")}
        >
          <Text
            style={[
              styles.choiceText,
              priceType === "negotiable" && styles.choiceTextActive,
            ]}
          >
            توافقی
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.priceMode,
            priceType === "fixed" && styles.priceModeActive,
          ]}
          onPress={() => setPriceType("fixed")}
        >
          <Text
            style={[
              styles.choiceText,
              priceType === "fixed" && styles.choiceTextActive,
            ]}
          >
            قیمت مشخص
          </Text>
        </Pressable>
      </View>
      {priceType === "fixed" ? (
        <TextInput
          style={styles.input}
          value={priceAmount}
          onChangeText={(value) => setPriceAmount(formatMoneyInput(value))}
          keyboardType="number-pad"
          placeholder="مبلغ به تومان"
          textAlign="right"
        />
      ) : null}</> : null}
      <Text style={styles.fieldLabel}>تصویر آگهی</Text>
      <Pressable style={styles.imagePicker} onPress={() => void pick()}>
        <Ionicons
          name={image ? "checkmark-circle" : "image-outline"}
          size={22}
          color="#087f79"
        />
        <Text style={styles.imagePickerText}>
          {images.length ? `${images.length} تصویر انتخاب شده` : "انتخاب تا ۶ تصویر از گالری"}
        </Text>
      </Pressable>
      <Pressable style={styles.imagePicker} onPress={() => void pickVideo()}>
        <Ionicons name={video ? "videocam" : "videocam-outline"} size={22} color="#087f79" />
        <Text style={styles.imagePickerText}>{video ? "تغییر ویدیوی انتخاب‌شده" : "افزودن یک ویدیو (اختیاری)"}</Text>
      </Pressable>
      {image ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: image }} style={styles.preview} />
          <Pressable style={styles.removeImage} onPress={() => setImage(null)}>
            <Ionicons name="close" size={19} color="#ffffff" />
          </Pressable>
        </View>
      ) : null}
      <Pressable
        style={[
          styles.primary,
          (busy ||
            !title ||
            !description ||
            !cityId ||
            !categoryId ||
            (priceType === "fixed" && !priceAmount)) &&
            styles.primaryDisabled,
        ]}
        disabled={
          busy ||
          !title ||
          !description ||
          !cityId ||
          !categoryId ||
          (priceType === "fixed" && !priceAmount)
        }
        onPress={() => void submit()}
      >
        <Text style={styles.primaryText}>
          {busy ? "در حال ارسال" : "ارسال آگهی"}
        </Text>
      </Pressable>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
    </ScrollView>
  );
}

function InboxScreen({ token }: { token: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    void api<{ data: Conversation[] }>("/api/v1/me/conversations", {}, token)
      .then((result) => setConversations(result.data))
      .catch(() => setMessage("گفتگوها بارگذاری نشدند."));
  }, [token]);
  return (
    <View style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>گفتگوها</Text>
        {message ? <Text style={styles.notice}>{message}</Text> : null}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.conversation}>
              <Text style={styles.cardTitle}>{item.content_title}</Text>
              <Text style={styles.subtitle}>
                {item.unread_count
                  ? `${item.unread_count} پیام خوانده‌نشده`
                  : "گفتگوی فعال"}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.subtitle}>هنوز گفتگویی شروع نشده است.</Text>
          }
        />
      </View>
    </View>
  );
}

function ProfileScreenV2({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const result = await api<{ data: MeResponse }>("/api/v1/me", {}, token);
      setMe(result.data);
      setFirstName(result.data.profile?.first_name ?? "");
      setLastName(result.data.profile?.last_name ?? "");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `بارگذاری پروفایل انجام نشد: ${error.message}`
          : "بارگذاری پروفایل انجام نشد.",
      );
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        primary_city_id:
          me?.profile?.primary_city_id ??
          "00000000-0000-4000-8000-000000000101",
        ...(password ? { password } : {}),
      };
      const result = await api<{ data: MeResponse }>(
        "/api/v1/me/profile",
        { method: "PUT", body: JSON.stringify(body) },
        token,
      );
      setPassword("");
      setMessage("پروفایل با موفقیت ذخیره شد.");
      setMe((current) =>
        current
          ? {
              ...current,
              profile_complete: result.data.profile_complete,
              password_set: result.data.password_set,
            }
          : current,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `ذخیره پروفایل انجام نشد: ${error.message}`
          : "ذخیره پروفایل انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.profile}>
      <Image
        source={LOGO}
        style={{ width: "100%", height: 74 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>پروفایل من</Text>
      <Text style={styles.subtitle}>
        {me?.profile_complete
          ? "پروفایل شما کامل است."
          : "برای ثبت آگهی، اطلاعات خود را کامل کنید."}
      </Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="نام"
      />
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="نام خانوادگی"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={
          me?.password_set
            ? "رمز جدید، در صورت تغییر"
            : "رمز عبور، حداقل ۸ کاراکتر"
        }
      />
      <Pressable
        style={styles.primary}
        disabled={
          busy || !firstName || !lastName || (!!password && password.length < 8)
        }
        onPress={() => void save()}
      >
        <Text style={styles.primaryText}>
          {busy ? "در حال ذخیره" : "ذخیره اطلاعات پروفایل"}
        </Text>
      </Pressable>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      <View style={styles.profileStat}>
        <Text style={styles.cardTitle}>وضعیت حساب</Text>
        <Text style={styles.subtitle}>
          {me?.mobile_verified
            ? "شماره موبایل تایید شده"
            : "شماره موبایل تایید نشده"}
        </Text>
        <Text style={styles.subtitle}>
          {me?.password_set ? "رمز عبور تنظیم شده" : "رمز عبور هنوز تنظیم نشده"}
        </Text>
      </View>
      <Pressable style={styles.danger} onPress={onLogout}>
        <Text style={styles.dangerText}>خروج از حساب</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreenV3({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [items, setItems] = useState<MyItem[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void Promise.all([
      api<{ data: MeResponse }>("/api/v1/me", {}, token),
      api<{ data: MyItem[] }>("/api/v1/me/contents", {}, token),
    ])
      .then(([meResult, itemsResult]) => {
        setMe(meResult.data);
        setItems(itemsResult.data);
        setFirstName(meResult.data.profile?.first_name ?? "");
        setLastName(meResult.data.profile?.last_name ?? "");
      })
      .catch((error) =>
        setMessage(
          error instanceof Error
            ? `بارگذاری پروفایل انجام نشد: ${error.message}`
            : "بارگذاری پروفایل انجام نشد.",
        ),
      );
  }, [token]);
  const save = async () => {
    setBusy(true);
    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        primary_city_id:
          me?.profile?.primary_city_id ??
          "00000000-0000-4000-8000-000000000101",
        ...(password ? { password } : {}),
      };
      const result = await api<{
        data: { profile_complete: boolean; password_set: boolean };
      }>(
        "/api/v1/me/profile",
        { method: "PUT", body: JSON.stringify(body) },
        token,
      );
      setPassword("");
      setMessage("پروفایل با موفقیت ذخیره شد.");
      setMe((current) =>
        current
          ? {
              ...current,
              profile_complete: result.data.profile_complete,
              password_set: result.data.password_set,
            }
          : current,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `ذخیره پروفایل انجام نشد: ${error.message}`
          : "ذخیره پروفایل انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  const statusLabel = (status: string) =>
    status === "approved"
      ? "منتشرشده"
      : status === "pending"
        ? "در انتظار بررسی"
        : status === "rejected"
          ? "ردشده"
          : status;
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.profile}>
      <Image
        source={LOGO}
        style={{ width: "100%", height: 74 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>پروفایل من</Text>
      <Text style={styles.subtitle}>
        {me?.profile_complete
          ? "پروفایل شما کامل است."
          : "برای ثبت آگهی، اطلاعات خود را کامل کنید."}
      </Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="نام"
      />
      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="نام خانوادگی"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder={
          me?.password_set
            ? "رمز جدید، در صورت تغییر"
            : "رمز عبور، حداقل ۸ کاراکتر"
        }
      />
      <Pressable
        style={styles.primary}
        disabled={
          busy || !firstName || !lastName || (!!password && password.length < 8)
        }
        onPress={() => void save()}
      >
        <Text style={styles.primaryText}>
          {busy ? "در حال ذخیره" : "ذخیره اطلاعات پروفایل"}
        </Text>
      </Pressable>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 16,
          marginTop: 18,
        }}
      >
        <Text style={styles.cardTitle}>وضعیت حساب</Text>
        <Text style={styles.subtitle}>
          {me?.mobile_verified
            ? "شماره موبایل تایید شده"
            : "شماره موبایل تایید نشده"}
        </Text>
        <Text style={styles.subtitle}>
          {me?.password_set ? "رمز عبور تنظیم شده" : "رمز عبور هنوز تنظیم نشده"}
        </Text>
      </View>
      <View style={{ marginTop: 24 }}>
        <Text style={styles.title}>آگهی‌های من</Text>
        <Text style={styles.subtitle}>
          {items.length.toLocaleString("fa-IR")} آگهی ثبت شده
        </Text>
        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={styles.conversation}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {statusLabel(item.status)} · {price(item)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.subtitle}>هنوز آگهی‌ای ثبت نکرده‌اید.</Text>
        )}
      </View>
      <Pressable style={styles.danger} onPress={onLogout}>
        <Text style={styles.dangerText}>خروج از حساب</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreenV4({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<MyItem[]>([]);
  const [message, setMessage] = useState("");
  const load = async () => {
    try {
      setItems(
        (await api<{ data: MyItem[] }>("/api/v1/me/contents", {}, token)).data,
      );
    } catch {
      setMessage("آگهی‌ها بارگذاری نشدند.");
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  const remove = (id: string) =>
    Alert.alert("حذف آگهی", "آیا از حذف این آگهی مطمئن هستید؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/v1/me/contents/${id}`, { method: "DELETE" }, token);
            setItems((current) => current.filter((item) => item.id !== id));
          } catch {
            setMessage("حذف آگهی انجام نشد.");
          }
        },
      },
    ]);
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.profile}>
      <Image
        source={LOGO}
        style={{ width: "100%", height: 74 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>آگهی‌های من</Text>
      <Text style={styles.subtitle}>
        {items.length.toLocaleString("fa-IR")} آگهی ثبت شده
      </Text>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      {items.length ? (
        items.map((item) => (
          <View key={item.id} style={styles.conversation}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {item.status === "approved"
                ? "منتشرشده"
                : item.status === "submitted"
                  ? "در انتظار بررسی"
                  : item.status === "rejected"
                    ? "ردشده"
                    : item.status}{" "}
              · {price(item)}
            </Text>
            <Pressable style={styles.danger} onPress={() => remove(item.id)}>
              <Text style={styles.dangerText}>حذف آگهی</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={styles.subtitle}>هنوز آگهی‌ای ثبت نکرده‌اید.</Text>
      )}
      <Pressable style={styles.secondary} onPress={() => void load()}>
        <Text>به‌روزرسانی آگهی‌ها</Text>
      </Pressable>
      <Pressable style={styles.danger} onPress={onLogout}>
        <Text style={styles.dangerText}>خروج از حساب</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreenV5({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<"account" | "listings" | "storefront">("account");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [items, setItems] = useState<MyItem[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const [m, l] = await Promise.all([
        api<{ data: MeResponse }>("/api/v1/me", {}, token),
        api<{ data: MyItem[] }>("/api/v1/me/contents", {}, token),
      ]);
      setMe(m.data);
      setItems(l.data);
      setFirstName(m.data.profile?.first_name ?? "");
      setLastName(m.data.profile?.last_name ?? "");
    } catch {
      setMessage("اطلاعات پروفایل بارگذاری نشد.");
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  const save = async () => {
    setBusy(true);
    try {
      const result = await api<{
        data: { profile_complete: boolean; password_set: boolean };
      }>(
        "/api/v1/me/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            primary_city_id:
              me?.profile?.primary_city_id ??
              "00000000-0000-4000-8000-000000000101",
            ...(password ? { password } : {}),
          }),
        },
        token,
      );
      setPassword("");
      setMe((current) =>
        current
          ? {
              ...current,
              profile_complete: result.data.profile_complete,
              password_set: result.data.password_set,
            }
          : current,
      );
      setMessage("اطلاعات پروفایل ذخیره شد.");
    } catch {
      setMessage("ذخیره اطلاعات انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  const remove = (id: string) =>
    Alert.alert("حذف آگهی", "آگهی حذف شود؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/v1/me/contents/${id}`, { method: "DELETE" }, token);
            setItems((current) => current.filter((item) => item.id !== id));
          } catch {
            setMessage("حذف آگهی انجام نشد.");
          }
        },
      },
    ]);
  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.profile}>
      <Image
        source={LOGO}
        style={{ width: "100%", height: 74 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>پروفایل من</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        <Pressable
          style={[styles.secondary, tab === "account" && styles.tabActive]}
          onPress={() => setTab("account")}
        >
          <Text>اطلاعات حساب</Text>
        </Pressable>
        <Pressable
          style={[styles.secondary, tab === "listings" && styles.tabActive]}
          onPress={() => setTab("listings")}
        >
          <Text>آگهی‌های من</Text>
        </Pressable>
      </View>
      {tab === "account" ? (
        <>
          <NotificationPanel token={token} />
          <Text style={styles.subtitle}>
            {me?.profile_complete
              ? "پروفایل کامل است."
              : "برای ثبت آگهی، اطلاعات را کامل کنید."}
          </Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="نام"
          />
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="نام خانوادگی"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={
              me?.password_set
                ? "رمز جدید، در صورت تغییر"
                : "رمز عبور، حداقل ۸ کاراکتر"
            }
          />
          <Pressable
            style={styles.primary}
            disabled={
              busy ||
              !firstName ||
              !lastName ||
              (!!password && password.length < 8)
            }
            onPress={() => void save()}
          >
            <Text style={styles.primaryText}>
              {busy ? "در حال ذخیره" : "ذخیره پروفایل"}
            </Text>
          </Pressable>
          <Text style={styles.subtitle}>
            {me?.mobile_verified
              ? "شماره موبایل تایید شده"
              : "شماره موبایل تایید نشده"}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {items.length.toLocaleString("fa-IR")} آگهی ثبت شده
          </Text>
          {items.length ? (
            items.map((item) => (
              <View key={item.id} style={styles.conversation}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.subtitle}>
                  {item.status === "approved"
                    ? "منتشرشده"
                    : item.status === "submitted"
                      ? "در انتظار بررسی"
                      : "ردشده"}{" "}
                  · {price(item)}
                </Text>
                <Pressable
                  style={styles.danger}
                  onPress={() => remove(item.id)}
                >
                  <Text style={styles.dangerText}>حذف آگهی</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.subtitle}>هنوز آگهی‌ای ثبت نکرده‌اید.</Text>
          )}
        </>
      )}
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      <Pressable style={styles.danger} onPress={onLogout}>
        <Text style={styles.dangerText}>خروج از حساب</Text>
      </Pressable>
    </ScrollView>
  );
}

function NotificationPanel({ token }: { token: string }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    void getSavedNativePushToken().then((value) => setEnabled(Boolean(value)));
  }, []);
  const activate = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await registerNativeNotifications();
      setEnabled(result.enabled);
      if (result.enabled && result.token) {
        try {
          await api(
            "/api/v1/me/native-push-tokens",
            {
              method: "POST",
              body: JSON.stringify({
                token: result.token,
                platform: Platform.OS,
                provider: "expo",
              }),
            },
            token,
          );
          setMessage(result.message);
        } catch {
          setMessage(
            "اعلان روی دستگاه فعال شد؛ ثبت اتصال با سرور بعداً دوباره انجام می‌شود.",
          );
        }
      } else setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `فعال‌سازی اعلان انجام نشد: ${error.message}`
          : "فعال‌سازی اعلان انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.notificationPanel}>
      <Text style={styles.cardTitle}>اعلان‌های موبایل</Text>
      <Text style={styles.subtitle}>
        {enabled
          ? "اعلان‌های این دستگاه آماده است."
          : "برای پیام‌های جدید و تغییر وضعیت آگهی اعلان بگیرید."}
      </Text>
      <Pressable
        style={styles.secondary}
        disabled={busy}
        onPress={() => void activate()}
      >
        <Text>
          {busy
            ? "در حال فعال‌سازی"
            : enabled
              ? "بررسی وضعیت اعلان"
              : "فعال‌سازی اعلان‌ها"}
        </Text>
      </Pressable>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
    </View>
  );
}
function ProfileScreenV6({
  token,
  onLogout,
  onOpen,
  onAdmin,
}: {
  token: string;
  onLogout: () => void;
  onOpen: (item: Item) => void;
  onAdmin: () => void;
}) {
  const [tab, setTab] = useState<"account" | "listings" | "storefront" | "favorites">("account");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [items, setItems] = useState<MyItem[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myStorefront, setMyStorefront] = useState<Storefront | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<Item[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeShortDescription, setStoreShortDescription] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeBusinessType, setStoreBusinessType] = useState("");
  const [storeCategoryId, setStoreCategoryId] = useState("");
  const [storeCityId, setStoreCityId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cityId, setCityId] = useState("");
  const [password, setPassword] = useState("");
  const [editing, setEditing] = useState<MyItem | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    setMessage("");
    try {
      const [m, l, c, cats, storefrontResult] = await Promise.all([
        api<{ data: MeResponse }>("/api/v1/me", {}, token),
        api<{ data: MyItem[] }>("/api/v1/me/contents", {}, token),
        api<{ data: City[] }>("/api/v1/regions/4d/cities"),
        api<{ data: Category[] }>("/api/v1/categories"),
        api<{ data: Storefront | null }>("/api/v1/me/storefront", {}, token),
      ]);
      const [favoriteResult, feedResult] = await Promise.allSettled([
        api<{ data: string[] }>("/api/v1/me/favorites", {}, token),
        api<{ data: Item[] }>("/api/v1/feed"),
      ]);
      setMe(m.data);
      setItems(l.data);
      setCities(c.data);
      setCategories(cats.data);
      setMyStorefront(storefrontResult.data);
      if (favoriteResult.status === "fulfilled") {
        setFavoriteIds(favoriteResult.value.data);
        if (feedResult.status === "fulfilled") {
          const ids = new Set(favoriteResult.value.data);
          setFavoriteItems(feedResult.value.data.filter((item) => ids.has(item.id)));
        }
      }
      setStoreName(storefrontResult.data?.name ?? "");
      setStoreSlug(storefrontResult.data?.slug ?? "");
      setStoreShortDescription(storefrontResult.data?.short_description ?? "");
      setStoreDescription(storefrontResult.data?.description ?? "");
      setStoreBusinessType(storefrontResult.data?.business_type ?? "");
      setStoreCategoryId(storefrontResult.data?.category_id ?? cats.data[0]?.id ?? "");
      setStoreCityId(storefrontResult.data?.city_id ?? c.data[0]?.id ?? "");
      setFirstName(m.data.profile?.first_name ?? "");
      setLastName(m.data.profile?.last_name ?? "");
      setCityId(c.data.some((city) => city.id === m.data.profile?.primary_city_id)
        ? m.data.profile?.primary_city_id ?? c.data[0]?.id ?? ""
        : c.data[0]?.id ?? "");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "اطلاعات پروفایل بارگذاری نشد.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const toggleFavorite = async (item: Item) => {
    if (favoriteBusyId) return;
    setFavoriteBusyId(item.id);
    try {
      const isFavorite = favoriteIds.includes(item.id);
      await api(`/api/v1/contents/${item.id}/favorite`, { method: isFavorite ? "DELETE" : "POST" }, token);
      setFavoriteIds((current) => isFavorite ? current.filter((id) => id !== item.id) : [...current, item.id]);
      if (isFavorite) setFavoriteItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره آگهی انجام نشد.");
    } finally {
      setFavoriteBusyId(null);
    }
  };
  useEffect(() => {
    void load();
  }, [token]);
  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !cityId) {
      setMessage("نام، نام خانوادگی و شهر را کامل کنید.");
      return;
    }
    if (password && password.length < 8) {
      setMessage("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await api<{
        data: { profile_complete: boolean; password_set: boolean };
      }>(
        "/api/v1/me/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            primary_city_id: cityId,
            ...(password ? { password } : {}),
          }),
        },
        token,
      );
      setMe((current) =>
        current
          ? {
              ...current,
              profile_complete: result.data.profile_complete,
              password_set: result.data.password_set,
              profile: {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                primary_city_id: cityId,
              },
            }
          : current,
      );
      setPassword("");
      setMessage("اطلاعات حساب با موفقیت ذخیره شد.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "ذخیره اطلاعات انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  const beginEdit = (item: MyItem) => {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setEditingMetadata(Object.fromEntries(Object.entries(item.metadata_json ?? {}).map(([key, value]) => [key, String(value)])));
    setMessage("");
  };
  const saveStorefront = async () => {
    if (!storeName.trim() || !storeSlug.trim() || !storeShortDescription.trim() || !storeDescription.trim() || !storeBusinessType.trim() || !storeCategoryId || !storeCityId) {
      setMessage("اطلاعات اصلی غرفه را کامل کنید.");
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ data: Storefront }>(myStorefront ? "/api/v1/me/storefront" : "/api/v1/storefronts", { method: myStorefront ? "PATCH" : "POST", body: JSON.stringify({ name: storeName.trim(), slug: storeSlug.trim(), short_description: storeShortDescription.trim(), description: storeDescription.trim(), business_type: storeBusinessType.trim(), category_id: storeCategoryId, city_id: storeCityId }) }, token);
      setMyStorefront(result.data);
      setMessage("غرفه ذخیره شد و برای بررسی ارسال شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره غرفه انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  const saveEdit = async () => {
    if (!editing || !title.trim() || !description.trim()) return;
    setBusy(true);
    try {
      const result = await api<{ data: MyItem }>(
        `/api/v1/me/contents/${editing.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            city_id: editing.city_id,
            category_id: editing.category_id,
            price_amount: editing.price_amount,
            price_type: editing.price_type ?? "negotiable",
            image_url: editing.image_data_url ?? null,
            metadata: editingMetadata,
          }),
        },
        token,
      );
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id ? { ...item, ...result.data } : item,
        ),
      );
      setEditing(null);
      setMessage("آگهی ویرایش شد و برای بررسی دوباره ارسال شد.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `ویرایش انجام نشد: ${error.message}`
          : "ویرایش انجام نشد.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = (id: string) =>
    Alert.alert("حذف آگهی", "آگهی حذف شود؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/api/v1/me/contents/${id}`, { method: "DELETE" }, token);
            setItems((current) => current.filter((item) => item.id !== id));
          } catch {
            setMessage("حذف آگهی انجام نشد.");
          }
        },
      },
    ]);
  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.profile}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
    >
      <View style={styles.profileHeader}>
        <BrandLogo compact />
        <View style={styles.profileHeaderCopy}>
          <Text style={styles.title}>پروفایل من</Text>
          <Text style={styles.subtitle}>
            {me?.profile_complete ? "حساب آماده ثبت آگهی است" : "برای ثبت آگهی، حساب را کامل کنید"}
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.profileTabs}
      >
        <Pressable
          style={[styles.profileTab, tab === "account" && styles.profileTabActive]}
          onPress={() => setTab("account")}
          accessibilityRole="tab"
          accessibilityLabel="اطلاعات حساب"
          accessibilityState={{ selected: tab === "account" }}
        >
          <Ionicons name="person-outline" size={17} color={tab === "account" ? "#ffffff" : "#52606d"} />
          <Text style={[styles.profileTabText, tab === "account" && styles.profileTabTextActive]}>اطلاعات حساب</Text>
        </Pressable>
        <Pressable
          style={[styles.profileTab, tab === "listings" && styles.profileTabActive]}
          onPress={() => setTab("listings")}
          accessibilityRole="tab"
          accessibilityLabel="آگهی‌های من"
          accessibilityState={{ selected: tab === "listings" }}
        >
          <Ionicons name="list-outline" size={17} color={tab === "listings" ? "#ffffff" : "#52606d"} />
          <Text style={[styles.profileTabText, tab === "listings" && styles.profileTabTextActive]}>آگهی‌های من</Text>
        </Pressable>
        <Pressable
          style={[styles.profileTab, tab === "storefront" && styles.profileTabActive]}
          onPress={() => setTab("storefront")}
          accessibilityRole="tab"
          accessibilityLabel="غرفه من"
          accessibilityState={{ selected: tab === "storefront" }}
        >
          <Ionicons name="storefront-outline" size={17} color={tab === "storefront" ? "#ffffff" : "#52606d"} />
          <Text style={[styles.profileTabText, tab === "storefront" && styles.profileTabTextActive]}>غرفه من</Text>
        </Pressable>
        <Pressable
          style={[styles.profileTab, tab === "favorites" && styles.profileTabActive]}
          onPress={() => setTab("favorites")}
          accessibilityRole="tab"
          accessibilityLabel="ذخیره‌ها"
          accessibilityState={{ selected: tab === "favorites" }}
        >
          <Ionicons name="heart-outline" size={17} color={tab === "favorites" ? "#ffffff" : "#52606d"} />
          <Text style={[styles.profileTabText, tab === "favorites" && styles.profileTabTextActive]}>ذخیره‌ها</Text>
        </Pressable>
      </ScrollView>
      {loading ? (
        <View style={styles.profileLoading}>
          <ActivityIndicator color="#087f79" />
          <Text style={styles.subtitle}>در حال دریافت اطلاعات حساب...</Text>
        </View>
      ) : tab === "account" ? (
        <>
          <View style={styles.accountStatusGrid}>
            <View style={styles.accountStatusCard}>
              <Ionicons name={me?.mobile_verified ? "checkmark-circle" : "alert-circle-outline"} size={21} color={me?.mobile_verified ? "#217a45" : "#8a5d13"} />
              <Text style={styles.accountStatusTitle}>شماره موبایل</Text>
              <Text style={styles.accountStatusText}>{me?.mobile_verified ? "تأیید شده" : "تأیید نشده"}</Text>
            </View>
            <View style={styles.accountStatusCard}>
              <Ionicons name={me?.password_set ? "lock-closed" : "lock-open-outline"} size={21} color={me?.password_set ? "#217a45" : "#8a5d13"} />
              <Text style={styles.accountStatusTitle}>رمز عبور</Text>
              <Text style={styles.accountStatusText}>{me?.password_set ? "تنظیم شده" : "تنظیم نشده"}</Text>
            </View>
            <View style={styles.accountStatusCard}>
              <Ionicons name={me?.identity_verification_status === "verified" ? "shield-checkmark" : "shield-outline"} size={21} color={me?.identity_verification_status === "verified" ? "#217a45" : "#8a5d13"} />
              <Text style={styles.accountStatusTitle}>هویت</Text>
              <Text style={styles.accountStatusText}>{me?.identity_verification_status === "verified" ? "هویت تأیید شده" : me?.identity_verification_status === "pending" ? "در انتظار بررسی" : "تأیید نشده"}</Text>
            </View>
          </View>
          {me?.mobile_verified && me.identity_verification_status !== "verified" && me.identity_verification_status !== "pending" ? (
            <IdentityDocumentForm token={token} onSubmitted={() => setMe(current => current ? { ...current, identity_verification_status: "pending" } : current)} />
          ) : null}
          <View style={styles.profileFormCard}>
            <Text style={styles.cardTitle}>اطلاعات شخصی</Text>
            <Text style={styles.subtitle}>این اطلاعات برای اعتماد بیشتر و مدیریت آگهی‌ها استفاده می‌شود.</Text>
            <Text style={styles.fieldLabel}>نام</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="نام" textAlign="right" accessibilityLabel="نام" />
            <Text style={styles.fieldLabel}>نام خانوادگی</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="نام خانوادگی" textAlign="right" accessibilityLabel="نام خانوادگی" />
            <Text style={styles.fieldLabel}>شهر اصلی</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
              {cities.map((city) => (
                <Pressable key={city.id} style={[styles.choiceChip, cityId === city.id && styles.choiceChipActive]} onPress={() => setCityId(city.id)} accessibilityRole="radio" accessibilityState={{ selected: cityId === city.id }} accessibilityLabel={city.name_fa}>
                  <Text style={[styles.choiceText, cityId === city.id && styles.choiceTextActive]}>{city.name_fa}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>{me?.password_set ? "تغییر رمز عبور" : "ساخت رمز عبور"}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              accessibilityLabel={me?.password_set ? "تغییر رمز عبور" : "ساخت رمز عبور"}
              secureTextEntry
              placeholder={me?.password_set ? "فقط برای تغییر رمز وارد کنید" : "حداقل ۸ کاراکتر"}
              textAlign="right"
            />
            <Pressable style={[styles.primary, (busy || !firstName.trim() || !lastName.trim() || !cityId) && styles.primaryDisabled]} disabled={busy || !firstName.trim() || !lastName.trim() || !cityId} onPress={() => void saveProfile()}>
              <Ionicons name="save-outline" size={19} color="#ffffff" />
              <Text style={styles.primaryText}>{busy ? "در حال ذخیره" : "ذخیره اطلاعات"}</Text>
            </Pressable>
          </View>
          <NotificationPanel token={token} />
        </>
      ) : tab === "storefront" ? (
        <View style={styles.profileFormCard}>
          <Text style={styles.cardTitle}>{myStorefront ? "ویرایش غرفه" : "ساخت غرفه"}</Text>
          <Text style={styles.subtitle}>غرفه عمومی شما پس از بررسی در بازار نمایش داده می‌شود.</Text>
          <Text style={styles.fieldLabel}>نام غرفه</Text><TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="مثلاً خدمات فنی گرمه" textAlign="right" />
          <Text style={styles.fieldLabel}>شناسه غرفه</Text><TextInput style={styles.input} value={storeSlug} onChangeText={setStoreSlug} placeholder="مثلاً khadamat-garmeh" autoCapitalize="none" textAlign="left" />
          <Text style={styles.fieldLabel}>نوع فعالیت</Text><TextInput style={styles.input} value={storeBusinessType} onChangeText={setStoreBusinessType} placeholder="مثلاً تعمیرات" textAlign="right" />
          <Text style={styles.fieldLabel}>توضیح کوتاه</Text><TextInput style={styles.input} value={storeShortDescription} onChangeText={setStoreShortDescription} placeholder="معرفی کوتاه غرفه" textAlign="right" />
          <Text style={styles.fieldLabel}>توضیحات کامل</Text><TextInput style={[styles.input, styles.multiline]} value={storeDescription} onChangeText={setStoreDescription} placeholder="درباره غرفه بنویسید" multiline textAlign="right" />
          <Text style={styles.fieldLabel}>دسته و شهر</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{categories.map((category) => <Pressable key={category.id} style={[styles.choiceChip, storeCategoryId === category.id && styles.choiceChipActive]} onPress={() => setStoreCategoryId(category.id)}><Text style={[styles.choiceText, storeCategoryId === category.id && styles.choiceTextActive]}>{category.name_fa}</Text></Pressable>)}</ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{cities.map((city) => <Pressable key={city.id} style={[styles.choiceChip, storeCityId === city.id && styles.choiceChipActive]} onPress={() => setStoreCityId(city.id)}><Text style={[styles.choiceText, storeCityId === city.id && styles.choiceTextActive]}>{city.name_fa}</Text></Pressable>)}</ScrollView>
          <Pressable style={[styles.primary, busy && styles.primaryDisabled]} disabled={busy} onPress={() => void saveStorefront()}><Ionicons name="save-outline" size={19} color="#ffffff" /><Text style={styles.primaryText}>{busy ? "در حال ذخیره" : "ذخیره غرفه"}</Text></Pressable>
        </View>
      ) : tab === "favorites" ? (
        <>
          <View style={styles.listingsSummary}>
            <View>
              <Text style={styles.cardTitle}>ذخیره‌های من</Text>
              <Text style={styles.subtitle}>{favoriteIds.length.toLocaleString("fa-IR")} آگهی ذخیره‌شده</Text>
            </View>
            <Ionicons name="heart-outline" size={28} color="#d46b5e" />
          </View>
          {favoriteItems.length ? favoriteItems.map((item) => (
            <Pressable key={item.id} style={styles.myListingCard} onPress={() => onOpen(item)} accessibilityRole="button" accessibilityLabel={`مشاهده آگهی ${item.title}`}>
              <View style={styles.myListingTop}>
                {item.image_data_url ? <Image source={{ uri: mediaUrl(item.image_data_url) }} style={styles.myListingThumb} /> : <View style={[styles.myListingThumb, styles.placeholder]}><Ionicons name="image-outline" size={22} color="#087f79" /></View>}
                <View style={styles.myListingCopy}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.subtitle}>{price(item)}</Text>
                </View>
                <Pressable style={styles.iconButton} onPress={(event) => { event.stopPropagation(); void toggleFavorite(item); }} accessibilityLabel="حذف از ذخیره‌ها">
                  <Ionicons name="heart" size={20} color="#d46b5e" />
                </Pressable>
              </View>
            </Pressable>
          )) : (
            <View style={styles.emptyCompact}>
              <Ionicons name="heart-outline" size={34} color="#087f79" />
              <Text style={styles.emptyTitle}>{favoriteIds.length ? "ذخیره‌ها خارج از فهرست فعلی هستند" : "هنوز آگهی ذخیره نکرده‌اید"}</Text>
              <Text style={styles.subtitle}>برای ذخیره آگهی، در بازار روی قلب آن بزنید.</Text>
            </View>
          )}
        </>
      ) : editing ? (
        <>
          <Text style={styles.title}>ویرایش آگهی</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="عنوان آگهی"
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="توضیحات"
            multiline
          />
          {(categories.find((category) => category.id === editing.category_id)?.metadata_schema ?? []).length ? <View style={styles.dynamicFieldsCard}>
            <Text style={styles.cardTitle}>ویژگی‌های اختصاصی</Text>
            {(categories.find((category) => category.id === editing.category_id)?.metadata_schema ?? []).map((field) => field.type === "select" ? <View key={field.key}><Text style={styles.fieldLabel}>{field.label_fa}{field.required ? " *" : ""}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{(field.options ?? []).map((option) => <Pressable key={option.value} style={[styles.choiceChip, editingMetadata[field.key] === option.value && styles.choiceChipActive]} onPress={() => setEditingMetadata((current) => ({ ...current, [field.key]: option.value }))}><Text style={[styles.choiceText, editingMetadata[field.key] === option.value && styles.choiceTextActive]}>{option.label_fa}</Text></Pressable>)}</ScrollView></View> : <View key={field.key}><Text style={styles.fieldLabel}>{field.label_fa}{field.required ? " *" : ""}</Text><TextInput style={styles.input} value={editingMetadata[field.key] ?? ""} onChangeText={(value) => setEditingMetadata((current) => ({ ...current, [field.key]: value }))} placeholder={field.placeholder} keyboardType={field.type === "number" ? "numeric" : "default"} textAlign="right" /></View>)}
          </View> : null}
          <Pressable
            style={styles.primary}
            disabled={busy || !title.trim() || !description.trim()}
            onPress={() => void saveEdit()}
          >
            <Text style={styles.primaryText}>
              {busy ? "در حال ذخیره" : "ذخیره و ارسال برای بررسی"}
            </Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => { setEditing(null); setEditingMetadata({}); }}>
            <Text>انصراف</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.listingsSummary}>
            <View>
              <Text style={styles.cardTitle}>آگهی‌های من</Text>
              <Text style={styles.subtitle}>{items.length.toLocaleString("fa-IR")} آگهی ثبت شده</Text>
            </View>
            <Ionicons name="receipt-outline" size={28} color="#087f79" />
          </View>
          {items.length ? items.map((item) => (
            <View key={item.id} style={styles.myListingCard}>
              <View style={styles.myListingTop}>
                {item.image_data_url ? <Image source={{ uri: mediaUrl(item.image_data_url) }} style={styles.myListingThumb} /> : <View style={[styles.myListingThumb, styles.placeholder]}><Ionicons name="image-outline" size={22} color="#087f79" /></View>}
                <View style={styles.myListingCopy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.status === "approved"
                  ? "منتشرشده"
                  : item.status === "submitted"
                    ? "در انتظار بررسی"
                    : "ردشده"}{" "}
                · {price(item)}
              </Text>
                </View>
              </View>
              <View style={styles.myListingActions}>
              <Pressable
                style={styles.listingAction}
                onPress={() => beginEdit(item)}
              >
                <Ionicons name="create-outline" size={17} color="#176b70" />
                <Text style={styles.listingActionText}>ویرایش</Text>
              </Pressable>
              <Pressable style={[styles.listingAction, styles.listingDelete]} onPress={() => remove(item.id)}>
                <Ionicons name="trash-outline" size={17} color="#9c4037" />
                <Text style={styles.dangerText}>حذف</Text>
              </Pressable>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCompact}>
              <Ionicons name="storefront-outline" size={34} color="#087f79" />
              <Text style={styles.emptyTitle}>هنوز آگهی ثبت نکرده‌اید</Text>
              <Text style={styles.subtitle}>از تب «ثبت آگهی» اولین مورد را منتشر کنید.</Text>
            </View>
          )}
        </>
      )}
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      {me?.roles?.some((role) => role === "admin" || role === "moderator") ? <Pressable style={styles.adminEntry} onPress={onAdmin} accessibilityRole="button" accessibilityLabel="پنل مدیریت">
        <Ionicons name="shield-checkmark-outline" size={20} color="#087f79" />
        <View style={styles.adminEntryCopy}><Text style={styles.cardTitle}>پنل مدیریت</Text><Text style={styles.subtitle}>بررسی آگهی‌ها، گزارش‌ها و پشتیبانی</Text></View>
        <Ionicons name="chevron-back" size={18} color="#52606d" />
      </Pressable> : null}
      <Pressable style={styles.danger} onPress={() => Alert.alert("خروج از حساب", "از حساب 4D خارج می‌شوید؟", [{ text: "انصراف", style: "cancel" }, { text: "خروج", style: "destructive", onPress: onLogout }])}>
        <Ionicons name="log-out-outline" size={18} color="#9c4037" />
        <Text style={styles.dangerText}>خروج از حساب</Text>
      </Pressable>
    </ScrollView>
  );
}

function AdminScreen({ token, onBack }: { token: string; onBack: () => void }) {
  const [sections, setSections] = useState<Array<{ label: string; icon: keyof typeof Ionicons.glyphMap; items: unknown[] }>>([]);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = async () => {
    setLoading(true);
    setMessage("");
    const results = await Promise.allSettled([
      api<{ data: unknown[] }>("/api/v1/admin/moderation/contents", {}, token),
      api<{ data: unknown[] }>("/api/v1/admin/moderation/cases", {}, token),
      api<{ data: unknown[] }>("/api/v1/admin/storefronts", {}, token),
      api<{ data: unknown[] }>("/api/v1/admin/support", {}, token),
    ]);
    const labels = [["آگهی‌های در انتظار بررسی", "list-outline"], ["گزارش‌ها", "flag-outline"], ["غرفه‌های در انتظار", "storefront-outline"], ["پشتیبانی", "chatbubbles-outline"]] as const;
    setSections(results.map((result, index) => ({ label: labels[index][0], icon: labels[index][1], items: result.status === "fulfilled" && Array.isArray(result.value.data) ? result.value.data : [] })));
    if (results.every((result) => result.status === "rejected")) setMessage("داده‌های پنل مدیریت بارگذاری نشدند.");
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, [token]);
  const runAdminAction = async (sectionIndex: number, value: unknown, action: string) => {
    const row = value as Record<string, unknown>;
    const id = String(row.id ?? row.content_id ?? row.case_id ?? row.ticket_id ?? "");
    if (!id) { setMessage("شناسه‌ی این مورد برای انجام عملیات موجود نیست."); return; }
    try {
      if (sectionIndex === 0) await api(`/api/v1/admin/moderation/contents/${id}/decisions`, { method: "POST", body: JSON.stringify({ decision: action, reason: "بررسی از اپ موبایل" }) }, token);
      if (sectionIndex === 1) await api(`/api/v1/admin/moderation/cases/${id}/decisions`, { method: "POST", body: JSON.stringify({ decision: action, reason: "بررسی از اپ موبایل" }) }, token);
      if (sectionIndex === 2) await api(`/api/v1/admin/storefronts/${id}/decisions`, { method: "POST", body: JSON.stringify({ decision: action, reason: "بررسی از اپ موبایل" }) }, token);
      if (sectionIndex === 3) await api(`/api/v1/admin/support/${id}`, { method: "PUT", body: JSON.stringify({ status: action }) }, token);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "عملیات پنل مدیریت انجام نشد."); }
  };
  const itemLabel = (value: unknown) => {
    const row = value as Record<string, unknown>;
    return String(row.title ?? row.name ?? row.subject ?? row.content_title ?? row.reason ?? row.id ?? "مورد پنل");
  };
  const adminDetail = (value: unknown) => {
    const row = value as Record<string, unknown>;
    const metadata = row.metadata_json as Record<string, unknown> | null | undefined;
    return <View style={styles.adminDetail}>
      {row.title ? <Text style={styles.adminDetailTitle}>{String(row.title)}</Text> : null}
      {row.description ? <Text style={styles.adminDetailText}>{String(row.description)}</Text> : null}
      {row.price_amount != null ? <Text style={styles.adminDetailText}>قیمت: {Number(row.price_amount).toLocaleString("fa-IR")}</Text> : null}
      {row.city_id ? <Text style={styles.adminDetailText}>شهر: {String(row.city_id)}</Text> : null}
      {metadata && Object.entries(metadata).length ? <View style={styles.adminAttributes}>{Object.entries(metadata).map(([key, itemValue]) => <View key={key} style={styles.adminAttribute}><Text style={styles.adminAttributeKey}>{attributeLabel(key)}</Text><Text style={styles.adminAttributeValue}>{attributeValue(key, itemValue)}</Text></View>)}</View> : null}
    </View>;
  };
  return <View style={styles.safe}>
    <View style={styles.adminHeader}><Pressable onPress={onBack} accessibilityLabel="بازگشت"><Ionicons name="arrow-forward" size={22} color="#176b70" /></Pressable><View style={styles.flowHeaderCopy}><Text style={styles.title}>پنل مدیریت</Text><Text style={styles.subtitle}>مدیریت سریع بازار 4D</Text></View></View>
    <ScrollView contentContainerStyle={styles.adminContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}>
      {message ? <Text style={styles.notice}>{message}</Text> : null}
      {sections.map((section, index) => <View key={section.label}>
        <Pressable style={styles.adminCard} accessibilityRole="button" accessibilityState={{ expanded: activeSection === index }} onPress={() => setActiveSection(activeSection === index ? null : index)}>
          <View style={styles.adminIcon}><Ionicons name={section.icon} size={22} color="#087f79" /></View>
          <View style={styles.adminEntryCopy}><Text style={styles.cardTitle}>{section.label}</Text><Text style={styles.subtitle}>{section.items.length.toLocaleString("fa-IR")} مورد · برای مشاهده بزنید</Text></View>
          <Ionicons name={activeSection === index ? "chevron-up" : "chevron-back"} size={18} color="#52606d" />
        </Pressable>
        {activeSection === index ? <View style={styles.adminItems}>{section.items.length ? section.items.slice(0, 30).map((item, itemIndex) => <View key={`${section.label}-${itemIndex}`} style={styles.adminItem}><Text style={styles.adminItemText} numberOfLines={2}>{itemLabel(item)}</Text><Text style={styles.adminItemMeta}>اطلاعات واقعی از API</Text>{index === 0 ? adminDetail(item) : null}<View style={styles.adminActions}>{(index === 0 ? [["approve", "تأیید"], ["reject", "رد"]] : index === 1 ? [["dismiss_report", "بستن گزارش"], ["escalate", "ارجاع"]] : index === 2 ? [["approve", "فعال‌سازی"], ["suspend", "توقف"]] : [["in_progress", "در حال بررسی"], ["closed", "بستن"]]).map(([action, label]) => <Pressable key={action} style={styles.adminAction} onPress={() => void runAdminAction(index, item, action)}><Text style={styles.adminActionText}>{label}</Text></Pressable>)}</View></View>) : <Text style={styles.subtitle}>موردی برای بررسی وجود ندارد.</Text>}</View> : null}
      </View>)}
      <Pressable style={styles.secondary} onPress={() => void load()} accessibilityRole="button"><Ionicons name="refresh-outline" size={18} color="#176b70" /><Text>تازه‌سازی پنل</Text></Pressable>
    </ScrollView>
  </View>;
}

function InboxScreenV2({
  token,
  initialConversationId,
}: {
  token: string;
  initialConversationId?: string | null;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadConversations = async () => {
    setMessage("");
    try {
      const [c, m] = await Promise.all([
        api<{ data: Conversation[] }>("/api/v1/me/conversations", {}, token),
        api<{ data: MeResponse }>("/api/v1/me", {}, token),
      ]);
      setConversations(c.data);
      setUserId(m.data.id);
      const linked = initialConversationId
        ? c.data.find((item) => item.id === initialConversationId)
        : null;
      if (linked) setSelected(linked);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "گفتگوها بارگذاری نشدند.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    void loadConversations();
  }, [initialConversationId, token]);
  if (selected)
    return (
      <ChatScreenV3
        conversation={selected}
        token={token}
        userId={userId}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <View style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.title}>گفتگوها</Text>
            <Text style={styles.subtitle}>خرید و فروش امن، بدون نمایش عمومی شماره</Text>
          </View>
          <View style={styles.inboxCount}>
            <Ionicons name="chatbubbles-outline" size={18} color="#087f79" />
            <Text style={styles.sectionCount}>{conversations.length.toLocaleString("fa-IR")}</Text>
          </View>
        </View>
        {message ? <Text style={styles.notice}>{message}</Text> : null}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); void loadConversations(); }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.inboxCard, pressed && styles.cardPressed]}
              onPress={() => setSelected(item)}
              accessibilityRole="button"
              accessibilityLabel={`گفتگو درباره ${item.content_title}`}
            >
              <View style={styles.inboxAvatar}><Ionicons name="person-outline" size={20} color="#087f79" /></View>
              <View style={styles.inboxCopy}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.content_title}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{item.last_message_body ?? "گفتگوی فعال"}</Text>
              </View>
              {item.unread_count ? <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{item.unread_count.toLocaleString("fa-IR")}</Text></View> : <Ionicons name="chevron-back" size={18} color="#8a9891" />}
            </Pressable>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.empty}><ActivityIndicator color="#087f79" /><Text style={styles.subtitle}>در حال دریافت گفتگوها...</Text></View>
            ) : message ? (
              <View style={styles.empty}><Ionicons name="cloud-offline-outline" size={36} color="#8a5d13" /><Text style={styles.emptyTitle}>گفتگوها در دسترس نیستند</Text><Pressable style={styles.retryButton} onPress={() => void loadConversations()}><Ionicons name="refresh" size={18} color="#fff" /><Text style={styles.retryText}>تلاش دوباره</Text></Pressable></View>
            ) : (
              <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={38} color="#087f79" /><Text style={styles.emptyTitle}>هنوز گفتگویی شروع نشده</Text><Text style={styles.subtitle}>از صفحه یک آگهی، گفتگوی امن را شروع کنید.</Text></View>
            )
          }
        />
      </View>
    </View>
  );
}

function ChatScreen({
  conversation,
  token,
  userId,
  onBack,
}: {
  conversation: Conversation;
  token: string;
  userId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const load = async () => {
    try {
      setMessages(
        (
          await api<{ data: ChatMessage[] }>(
            `/api/v1/conversations/${conversation.id}/messages`,
            {},
            token,
          )
        ).data,
      );
    } catch {
      setNotice("پیام‌ها بارگذاری نشدند.");
    }
  };
  useEffect(() => {
    void load();
  }, [conversation.id, token]);
  const send = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    try {
      const result = await api<{ data: ChatMessage }>(
        `/api/v1/conversations/${conversation.id}/messages`,
        { method: "POST", body: JSON.stringify({ body: body.trim() }) },
        token,
      );
      setMessages((current) => [...current, result.data]);
      setBody("");
    } catch {
      setNotice("ارسال پیام انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.safe}>
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>بازگشت</Text>
        </Pressable>
        {conversation.participant ? <View style={{ marginTop: 8 }}><Text style={styles.cardTitle}>{conversation.participant.display_name}</Text><Text style={styles.subtitle}>{conversation.participant.city_name ?? "کاربر بازار 4D"}</Text>{conversation.participant.identity_verified ? <View style={styles.identityBadge}><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}</View> : null}
        <Text style={styles.cardTitle}>{conversation.content_title}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender_user_id === userId
                ? styles.messageMine
                : styles.messageTheirs,
            ]}
          >
            <Text style={styles.messageText}>{item.body}</Text>
          </View>
        )}
        onRefresh={load}
        refreshing={false}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={body}
          onChangeText={setBody}
          placeholder="پیام خود را بنویسید"
          multiline
        />
        <Pressable
          style={styles.sendButton}
          disabled={busy || !body.trim()}
          onPress={() => void send()}
        >
          <Text style={styles.primaryText}>ارسال</Text>
        </Pressable>
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}

function ChatScreenV2({
  conversation,
  token,
  userId,
  onBack,
}: {
  conversation: Conversation;
  token: string;
  userId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(Boolean(conversation.is_muted));
  const [blocked, setBlocked] = useState(
    Boolean(conversation.is_blocked_by_me),
  );
  const [notice, setNotice] = useState("");
  const load = async () => {
    try {
      setMessages(
        (
          await api<{ data: ChatMessage[] }>(
            `/api/v1/conversations/${conversation.id}/messages`,
            {},
            token,
          )
        ).data,
      );
    } catch {
      setNotice("پیام‌ها بارگذاری نشدند.");
    }
  };
  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, 15000);
    return () => clearInterval(timer);
  }, [conversation.id, token]);
  const toggleMute = async () => {
    try {
      await api(
        `/api/v1/conversations/${conversation.id}/preferences`,
        { method: "PUT", body: JSON.stringify({ is_muted: !muted }) },
        token,
      );
      setMuted(!muted);
    } catch {
      setNotice("تنظیم اعلان انجام نشد.");
    }
  };
  const toggleBlock = async () => {
    try {
      await api(
        `/api/v1/conversations/${conversation.id}/block`,
        { method: "PUT", body: JSON.stringify({ is_blocked: !blocked }) },
        token,
      );
      setBlocked(!blocked);
    } catch {
      setNotice("تنظیم مسدودسازی انجام نشد.");
    }
  };
  const report = async (id: string) => {
    try {
      await api(
        "/api/v1/reports",
        {
          method: "POST",
          body: JSON.stringify({
            target_type: "message",
            target_id: id,
            reason: "inappropriate",
          }),
        },
        token,
      );
      setNotice("پیام برای بررسی گزارش شد.");
    } catch {
      setNotice("گزارش پیام انجام نشد.");
    }
  };
  const send = async () => {
    if (!body.trim() || busy || blocked) return;
    setBusy(true);
    try {
      const result = await api<{ data: ChatMessage }>(
        `/api/v1/conversations/${conversation.id}/messages`,
        { method: "POST", body: JSON.stringify({ body: body.trim() }) },
        token,
      );
      setMessages((current) => [...current, result.data]);
      setBody("");
    } catch {
      setNotice("ارسال پیام انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.safe}>
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#d7e0da",
          backgroundColor: "#fff",
        }}
      >
        <Pressable onPress={onBack}>
          <Text style={styles.back}>بازگشت</Text>
        </Pressable>
        {conversation.participant ? <View style={{ marginTop: 8 }}><Text style={styles.cardTitle}>{conversation.participant.display_name}</Text><Text style={styles.subtitle}>{conversation.participant.city_name ?? "کاربر بازار 4D"}</Text>{conversation.participant.identity_verified ? <View style={styles.identityBadge}><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}</View> : null}
        <Text style={styles.cardTitle}>{conversation.content_title}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Pressable style={styles.secondary} onPress={() => void toggleMute()}>
            <Text>{muted ? "فعال‌سازی اعلان" : "بی‌صدا کردن"}</Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={() => void toggleBlock()}
          >
            <Text>{blocked ? "رفع مسدودی" : "مسدود کردن"}</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View
            style={[
              {
                maxWidth: "84%",
                padding: 12,
                borderRadius: 14,
                backgroundColor: "#e8efeb",
                alignSelf:
                  item.sender_user_id === userId ? "flex-end" : "flex-start",
              },
              item.sender_user_id === userId
                ? { backgroundColor: "#d9edf0" }
                : null,
            ]}
          >
            <Text>{item.body}</Text>
            {item.sender_user_id === userId ? (
              <Text style={styles.notice}>
                {item.read_by_recipient ? "خوانده شد" : "ارسال شد"}
              </Text>
            ) : null}
            {item.sender_user_id !== userId ? (
              <Pressable onPress={() => void report(item.id)}>
                <Text style={styles.notice}>گزارش پیام</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        onRefresh={load}
        refreshing={false}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          padding: 12,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#d7e0da",
        }}
      >
        <TextInput
          style={[styles.input, { flex: 1, marginTop: 0 }]}
          value={body}
          onChangeText={setBody}
          placeholder={blocked ? "این گفتگو مسدود است" : "پیام خود را بنویسید"}
          editable={!blocked}
        />
        <Pressable
          style={styles.primary}
          disabled={busy || blocked || !body.trim()}
          onPress={() => void send()}
        >
          <Text style={styles.primaryText}>ارسال</Text>
        </Pressable>
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}

function ChatScreenV3({
  conversation,
  token,
  userId,
  onBack,
}: {
  conversation: Conversation;
  token: string;
  userId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [muted, setMuted] = useState(Boolean(conversation.is_muted));
  const [blocked, setBlocked] = useState(Boolean(conversation.is_blocked_by_me));
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const load = async () => {
    try {
      setMessages(
        (
          await api<{ data: ChatMessage[] }>(
            `/api/v1/conversations/${conversation.id}/messages`,
            {},
            token,
          )
        ).data,
      );
    } catch {
      setNotice("پیام‌ها بارگذاری نشدند.");
    }
  };
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => clearInterval(timer);
  }, [conversation.id, token]);
  const send = async (value: string) => {
    if (!value.trim() || busy || blocked) return;
    setBusy(true);
    try {
      const result = await api<{ data: ChatMessage }>(
        `/api/v1/conversations/${conversation.id}/messages`,
        { method: "POST", body: JSON.stringify({ body: value.trim() }) },
        token,
      );
      setMessages((current) => [...current, result.data]);
      setBody("");
    } catch {
      setNotice("ارسال پیام انجام نشد.");
    } finally {
      setBusy(false);
    }
  };
  const toggleMute = async () => {
    try {
      await api(
        `/api/v1/conversations/${conversation.id}/preferences`,
        { method: "PUT", body: JSON.stringify({ is_muted: !muted }) },
        token,
      );
      setMuted((current) => !current);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تنظیم اعلان انجام نشد.");
    }
  };
  const toggleBlock = async () => {
    try {
      await api(
        `/api/v1/conversations/${conversation.id}/block`,
        { method: "PUT", body: JSON.stringify({ is_blocked: !blocked }) },
        token,
      );
      setBlocked((current) => !current);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تنظیم مسدودسازی انجام نشد.");
    }
  };
  const reportMessage = async (id: string) => {
    if (reportedIds.includes(id)) return;
    try {
      await api(
        "/api/v1/reports",
        { method: "POST", body: JSON.stringify({ target_type: "message", target_id: id, reason: "inappropriate" }) },
        token,
      );
      setReportedIds((current) => [...current, id]);
      setNotice("پیام برای بررسی گزارش شد.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "گزارش پیام انجام نشد.");
    }
  };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice("اجازه دسترسی به تصاویر لازم است.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.75,
      base64: true,
    });
    if (result.canceled || !result.assets[0].base64) return;
    setBusy(true);
    try {
      const image = `data:${result.assets[0].mimeType ?? "image/jpeg"};base64,${result.assets[0].base64}`;
      if (image.length > 2_000_000) {
        setNotice("حجم تصویر باید کمتر از ۲ مگابایت باشد.");
        setBusy(false);
        return;
      }
      const upload = await api<{ data: { url: string } }>(
        "/api/v1/media/listing-images",
        { method: "POST", body: JSON.stringify({ image_data_url: image }) },
        token,
      );
      setBusy(false);
      await send(upload.data.url);
    } catch {
      setNotice("ارسال تصویر انجام نشد.");
      setBusy(false);
    }
  };
  const isImage = (value: string) =>
    value.startsWith("data:image/") ||
    /^https?:\/\/[^\s]+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^\s]*)?$/i.test(value);
  return (
    <View style={styles.safe}>
      <View style={styles.chatHeaderModern}>
        <View style={styles.chatTitleRow}>
          <Pressable style={styles.chatBackButton} onPress={onBack}>
            <Ionicons name="arrow-forward" size={20} color="#176b70" />
          </Pressable>
          <View style={styles.chatTitleCopy}>
            <Text style={styles.cardTitle} numberOfLines={1}>{conversation.content_title}</Text>
            <Text style={styles.subtitle}>گفتگوی امن داخل 4D</Text>
            {conversation.participant?.identity_verified ? <View style={styles.identityBadge} accessibilityLabel="هویت این کاربر توسط 4D تأیید شده است."><Ionicons name="shield-checkmark" size={14} color="#176b42" /><Text style={styles.identityBadgeText}>هویت تأیید شده</Text></View> : null}
          </View>
          <View style={styles.secureDot}><Ionicons name="shield-checkmark" size={18} color="#217a45" /></View>
        </View>
        <View style={styles.chatTools}>
          <Pressable style={styles.chatTool} onPress={() => void toggleMute()}>
            <Ionicons name={muted ? "notifications-off" : "notifications-outline"} size={17} color="#52606d" />
            <Text style={styles.chatToolText}>{muted ? "بی‌صدا" : "اعلان"}</Text>
          </Pressable>
          <Pressable style={[styles.chatTool, blocked && styles.chatToolDanger]} onPress={() => void toggleBlock()}>
            <Ionicons name={blocked ? "lock-open-outline" : "ban-outline"} size={17} color={blocked ? "#9c4037" : "#52606d"} />
            <Text style={[styles.chatToolText, blocked && styles.dangerText]}>{blocked ? "رفع مسدودی" : "مسدود"}</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatListModern}
        renderItem={({ item }) => (
          <View style={[styles.messageBubbleModern, item.sender_user_id === userId ? styles.messageMineModern : styles.messageTheirsModern]}>
            {isImage(item.body) ? (
              <Image
                source={{ uri: mediaUrl(item.body) }}
                style={{ width: 190, height: 190, borderRadius: 10 }}
              />
            ) : (
              <Text>{item.body}</Text>
            )}
            {item.sender_user_id === userId ? (
              <Text style={styles.notice}>
                {item.read_by_recipient ? "خوانده شد" : "ارسال شد"}
              </Text>
            ) : (
              <Pressable onPress={() => void reportMessage(item.id)} disabled={reportedIds.includes(item.id)}>
                <Text style={styles.messageMeta}>{reportedIds.includes(item.id) ? "گزارش شد" : "گزارش پیام"}</Text>
              </Pressable>
            )}
          </View>
        )}
        onRefresh={load}
        refreshing={false}
      />
      {blocked ? <View style={styles.blockedNotice}><Ionicons name="ban-outline" size={18} color="#9c4037" /><Text style={styles.dangerText}>این گفتگو توسط شما مسدود شده است.</Text></View> : null}
      <View style={styles.chatComposerModern}>
        <Pressable style={styles.attachButton} disabled={busy || blocked} onPress={() => void pickImage()}>
          <Ionicons name="image-outline" size={21} color="#176b70" />
        </Pressable>
        <TextInput
          style={styles.chatInput}
          value={body}
          onChangeText={setBody}
          placeholder={blocked ? "گفتگو مسدود است" : "پیام خود را بنویسید"}
          editable={!blocked}
          multiline
        />
        <Pressable
          style={[styles.chatSendButton, (busy || blocked || !body.trim()) && styles.primaryDisabled]}
          disabled={busy || blocked || !body.trim()}
          onPress={() => void send(body)}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </Pressable>
      </View>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}

function IdentityDocumentForm({ token, onSubmitted }: { token: string; onSubmitted: () => void }) {
  const [kind, setKind] = useState("national_card");
  const [photo, setPhoto] = useState<string>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const kinds = [["national_card", "کارت ملی"], ["birth_certificate", "شناسنامه"], ["passport", "گذرنامه"]] as const;

  async function choosePhoto() {
    setMessage("");
    setPhoto(undefined);
    try {
      const selection = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.8 });
      if (selection.canceled) return;
      const base64 = selection.assets[0]?.base64;
      if (!base64 || base64.length > Math.floor(5_000_000 * 4 / 3)) {
        setMessage("تصویر خوانا با حجم کمتر از ۵ مگابایت انتخاب کنید.");
        return;
      }
      setPhoto(base64);
    } catch {
      setMessage("باز کردن تصاویر ممکن نشد.");
    }
  }

  async function submit() {
    if (!photo || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/v1/me/identity-verification", {
        method: "POST",
        body: JSON.stringify({ document_type: kind, document_data_url: `data:image/jpeg;base64,${photo}` })
      }, token);
      setPhoto(undefined);
      onSubmitted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال مدرک انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.profileFormCard}>
      <Text style={styles.cardTitle}>ارسال مدرک برای احراز هویت</Text>
      <Text style={styles.subtitle}>تصویر فقط برای بررسی ادمین ارسال می‌شود.</Text>
      {kinds.map(([value, label]) => (
        <Pressable key={value} style={[styles.secondary, kind === value && styles.tabActive]} disabled={busy}
          accessibilityRole="button" accessibilityState={{ selected: kind === value }} onPress={() => setKind(value)}>
          <Text>{label}</Text>
        </Pressable>
      ))}
      <Pressable style={styles.secondary} disabled={busy} onPress={() => void choosePhoto()}>
        <Text>{photo ? "تغییر تصویر انتخاب‌شده" : "انتخاب تصویر مدرک"}</Text>
      </Pressable>
      {photo ? <Pressable style={styles.secondary} disabled={busy} onPress={() => void submit()}>
        <Text>{busy ? "در حال ارسال…" : "ارسال برای بررسی"}</Text>
      </Pressable> : null}
      {message ? <Text accessibilityLiveRegion="polite">{message}</Text> : null}
    </View>
  );
}

function ProfileScreen({ onLogout }: { token: string; onLogout: () => void }) {
  return (
    <View style={styles.safe}>
      <View style={styles.profile}>
        <Text style={styles.title}>پروفایل من</Text>
        <Text style={styles.subtitle}>حساب شما به API واقعی 4D متصل است.</Text>
        <Pressable style={styles.secondary}>
          <Text>آگهی‌های من</Text>
        </Pressable>
        <Pressable style={styles.secondary}>
          <Text>تنظیمات حریم خصوصی</Text>
        </Pressable>
        <Pressable style={styles.danger} onPress={onLogout}>
          <Text style={styles.dangerText}>خروج از حساب</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  routerContent: { flex: 1 },
  flowForm: { paddingBottom: 36 },
  flowHeader: { alignItems: "center", backgroundColor: "#ffffff", borderBottomColor: "#d7e0da", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 10, marginBottom: 12, paddingHorizontal: 4, paddingVertical: 10 },
  flowHeaderCopy: { flex: 1, gap: 2 },
  flowStep: { color: "#087f79", fontSize: 12, fontWeight: "800" },
  adminHeader: { alignItems: "center", backgroundColor: "#ffffff", borderBottomColor: "#d7e0da", borderBottomWidth: 1, flexDirection: "row-reverse", gap: 10, padding: 16 },
  adminContent: { gap: 10, padding: 16 },
  adminCard: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 12, minHeight: 76, padding: 14 },
  adminItems: { backgroundColor: "#f7faf9", borderColor: "#d7e0da", borderTopWidth: 0, borderWidth: 1, gap: 6, padding: 10 },
  adminItem: { backgroundColor: "#ffffff", borderColor: "#e2e9e5", borderRadius: 8, borderWidth: 1, gap: 3, padding: 10 },
  adminItemText: { color: "#263b39", fontSize: 14, fontWeight: "700", textAlign: "right" },
  adminItemMeta: { color: "#718079", fontSize: 11, textAlign: "right" },
  adminDetail: { backgroundColor: "#fbfdfc", borderColor: "#e2e9e5", borderRadius: 8, borderWidth: 1, gap: 6, marginTop: 7, padding: 9 },
  adminDetailTitle: { color: "#052651", fontSize: 14, fontWeight: "900", textAlign: "right" },
  adminDetailText: { color: "#52606d", fontSize: 12, lineHeight: 19, textAlign: "right" },
  adminAttributes: { borderTopColor: "#e2e9e5", borderTopWidth: 1, gap: 4, paddingTop: 5 },
  adminAttribute: { flexDirection: "row-reverse", justifyContent: "space-between" },
  adminAttributeKey: { color: "#718079", fontSize: 12, fontWeight: "700" },
  adminAttributeValue: { color: "#263b39", fontSize: 12, fontWeight: "800" },
  adminActions: { flexDirection: "row-reverse", gap: 6, marginTop: 5 },
  adminAction: { borderColor: "#b9d8ca", borderRadius: 7, borderWidth: 1, minHeight: 34, paddingHorizontal: 10, paddingVertical: 7 },
  adminActionText: { color: "#176b70", fontSize: 12, fontWeight: "800" },
  adminEntry: { alignItems: "center", backgroundColor: "#edf8f1", borderColor: "#b9d8ca", borderRadius: 12, borderWidth: 1, flexDirection: "row-reverse", gap: 10, marginTop: 18, minHeight: 70, padding: 12 },
  adminEntryCopy: { flex: 1, gap: 3 },
  adminIcon: { alignItems: "center", backgroundColor: "#e7f5f1", borderRadius: 10, height: 44, justifyContent: "center", width: 44 },
  selectField: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#cfdad5", borderRadius: 8, borderWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", minHeight: 52, marginTop: 8, paddingHorizontal: 14 },
  selectValue: { color: "#263b39", fontSize: 15, fontWeight: "700" },
  selectPlaceholder: { color: "#87958f", fontWeight: "500" },
  modalBackdrop: { backgroundColor: "rgba(6, 25, 24, 0.42)", flex: 1, justifyContent: "flex-end" },
  pickerSheet: { backgroundColor: "#f7faf9", borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "82%", padding: 16 },
  pickerHeader: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between", paddingBottom: 8 },
  pickerOptions: { gap: 8, paddingBottom: 20, paddingTop: 10 },
  pickerOption: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 10, borderWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", minHeight: 50, paddingHorizontal: 14 },
  pickerOptionActive: { backgroundColor: "#087f79", borderColor: "#087f79" },
  pickerOptionText: { color: "#52606d", fontSize: 15, fontWeight: "700" },
  pickerOptionTextActive: { color: "#ffffff" },
  nav: {
    flexDirection: "row-reverse",
    borderTopWidth: 1,
    borderTopColor: "#d7e0da",
    backgroundColor: "#fff",
    minHeight: 72,
    paddingBottom: 8,
    paddingTop: 7,
    elevation: 10,
    shadowColor: "#052651",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    minHeight: 58,
    justifyContent: "center",
    paddingTop: 2,
  },
  navItemPressed: { opacity: 0.66 },
  navIcon: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 44,
  },
  navIconActive: { backgroundColor: "#e7f5f1" },
  navCreateIcon: {
    backgroundColor: "#052651",
    height: 34,
    marginTop: 0,
    width: 44,
  },
  navCreateIconActive: { backgroundColor: "#08746d" },
  navText: { color: "#718079", fontSize: 12, fontWeight: "700" },
  navActive: { color: "#009688" },
  safe: { flex: 1, backgroundColor: "#f3f6f5" },
  header: {
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 7,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderBottomColor: "#e0e7e3",
    borderBottomWidth: 1,
  },
  headerBrand: { alignItems: "center", flexDirection: "row-reverse", gap: 10 },
  kicker: {
    color: "#052651",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  logo: { color: "#052651", fontSize: 34, fontWeight: "800" },
  region: { color: "#66746d", fontSize: 11, marginTop: 2, textAlign: "right" },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "#edf8f1",
    borderRadius: 8,
    flexDirection: "row-reverse",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  liveDot: {
    backgroundColor: "#2d8650",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  liveText: { color: "#217a45", fontSize: 11, fontWeight: "800" },
  content: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
  marketScrollContent: { paddingBottom: 28 },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  sectionCount: { color: "#66746d", fontSize: 12, fontWeight: "700" },
  marketIntro: {
    alignItems: "flex-end",
    borderColor: "#c8ddd7",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 116,
    overflow: "hidden",
    padding: 14,
  },
  marketBannerImage: { opacity: 0.18 },
  marketBannerText: { color: "#52657a", fontSize: 12, marginTop: 4, textAlign: "right" },
  marketEyebrow: {
    color: "#08746d",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 2,
    textAlign: "right",
  },
  marketCountBadge: {
    backgroundColor: "#edf2f0",
    borderColor: "#d8e3df",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  marketSearch: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#c7d5d0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 13,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  marketSearchInput: {
    color: "#142033",
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingVertical: 0,
  },
  filterToggle: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 10, minHeight: 58, paddingHorizontal: 14 },
  filterToggleCopy: { alignItems: "flex-end", gap: 2 },
  filterSummary: { color: "#718079", fontSize: 11, fontWeight: "600" },
  transportPanel: { backgroundColor: "#f4faf7", borderColor: "#c8ddd5", borderRadius: 8, borderWidth: 1, gap: 8, marginBottom: 12, padding: 12 },
  dynamicFilterCard: { backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, gap: 5, marginBottom: 10, padding: 10 },
  marketFilterCard: { backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, gap: 5, marginBottom: 10, padding: 10 },
  priceFilterRow: { flexDirection: "row-reverse", gap: 8 },
  priceFilterInput: { flex: 1, minHeight: 44 },
  transportHeading: { alignItems: "center", flexDirection: "row-reverse", justifyContent: "space-between" },
  transportModes: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 },
  transportResult: { backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, gap: 5, padding: 10 },
  transportResultTop: { alignItems: "flex-start", flexDirection: "row-reverse", gap: 8, justifyContent: "space-between" },
  transportModeBadge: { backgroundColor: "#e5f2ed", borderRadius: 5, color: "#176b70", fontSize: 11, fontWeight: "800", paddingHorizontal: 7, paddingVertical: 4 },
  transportResultMeta: { color: "#687870", fontSize: 12, textAlign: "right" },
  transportDetailCard: { backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 10, borderWidth: 1, gap: 10, padding: 16 },
  transportRoute: { color: "#087f79", fontSize: 20, fontWeight: "900", textAlign: "right" },
  transportDetailMeta: { color: "#52606d", fontSize: 14, textAlign: "right" },
  marketCategories: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingBottom: 3,
    paddingTop: 11,
  },
  marketCategory: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#c7d5d0",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 13,
  },
  marketCategoryActive: { backgroundColor: "#08746d", borderColor: "#08746d" },
  marketCategoryText: { color: "#52606d", fontSize: 13, fontWeight: "700" },
  marketCategoryTextActive: { color: "#ffffff" },
  marketList: { paddingBottom: 18, paddingTop: 12 },
  marketRow: { flexDirection: "column", gap: 10, marginBottom: 10 },
  marketCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8e3df",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    maxWidth: "100%",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#052651",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  marketThumb: { backgroundColor: "#dceae6", aspectRatio: 1.8, width: "100%" },
  marketPlaceholder: { alignItems: "center", gap: 4, justifyContent: "center" },
  marketPlaceholderText: { color: "#052651", fontSize: 12, fontWeight: "900" },
  marketCardBody: { gap: 5, minHeight: 103, padding: 10 },
  marketCardTitle: {
    color: "#142033",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
    minHeight: 42,
    textAlign: "right",
  },
  marketCardMeta: { color: "#718079", fontSize: 11, textAlign: "right" },
  marketCardFooter: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 4,
    justifyContent: "space-between",
    marginTop: 2,
  },
  marketPrice: { color: "#08746d", flex: 1, fontSize: 12, fontWeight: "900", textAlign: "right" },
  title: {
    color: "#052651",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "right",
  },
  subtitle: {
    color: "#66746d",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
    textAlign: "right",
  },
  list: { gap: 12, paddingVertical: 16 },
  card: {
    backgroundColor: "#fff",
    borderColor: "#e1e8e4",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center",
    elevation: 1,
  },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.995 }] },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: "#e8efeb",
  },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { color: "#009688", fontSize: 22, fontWeight: "800" },
  cardBody: { flex: 1, paddingVertical: 3 },
  cardTitle: {
    color: "#1d2d2a",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "right",
  },
  cardDescription: {
    color: "#718079",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    textAlign: "right",
  },
  price: {
    color: "#176b42",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "right",
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingTop: 72,
  },
  emptyTitle: { color: "#052651", fontSize: 20, fontWeight: "700" },
  retryButton: {
    alignItems: "center",
    backgroundColor: "#087f79",
    borderRadius: 8,
    flexDirection: "row-reverse",
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  retryText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  detail: { padding: 20 },
  backAction: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    gap: 6,
    marginBottom: 16,
  },
  back: { color: "#176b70", fontWeight: "700" },
  hero: { width: "100%", height: 250, borderRadius: 8, marginBottom: 20 },
  detailPlaceholder: {
    alignItems: "center",
    backgroundColor: "#eaf4f1",
    borderColor: "#c8dad2",
    borderWidth: 1,
    justifyContent: "center",
  },
  detailFacts: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 16 },
  detailFact: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailFactText: { color: "#52606d", fontSize: 12, fontWeight: "700" },
  detailMetaRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginBottom: 10, marginTop: 4 },
  detailMediaRow: { flexDirection: "row-reverse", gap: 8, paddingBottom: 12 },
  detailMediaThumb: { borderColor: "#d7e0da", borderRadius: 7, borderWidth: 2, height: 54, overflow: "hidden", width: 66 },
  detailMediaThumbActive: { borderColor: "#f5b335" },
  detailMediaImage: { height: "100%", width: "100%" },
  detailAttributes: { backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, marginTop: 16, overflow: "hidden" },
  detailAttribute: { borderBottomColor: "#e6ece8", borderBottomWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 9 },
  detailAttributeKey: { color: "#718079", fontSize: 12 },
  detailAttributeValue: { color: "#1d2d2a", fontSize: 13, fontWeight: "700" },
  detailActions: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, marginTop: 16 },
  secondaryAction: { alignItems: "center", borderColor: "#c7d5d0", borderRadius: 8, borderWidth: 1, flexDirection: "row-reverse", gap: 5, paddingHorizontal: 10, paddingVertical: 9 },
  secondaryActionActive: { backgroundColor: "#fff2ef", borderColor: "#e9b8ae" },
  secondaryActionText: { color: "#52606d", fontSize: 12, fontWeight: "700" },
  relatedBlock: { borderTopColor: "#dce5e0", borderTopWidth: 1, gap: 8, marginTop: 22, paddingTop: 14 },
  relatedTitle: { color: "#176b70", fontSize: 15, fontWeight: "800", textAlign: "right" },
  relatedItem: { alignItems: "center", backgroundColor: "#ffffff", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, flexDirection: "row-reverse", justifyContent: "space-between", padding: 10 },
  relatedItemTitle: { color: "#1d2d2a", flex: 1, fontSize: 13, fontWeight: "700", textAlign: "right" },
  relatedItemPrice: { color: "#176b42", fontSize: 12, fontWeight: "800", marginStart: 10 },
  sellerCard: { alignItems: "center", backgroundColor: "#f7fbf9", borderColor: "#c8ddd5", borderRadius: 8, borderWidth: 1, flexDirection: "row-reverse", gap: 9, marginTop: 16, padding: 12 },
  identityBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#e9f6ee", borderColor: "#b6d9c0", borderRadius: 999, borderWidth: 1, flexDirection: "row-reverse", gap: 4, marginTop: 6, paddingHorizontal: 8, paddingVertical: 4 },
  identityBadgeText: { color: "#176b42", fontSize: 11, fontWeight: "800" },
  sellerCopy: { flex: 1, gap: 3 },
  sellerName: { color: "#052651", fontSize: 14, fontWeight: "800", textAlign: "right" },
  sellerMeta: { color: "#607168", fontSize: 12, textAlign: "right" },
  storefrontLink: { alignItems: "center", backgroundColor: "#eff8f1", borderColor: "#b8d8d0", borderRadius: 8, flexDirection: "row-reverse", gap: 7, marginTop: 10, padding: 12 },
  storefrontLinkText: { color: "#176b70", flex: 1, fontSize: 13, fontWeight: "800", textAlign: "right" },
  storefrontHero: { alignItems: "center", backgroundColor: "#176b70", borderRadius: 12, gap: 7, marginBottom: 16, padding: 24 },
  storefrontName: { color: "#ffffff", fontSize: 24, fontWeight: "900", textAlign: "center" },
  storefrontDescription: { color: "#e7f5f1", fontSize: 14, lineHeight: 22, textAlign: "center" },
  priceLarge: {
    color: "#176b42",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  detailText: { color: "#53645c", fontSize: 16, lineHeight: 26, marginTop: 18 },
  auth: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    paddingVertical: 20,
  },
  authBrand: { alignItems: "center", marginBottom: 13 },
  authCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dce5e0",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  authModes: {
    backgroundColor: "#edf2ef",
    borderRadius: 8,
    flexDirection: "row-reverse",
    gap: 4,
    padding: 4,
  },
  authMode: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    flexDirection: "row-reverse",
    gap: 6,
    justifyContent: "center",
    minHeight: 42,
  },
  authModeActive: { backgroundColor: "#052651" },
  authModeText: { color: "#52606d", fontSize: 13, fontWeight: "800" },
  authModeTextActive: { color: "#ffffff" },
  fieldLabel: {
    color: "#334640",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 16,
    textAlign: "right",
  },
  otpInput: { fontSize: 22, letterSpacing: 5 },
  otpHint: {
    color: "#66746d",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "right",
  },
  textAction: { alignSelf: "center", marginTop: 12, padding: 6 },
  textActionLabel: { color: "#087f79", fontSize: 13, fontWeight: "800" },
  authNotice: {
    alignItems: "flex-start",
    backgroundColor: "#fff8e8",
    borderColor: "#ead49d",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 7,
    marginTop: 14,
    padding: 10,
  },
  authNoticeText: { flex: 1, marginTop: 0, textAlign: "right" },
  form: { padding: 18, paddingBottom: 34 },
  pageHeading: {
    alignItems: "center",
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 4,
  },
  pageHeadingIcon: {
    alignItems: "center",
    backgroundColor: "#087f79",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pageHeadingCopy: { flex: 1 },
  profile: { padding: 18, paddingBottom: 36, gap: 12 },
  profileHeader: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 12,
    padding: 14,
  },
  profileHeaderCopy: { flex: 1 },
  profileTabs: {
    backgroundColor: "#e8efeb",
    borderRadius: 8,
    flexDirection: "row-reverse",
    gap: 4,
    padding: 4,
  },
  profileTab: {
    alignItems: "center",
    borderRadius: 7,
    flexGrow: 0,
    flexDirection: "row-reverse",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 124,
  },
  profileTabActive: { backgroundColor: "#087f79" },
  profileTabText: { color: "#52606d", fontSize: 13, fontWeight: "800" },
  profileTabTextActive: { color: "#ffffff" },
  profileLoading: { alignItems: "center", gap: 8, paddingVertical: 54 },
  accountStatusGrid: { flexDirection: "row-reverse", gap: 10 },
  accountStatusCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    minHeight: 104,
    padding: 12,
  },
  accountStatusTitle: { color: "#52606d", fontSize: 12, fontWeight: "700", textAlign: "right" },
  accountStatusText: { color: "#1d2d2a", fontSize: 14, fontWeight: "800", textAlign: "right" },
  profileFormCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    elevation: 1,
    shadowColor: "#052651",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
  },
  dynamicFieldsCard: { backgroundColor: "#f4faf7", borderColor: "#c8ddd5", borderRadius: 8, borderWidth: 1, gap: 4, marginTop: 10, padding: 14 },
  notificationPanel: {
    backgroundColor: "#eef7f3",
    borderColor: "#c9ddd6",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    padding: 14,
  },
  listingsSummary: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: 14,
  },
  myListingCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  myListingTop: { alignItems: "center", flexDirection: "row-reverse", gap: 10 },
  myListingThumb: { backgroundColor: "#e8efeb", borderRadius: 7, height: 64, width: 64 },
  myListingCopy: { flex: 1 },
  iconButton: {
    alignItems: "center",
    borderColor: "#e1b9b1",
    borderRadius: 7,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  myListingActions: { flexDirection: "row-reverse", gap: 8 },
  listingAction: {
    alignItems: "center",
    borderColor: "#c8dad2",
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row-reverse",
    gap: 6,
    justifyContent: "center",
    minHeight: 40,
  },
  listingActionText: { color: "#176b70", fontSize: 13, fontWeight: "800" },
  listingDelete: { backgroundColor: "#fff7f5", borderColor: "#e1b9b1" },
  emptyCompact: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 34,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d7e0da",
    borderRadius: 8,
    paddingHorizontal: 14,
    minHeight: 50,
    marginTop: 14,
    fontSize: 16,
  },
  multiline: { minHeight: 120, textAlignVertical: "top", paddingTop: 14 },
  primary: {
    flexDirection: "row-reverse",
    gap: 8,
    backgroundColor: "#052651",
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 16,
  },
  primaryDisabled: { backgroundColor: "#8ca0a4", opacity: 0.72 },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondary: {
    borderWidth: 1,
    borderColor: "#c8dad2",
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "#fff",
  },
  danger: {
    flexDirection: "row-reverse",
    gap: 7,
    borderWidth: 1,
    borderColor: "#e1b9b1",
    borderRadius: 8,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  dangerText: { color: "#9c4037", fontWeight: "700" },
  choiceRow: { flexDirection: "row-reverse", gap: 8, paddingVertical: 10 },
  choiceWrap: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8, paddingVertical: 10 },
  choiceChip: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cfdad5",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  choiceChipActive: { backgroundColor: "#087f79", borderColor: "#087f79" },
  choiceText: { color: "#52606d", fontSize: 13, fontWeight: "700" },
  choiceTextActive: { color: "#ffffff" },
  priceModes: { flexDirection: "row-reverse", gap: 8, marginTop: 10 },
  priceMode: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cfdad5",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  priceModeActive: { backgroundColor: "#087f79", borderColor: "#087f79" },
  imagePicker: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#bfd5cf",
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 8,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 10,
  },
  imagePickerText: { color: "#176b70", fontSize: 14, fontWeight: "800" },
  previewWrap: { marginTop: 14, position: "relative" },
  preview: { width: "100%", height: 190, borderRadius: 8 },
  removeImage: {
    alignItems: "center",
    backgroundColor: "rgba(32,36,42,0.82)",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 34,
  },
  conversation: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  inboxCount: {
    alignItems: "center",
    backgroundColor: "#e7f5f1",
    borderRadius: 8,
    flexDirection: "row-reverse",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  inboxCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d7e0da",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 10,
    minHeight: 76,
    padding: 11,
  },
  inboxAvatar: {
    alignItems: "center",
    backgroundColor: "#e7f5f1",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  inboxCopy: { flex: 1 },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: "#d94f36",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    minWidth: 24,
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: "#ffffff", fontSize: 11, fontWeight: "800" },
  chatHeaderModern: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#d7e0da",
    borderBottomWidth: 1,
    gap: 10,
    padding: 12,
  },
  chatTitleRow: { alignItems: "center", flexDirection: "row-reverse", gap: 9 },
  chatBackButton: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  chatTitleCopy: { flex: 1 },
  secureDot: { alignItems: "center", backgroundColor: "#edf8f1", borderRadius: 8, height: 38, justifyContent: "center", width: 38 },
  chatTools: { flexDirection: "row-reverse", gap: 8 },
  chatTool: {
    alignItems: "center",
    borderColor: "#d7e0da",
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row-reverse",
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 10,
  },
  chatToolDanger: { backgroundColor: "#fff7f5", borderColor: "#e1b9b1" },
  chatToolText: { color: "#52606d", fontSize: 12, fontWeight: "700" },
  chatListModern: { gap: 9, padding: 14, paddingBottom: 24 },
  messageBubbleModern: { borderRadius: 8, maxWidth: "84%", padding: 11 },
  messageMineModern: { alignSelf: "flex-end", backgroundColor: "#dff2ed" },
  messageTheirsModern: { alignSelf: "flex-start", backgroundColor: "#ffffff", borderColor: "#d7e0da", borderWidth: 1 },
  messageMeta: { color: "#8a5d13", fontSize: 11, marginTop: 6 },
  blockedNotice: { alignItems: "center", backgroundColor: "#fff7f5", flexDirection: "row-reverse", gap: 7, justifyContent: "center", padding: 9 },
  chatComposerModern: { alignItems: "flex-end", backgroundColor: "#ffffff", borderTopColor: "#d7e0da", borderTopWidth: 1, flexDirection: "row-reverse", gap: 8, padding: 10 },
  attachButton: { alignItems: "center", borderColor: "#c8dad2", borderRadius: 8, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  chatInput: { backgroundColor: "#f7faf8", borderColor: "#d7e0da", borderRadius: 8, borderWidth: 1, flex: 1, maxHeight: 110, minHeight: 46, paddingHorizontal: 12, textAlign: "right" },
  chatSendButton: { alignItems: "center", backgroundColor: "#052651", borderRadius: 8, height: 46, justifyContent: "center", width: 48 },
  notice: { color: "#8a5d13", marginTop: 12 },
});
