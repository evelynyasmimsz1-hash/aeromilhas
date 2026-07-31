export type MilesProgram = {
  id: string;
  name: string;
  balance: number;
  expiringMiles: number;
  expirationDate?: string;
  lastUpdatedAt: string;
  accountNumber?: string;
  notes?: string;
};

export type CabinClass = "economy" | "premium_economy" | "business";

export type OfferQuality = "good" | "regular" | "high";

export type FlightOffer = {
  id: string;
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  miles: number;
  taxes: number;
  currency: "BRL";
  programName: string;
  cabin: CabinClass;
  quality: OfferQuality;
  imageUrl?: string;
  departureDate?: string;
  returnDate?: string;
  lastUpdatedAt: string;
  international: boolean;
  highlight?: boolean;
  flashDeal?: { endsAt: string };
  /** presente só quando a oferta vem do Supabase: "manual" (admin) ou "auto" (atualização diária) */
  source?: "manual" | "auto";
};

export type MilesTransactionType =
  | "transfer"
  | "redemption"
  | "bonus"
  | "expiration"
  | "adjustment";

export type MilesTransaction = {
  id: string;
  programId: string;
  type: MilesTransactionType;
  amount: number;
  description: string;
  date: string;
  balanceAfter?: number;
};

export type MilesAlertStatus = "active" | "paused" | "matched";

export type MilesAlert = {
  id: string;
  origin: string;
  destination: string;
  maximumMiles: number;
  cabin: CabinClass;
  passengers: number;
  startDate?: string;
  endDate?: string;
  programIds: string[];
  status: MilesAlertStatus;
  lastCheckedAt?: string;
  notificationFrequency: "instant" | "daily" | "weekly";
};

export type NotificationType = "offer" | "expiration" | "transfer" | "balance";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  href?: string;
};

export type SearchFlightResult = {
  id: string;
  programName: string;
  airline: string;
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  miles: number;
  taxes: number;
  cabin: CabinClass;
  availability: "available" | "limited" | "unavailable";
  quality: OfferQuality;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  homeAirport?: string;
  favoriteDestinations?: string[];
};

export type PricingPlan = {
  id: "monthly" | "lifetime";
  name: string;
  price: number | null;
  /** preço com cupom de desconto aplicado, quando houver */
  couponPrice?: number;
  billingPeriod: "mês" | "pagamento único";
  savingsLabel?: string;
  badge?: string;
  features: string[];
};

export type LoyaltyProgramOption = {
  id: string;
  name: string;
};

export type SubscriptionStatus = "incomplete" | "active" | "past_due" | "canceled";

export type Subscription = {
  plan: PricingPlan["id"] | null;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
};

export type ThemeMode = "light" | "system";

export type AppSettings = {
  theme: ThemeMode;
  emailNotifications: boolean;
  pushNotifications: boolean;
  offerAlerts: boolean;
  expirationAlerts: boolean;
  transferPromotions: boolean;
};
