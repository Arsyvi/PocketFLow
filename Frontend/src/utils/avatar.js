export const LEGACY_AVATAR_KEY = "pocketflow:avatar";

export function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) ?? null;
  } catch {
    return null;
  }
}

function userSuffix(user) {
  if (user?.id !== undefined && user?.id !== null && String(user.id) !== "") {
    return `uid:${String(user.id)}`;
  }
  if (user?.email) {
    return `email:${String(user.email).toLowerCase()}`;
  }
  return null;
}

export function avatarKeyFor(user) {
  const suffix = userSuffix(user);
  if (!suffix) return LEGACY_AVATAR_KEY;
  return `pocketflow:avatar:${suffix}`;
}

export function getCurrentAvatarKey() {
  return avatarKeyFor(readStoredUser());
}

export function getCurrentAvatar() {
  try {
    return localStorage.getItem(getCurrentAvatarKey());
  } catch {
    return null;
  }
}

export function setCurrentAvatar(dataUrl) {
  localStorage.setItem(getCurrentAvatarKey(), dataUrl);
}

export function removeCurrentAvatar() {
  try {
    localStorage.removeItem(getCurrentAvatarKey());
  } catch {
    /* abaikan */
  }
}

// Hapus key global lama supaya user baru mulai dengan foto kosong.
// Jangan migrasi otomatis: isi legacy milik user lain tidak boleh bocor.
export function clearLegacyAvatar() {
  try {
    localStorage.removeItem(LEGACY_AVATAR_KEY);
  } catch {
    /* abaikan */
  }
}

export function notifyUserUpdated() {
  window.dispatchEvent(new Event("user-updated"));
}
