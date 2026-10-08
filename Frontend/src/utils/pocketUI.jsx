import {
    Wallet,
    PiggyBank,
    TriangleAlert,
    Briefcase,
    ShoppingCart,
    House,
    Plane,
    HeartHandshake,
} from "lucide-react";

export const POCKET_ICON_OPTIONS = [
    { key: "wallet", label: "Dompet", Icon: Wallet },
    { key: "piggy", label: "Tabungan", Icon: PiggyBank },
    { key: "alert", label: "Darurat", Icon: TriangleAlert },
    { key: "briefcase", label: "Kerja", Icon: Briefcase },
    { key: "cart", label: "Belanja", Icon: ShoppingCart },
    { key: "home", label: "Rumah", Icon: House },
    { key: "plane", label: "Liburan", Icon: Plane },
    { key: "heart", label: "Kesehatan", Icon: HeartHandshake },
];


export const POCKET_COLOR_OPTIONS = [
    { key: "blue", label: "Biru" },
    { key: "green", label: "Hijau" },
    { key: "yellow", label: "Kuning" },
    { key: "purple", label: "Ungu" },
    { key: "red", label: "Merah" },
    { key: "cyan", label: "Toska" },
];

// Tebakan otomatis dari nama (dipakai untuk fallback & auto-suggest di form).
const NAME_GUESS = [
    { icon: "wallet", color: "blue", match: /harian|dompet|tunai|cash|belanja|operasional/i },
    { icon: "piggy", color: "green", match: /tabung|nabung|saving|celeng/i },
    { icon: "alert", color: "yellow", match: /darurat|emergency|mendesak/i },
];

const ICON_MAP = Object.fromEntries(POCKET_ICON_OPTIONS.map((o) => [o.key, o.Icon]));
const COLOR_KEYS = new Set(POCKET_COLOR_OPTIONS.map((o) => o.key));

// Nama pocket bawaan (tidak bisa dihapus dari pocket page).
const DEFAULT_POCKET_NAMES = ["dana harian", "uang harian", "tabungan", "dana darurat"];

export function isDefaultPocket(pocket) {
    return DEFAULT_POCKET_NAMES.includes(String(pocket?.name ?? "").trim().toLowerCase());
}

export const DEFAULT_POCKET_ORDER = ["uang harian", "dana harian", "tabungan", "dana darurat"];

export function sortDefaultPocketsFirst(list) {
    const rank = (pocket) => {
        const idx = DEFAULT_POCKET_ORDER.indexOf(String(pocket?.name ?? "").trim().toLowerCase());
        return idx === -1 ? DEFAULT_POCKET_ORDER.length : idx;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
}

function hashId(id) {
    const str = String(id ?? "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function guessFromName(name) {
    const found = NAME_GUESS.find((g) => g.match.test(String(name ?? "")));
    return found ? { icon: found.icon, color: found.color } : null;
}

// Saran icon+warna dari nama (untuk auto-suggest di form create).
export function suggestPocketUI(name) {
    return guessFromName(name) ?? { icon: "wallet", color: "blue" };
}

// Ambil seleksi tersimpan dari pocket (untuk inisialisasi form edit).
export function resolvePocketSelection(pocket) {
    const storedIcon = ICON_MAP[pocket?.icon] ? pocket.icon : null;
    const storedColor = COLOR_KEYS.has(pocket?.color) ? pocket.color : null;
    if (storedIcon && storedColor) {
        return { icon: storedIcon, color: storedColor };
    }
    const guessed = guessFromName(pocket?.name);
    return {
        icon: storedIcon ?? guessed?.icon ?? "wallet",
        color: storedColor ?? guessed?.color ?? "blue",
    };
}

// Mengembalikan { color, Icon } yang stabil untuk pocket yang sama.
// Prioritas: pilihan tersimpan di DB -> tebakan nama -> hash(id).
export function getPocketUI(pocket, index = 0) {
    const guessed = guessFromName(pocket?.name);
    const Icon =
        ICON_MAP[pocket?.icon] ??
        ICON_MAP[guessed?.icon] ??
        POCKET_ICON_OPTIONS[Math.abs(hashId(pocket?.id ?? index)) % POCKET_ICON_OPTIONS.length].Icon;
    let color = COLOR_KEYS.has(pocket?.color) ? pocket.color : (guessed?.color ?? null);
    if (!color) {
        color = POCKET_COLOR_OPTIONS[Math.abs(hashId(pocket?.id ?? index)) % POCKET_COLOR_OPTIONS.length].key;
    }
    return { color, Icon };
}

// Helper: pocket backend + UI frontend dalam satu objek.
// title = name, amount = balance (number), + color & Icon.
export function enrichPocket(pocket, index = 0) {
    const { color, Icon } = getPocketUI(pocket, index);
    return {
        ...pocket,
        title: pocket?.name ?? "",
        amount: Number(pocket?.balance ?? 0),
        color,
        Icon,
    };
}

export function formatPocketAmount(value) {
    return Number(value ?? 0).toLocaleString("id-ID");
}
