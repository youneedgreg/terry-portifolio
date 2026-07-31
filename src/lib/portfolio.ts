import { Query, ID } from "appwrite";
import {
  databases,
  storage,
  APPWRITE_DATABASE_ID,
  BUCKET_PORTFOLIO,
  COLLECTIONS,
  getFileUrl,
} from "@/integrations/appwrite/client";

export type Photo = {
  id: string;
  url: string;
  caption: string;
  credit: string;
  section: string;
  sort_order: number;
  is_visible: boolean;
  show_on_home: boolean;
};

export type ContentMap = Record<string, string>;

export type Client = {
  id: string;
  name: string;
  logo_url: string;
  link: string;
  sort_order: number;
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  sort_order: number;
};

export const CONTENT_DEFAULTS: ContentMap = {
  nav_label: "Portfolio Vol. 01",
  first_name: "Terry",
  last_name: "Masila",
  hero_url: "",
  editorial_title: "Editorial",
  measurements_height: "179 / 5'10.5\"",
  measurements_bust: '82 / 32.5"',
  measurements_waist: '60 / 23.5"',
  measurements_hips: '88 / 34.5"',
  measurements_hair: "Dark brown",
  measurements_eyes: "Hazel",
  digitals_url: "",
  agency_name: "Elite Model Management Worldwide",
  agency_cities: "New York • Paris • Milan",
  contact_email: "terrymasila90@gmail.com",
};

Object.assign(CONTENT_DEFAULTS, {
  clients_title: "Selected clients",
  gallery_title: "The Gallery",
  gallery_intro: "A complete archive of editorial, campaign and runway work.",
  social_title: "Elsewhere",
});

Object.assign(CONTENT_DEFAULTS, {
  about_title: "About",
  about_body:
    "Belgian-born, based between Paris and New York. Editorial and campaign work with a quiet, sculptural presence — equally at home on runway, in beauty and in motion.",
  clients_page_intro: "Brands, houses and publications from the archive.",
});

/** Storage paths are served directly or through Appwrite storage URL helper. */
export function photoSrc(value: string, fallback = ""): string {
  if (!value) return fallback;
  if (value.startsWith("http") || value.startsWith("/") || value.startsWith("data:")) return value;
  return getFileUrl(value);
}

export async function fetchContent(): Promise<ContentMap> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.SITE_CONTENT);
    const map: ContentMap = { ...CONTENT_DEFAULTS };
    for (const row of res.documents) map[row.key] = row.value;
    return map;
  } catch (error) {
    console.warn("[Appwrite] fetchContent warning:", error);
    return { ...CONTENT_DEFAULTS };
  }
}

export async function fetchPhotos(): Promise<Photo[]> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.PHOTOS, [
      Query.orderAsc("sort_order"),
      Query.limit(100),
    ]);
    return res.documents.map((doc) => ({
      id: doc.$id,
      url: doc.url || "",
      caption: doc.caption || "",
      credit: doc.credit || "",
      section: doc.section || "editorial",
      sort_order: doc.sort_order ?? 0,
      is_visible: doc.is_visible ?? true,
      show_on_home: doc.show_on_home ?? false,
    }));
  } catch (error) {
    console.warn("[Appwrite] fetchPhotos warning:", error);
    return [];
  }
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, [
      Query.orderAsc("sort_order"),
      Query.limit(100),
    ]);
    return res.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name || "",
      logo_url: doc.logo_url || "",
      link: doc.link || "",
      sort_order: doc.sort_order ?? 0,
    }));
  } catch (error) {
    console.warn("[Appwrite] fetchClients warning:", error);
    return [];
  }
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  try {
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.SOCIAL_LINKS, [
      Query.orderAsc("sort_order"),
      Query.limit(100),
    ]);
    return res.documents.map((doc) => ({
      id: doc.$id,
      platform: doc.platform || "",
      url: doc.url || "",
      sort_order: doc.sort_order ?? 0,
    }));
  } catch (error) {
    console.warn("[Appwrite] fetchSocialLinks warning:", error);
    return [];
  }
}

export async function saveContent(key: string, value: string) {
  try {
    await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SITE_CONTENT, key, { value });
  } catch {
    await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SITE_CONTENT, key, {
      key,
      value,
    });
  }
}

export async function uploadPhotoFile(file: File): Promise<string> {
  const uploaded = await storage.createFile(BUCKET_PORTFOLIO, ID.unique(), file);
  return uploaded.$id;
}
