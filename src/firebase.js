import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyDeuWu3MLrIah_dxePw6aAEEXoCcb40UGI",
  authDomain:        "project-calcutta.firebaseapp.com",
  databaseURL:       "https://project-calcutta-default-rtdb.firebaseio.com",
  projectId:         "project-calcutta",
  storageBucket:     "project-calcutta.firebasestorage.app",
  messagingSenderId: "850656022198",
  appId:             "1:850656022198:web:c65415d7ebdb66493de017",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export async function storageGet(key) {
  try {
    const snapshot = await get(ref(db, `calcutta/${key}`));
    if (snapshot.exists()) {
      return { value: snapshot.val() };
    }
    return null;
  } catch (e) {
    console.error("storageGet error", e);
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    await set(ref(db, `calcutta/${key}`), value);
    return { key, value };
  } catch (e) {
    console.error("storageSet error", e);
    return null;
  }
}

export function storageSubscribe(key, callback) {
  const unsubscribe = onValue(ref(db, `calcutta/${key}`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
  return unsubscribe;
}
