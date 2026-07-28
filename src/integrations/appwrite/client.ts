import { Client, Account, Databases, Storage } from "appwrite";

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || "terry-portfolio";

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "portfolio_db";
export const BUCKET_PORTFOLIO = import.meta.env.VITE_APPWRITE_BUCKET_ID || "portfolio";

export const COLLECTIONS = {
  PHOTOS: import.meta.env.VITE_APPWRITE_COLLECTION_PHOTOS || "photos",
  CLIENTS: import.meta.env.VITE_APPWRITE_COLLECTION_CLIENTS || "clients",
  SOCIAL_LINKS: import.meta.env.VITE_APPWRITE_COLLECTION_SOCIAL_LINKS || "social_links",
  SITE_CONTENT: import.meta.env.VITE_APPWRITE_COLLECTION_SITE_CONTENT || "site_content",
};

export const client = new Client();

if (PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export function getFileUrl(fileId: string): string {
  if (!fileId) return "";
  if (fileId.startsWith("http://") || fileId.startsWith("https://")) return fileId;
  return `${ENDPOINT}/storage/buckets/${BUCKET_PORTFOLIO}/files/${fileId}/view?project=${PROJECT_ID}`;
}
