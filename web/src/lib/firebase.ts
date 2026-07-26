import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type { Chat, ChatMessage } from "../types";
import type { MemoryFact } from "./memory";

const firebaseConfig = {
  apiKey: "AIzaSyD2GNLUEGJCr7d_ux6WCYUOUbD-NYgSwt0",
  authDomain: "syncromai.firebaseapp.com",
  projectId: "syncromai",
  storageBucket: "syncromai.firebasestorage.app",
  messagingSenderId: "416301601261",
  appId: "1:416301601261:web:90f58e0d54f29a637f97e4",
  measurementId: "G-FNV07D6QM7",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initFailed = false;

function ensureInit(): boolean {
  if (initFailed) return false;
  if (app && auth && db) return true;
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    return true;
  } catch (e) {
    console.warn("Firebase başlaya bilmədi:", e);
    initFailed = true;
    return false;
  }
}

export function isFirebaseReady(): boolean {
  return ensureInit();
}

export function watchAuth(cb: (user: User | null) => void): () => void {
  if (!ensureInit() || !auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function loginWithGoogle(): Promise<void> {
  if (!ensureInit() || !auth) throw new Error("Firebase hazır deyil");
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  if (!ensureInit() || !auth) throw new Error("Firebase hazır deyil");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<void> {
  if (!ensureInit() || !auth) throw new Error("Firebase hazır deyil");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
}

export async function logout(): Promise<void> {
  if (!ensureInit() || !auth) return;
  await signOut(auth);
}

// Şəkilləri Firestore-a saxlamırıq (~1MB sənəd limiti) — yüngül qeydlə əvəz edilir.
function sanitizeMessagesForStorage(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => {
    if (!m.image) return m;
    const note = "[🖼️ İstifadəçi bir şəkil əlavə etdi]";
    return { role: m.role, content: m.content ? `${m.content}\n\n${note}` : note };
  });
}

export async function loadUserChats(uid: string): Promise<Chat[]> {
  if (!ensureInit() || !db) return [];
  const q = query(collection(db, "users", uid, "chats"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Chat, "id">) }));
}

export async function saveChat(uid: string, chat: Chat): Promise<string> {
  if (!ensureInit() || !db) throw new Error("Firebase hazır deyil");
  const payload = {
    title: chat.title,
    messages: sanitizeMessagesForStorage(chat.messages),
    modelId: chat.modelId ?? null,
    updatedAt: chat.updatedAt,
  };
  if (!chat.id) {
    const ref = await addDoc(collection(db, "users", uid, "chats"), {
      ...payload,
      createdAt: Date.now(),
    });
    return ref.id;
  }
  await updateDoc(doc(db, "users", uid, "chats", chat.id), payload);
  return chat.id;
}

export async function deleteChatDoc(uid: string, chatId: string): Promise<void> {
  if (!ensureInit() || !db) return;
  await deleteDoc(doc(db, "users", uid, "chats", chatId));
}

// ---------- Yaddaş ----------
// Bütün faktlar bir sənəddə saxlanılır (users/{uid}/meta/memory) — sayı
// azdır (maks. 40), ona görə ayrı kolleksiya lazım deyil və bir oxu/yazma
// kifayət edir.
export async function loadUserMemories(uid: string): Promise<MemoryFact[]> {
  if (!ensureInit() || !db) return [];
  try {
    const snap = await getDoc(doc(db, "users", uid, "meta", "memory"));
    const facts = snap.exists() ? (snap.data().facts as MemoryFact[] | undefined) : undefined;
    return Array.isArray(facts) ? facts : [];
  } catch (e) {
    console.warn("Yaddaş yüklənmədi:", e);
    return [];
  }
}

export async function saveUserMemories(uid: string, facts: MemoryFact[]): Promise<void> {
  if (!ensureInit() || !db) return;
  try {
    await setDoc(doc(db, "users", uid, "meta", "memory"), { facts, updatedAt: Date.now() });
  } catch (e) {
    console.warn("Yaddaş saxlanılmadı:", e);
  }
}

export const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-email": "E-poçt ünvanı düzgün deyil.",
  "auth/user-not-found": "Bu e-poçt ilə hesab tapılmadı.",
  "auth/wrong-password": "Şifrə yanlışdır.",
  "auth/invalid-credential": "E-poçt və ya şifrə yanlışdır.",
  "auth/email-already-in-use": "Bu e-poçt artıq qeydiyyatdan keçib.",
  "auth/weak-password": "Şifrə çox zəifdir (ən azı 6 simvol).",
  "auth/too-many-requests": "Çox cəhd edildi. Bir az sonra yenidən yoxla.",
  "auth/popup-closed-by-user": "Pəncərə bağlandı. Yenidən cəhd et.",
  "auth/network-request-failed": "Şəbəkə xətası. İnternetini yoxla.",
};

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  return (code && AUTH_ERRORS[code]) || "Xəta baş verdi. Yenidən cəhd et.";
}

export type { User };
