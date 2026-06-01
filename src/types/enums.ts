export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum Weekday {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

export enum OwnershipType {
  GLOBAL = "global",
  LOCAL = "local",
}

export enum ScheduleStatus {
  ACTIVE = "active",
  DRAFT = "draft",
  PAUSED = "paused",
}

export enum AdCategory {
  // Core
  ENTERTAINMENT = "entertainment",
  EDUCATION = "education",
  SPORTS = "sports",
  TECHNOLOGY = "technology",
  BUSINESS = "business",
  FINANCE = "finance",
  HEALTH = "health",
  FITNESS = "fitness",
  LIFESTYLE = "lifestyle",

  // Food & Hospitality
  FOOD = "food",
  RESTAURANT = "restaurant",
  FAST_FOOD = "fast_food",
  BEVERAGES = "beverages",
  HOSPITALITY = "hospitality",
  HOTELS = "hotels",
  TOURISM = "tourism",
  TRAVEL = "travel",

  // Retail & Commerce
  RETAIL = "retail",
  ECOMMERCE = "ecommerce",
  FASHION = "fashion",
  BEAUTY = "beauty",
  LUXURY = "luxury",
  JEWELRY = "jewelry",
  ELECTRONICS = "electronics",
  HOME_APPLIANCES = "home_appliances",
  FURNITURE = "furniture",

  // Automotive & Transport
  AUTOMOTIVE = "automotive",
  MOTORCYCLES = "motorcycles",
  LOGISTICS = "logistics",
  TRANSPORT = "transport",
  RIDE_SHARING = "ride_sharing",

  // Real Estate & Infrastructure
  REAL_ESTATE = "real_estate",
  CONSTRUCTION = "construction",
  INTERIOR_DESIGN = "interior_design",

  // Media & Communication
  MEDIA = "media",
  NEWS = "news",
  SOCIAL_MEDIA = "social_media",
  TELECOMMUNICATIONS = "telecommunications",

  // Events & Promotions
  EVENTS = "events",
  CONCERTS = "concerts",
  FESTIVALS = "festivals",
  PROMOTIONS = "promotions",
  DISCOUNTS = "discounts",

  // Public & Government
  GOVERNMENT = "government",
  PUBLIC_SERVICE = "public_service",
  NON_PROFIT = "non_profit",
  CHARITY = "charity",

  // Finance & Services
  BANKING = "banking",
  INSURANCE = "insurance",
  FINTECH = "fintech",
  INVESTMENT = "investment",

  // Education (extended)
  ONLINE_COURSES = "online_courses",
  SCHOOLS = "schools",
  UNIVERSITIES = "universities",
  TRAINING = "training",

  // Health (extended)
  PHARMACY = "pharmacy",
  MEDICAL_SERVICES = "medical_services",
  WELLNESS = "wellness",
  MENTAL_HEALTH = "mental_health",

  // Kids & Family
  KIDS = "kids",
  TOYS = "toys",
  FAMILY = "family",

  // Agriculture (useful for your domain)
  AGRICULTURE = "agriculture",
  FARMING = "farming",
  LIVESTOCK = "livestock",
  AGRITECH = "agritech",

  // Misc
  GAMING = "gaming",
  MUSIC = "music",
  MOVIES = "movies",
  STREAMING = "streaming",
  ART = "art",
  CULTURE = "culture",

  // Catch-all
  OTHER = "other",
}

// Fallback category lists when no location station is designated
export const DEFAULT_AD_CATEGORIES: AdCategory[] = Object.values(AdCategory);
