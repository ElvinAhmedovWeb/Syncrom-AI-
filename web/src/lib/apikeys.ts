// ============================================================
// API açarları (klient tərəfi).
//
// Açarın ÖZÜ heç yerdə saxlanılmır — nə serverdə, nə burada. Server onu
// imzalanmış token kimi yaradır və yalnız bir dəfə qaytarır; istifadəçi
// kopyalamalıdır. Burada yalnız METADATA saxlanılır (ad, id, tarixlər) ki,
// istifadəçi hansı açarları buraxdığını görsün.
// ============================================================

import { getIdToken } from "./firebase";

export interface ApiKeyRecord {
  keyId: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

export interface IssuedKey extends ApiKeyRecord {
  /** Yalnız yaradılan anda mövcuddur — bir daha göstərilə bilməz */
  key: string;
}

const STORE_KEY = "syncrom_api_keys";

export function loadKeyRecords(): ApiKeyRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(raw) ? (raw as ApiKeyRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveKeyRecords(list: ApiKeyRecord[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 50)));
}

export class NotSignedInError extends Error {}

export async function issueKey(name: string): Promise<IssuedKey> {
  const idToken = await getIdToken();
  if (!idToken) throw new NotSignedInError();

  const res = await fetch("/api/keys/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Açar yaradıla bilmədi");
  }
  const issued = (await res.json()) as IssuedKey;

  const rec: ApiKeyRecord = {
    keyId: issued.keyId,
    name: issued.name || name,
    createdAt: issued.createdAt,
    expiresAt: issued.expiresAt,
  };
  saveKeyRecords([rec, ...loadKeyRecords().filter((k) => k.keyId !== rec.keyId)]);
  return { ...issued, ...rec };
}

/** Yalnız yerli qeydi silir — açarın özü müddəti bitənə qədər işləyir */
export function forgetKeyRecord(keyId: string): ApiKeyRecord[] {
  const next = loadKeyRecords().filter((k) => k.keyId !== keyId);
  saveKeyRecords(next);
  return next;
}
