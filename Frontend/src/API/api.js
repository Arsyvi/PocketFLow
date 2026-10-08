const API_URL = "http://127.0.0.1:8000/api";

// API Goal
export async function getGoals() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/goals`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data goals");
  }

  return response.json();
}

export async function addAmount(
  goalId,
  { amount = null, pocket_id = null, sources = null },
) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/goals/${goalId}/add-money`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      pocket_id,
      sources,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal menambahkan dana");
  }

  return data;
}

export async function CreateGoal(goal) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/goals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(goal),
  });

  if (!response.ok) {
    throw new Error("Gagal Membuat Goal");
  }

  return response.json();
}

export async function DeleteGoal(goalId, { pocket_id = null } = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/goals/${goalId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pocket_id }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal Menghapus Goal");
  }
  return data;
}

export async function getGoalContributions(goalId) {
  const response = await fetch(`${API_URL}/goals/${goalId}/contributions`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal mendapatkan asal dana goal");
  }

  return {
    current_amount: Number(data.current_amount ?? 0),
    tracked: Number(data.tracked ?? 0),
    remainder: Number(data.remainder ?? 0),
    contributions: Array.isArray(data.contributions) ? data.contributions : [],
  };
}

// API Auth

export async function userRegister(userData) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal Membuat Registrasi");
  }

  return data;
}

export async function userLogin(dataLogin) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(dataLogin),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login Gagal");
  }

  return data;
}

export async function userLogout() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout Gagal");
  }

  return data;
}

export async function updateProfile({ name }) {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal memperbarui profil");
  }

  return data.user ?? data;
}

export async function changePassword({
  current_password,
  password,
  password_confirmation,
}) {
  const response = await fetch(`${API_URL}/profile/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ current_password, password, password_confirmation }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengubah kata sandi");
  }

  return data;
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengirim link pengaturan ulang");
  }

  return data;
}

export async function resetPassword({
  token,
  email,
  password,
  password_confirmation,
}) {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ token, email, password, password_confirmation }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengatur ulang kata sandi");
  }

  return data;
}

export async function getPockets() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/pockets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mendapatkan Pocket");
  }

  return data;
}

let pocketsCache = null;
let pocketsInflight = null;

function normalizePockets(data) {
  return Array.isArray(data) ? data : (data.data ?? []);
}

export function peekPocketsCache() {
  return pocketsCache;
}

export function invalidatePocketsCache() {
  pocketsCache = null;
}

export function refreshPocketsCache() {
  if (pocketsInflight) return pocketsInflight;
  pocketsInflight = getPockets()
    .then((data) => {
      pocketsCache = normalizePockets(data);
      return pocketsCache;
    })
    .finally(() => {
      pocketsInflight = null;
    });
  return pocketsInflight;
}

export function getPocketsCached() {
  if (pocketsInflight) return pocketsInflight;
  if (pocketsCache) {
    // Sajikan cache langsung, refresh diam-diam di background
    refreshPocketsCache().catch(() => {});
    return Promise.resolve(pocketsCache);
  }
  return refreshPocketsCache();
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createPocket(name, { icon = null, color = null } = {}) {
  const response = await fetch(`${API_URL}/pockets`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, icon, color }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal membuat Pocket");
  }

  return data.data ?? data;
}

export async function updatePocket(
  pocketId,
  { name, icon = null, color = null },
) {
  const response = await fetch(`${API_URL}/pockets/${pocketId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name, icon, color }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal memperbarui Pocket");
  }

  return data.data ?? data;
}

export async function deletePocket(pocketId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/pockets/${pocketId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal menghapus Pocket");
  }

  return data;
}

// API Transactions (pemasukan & pengeluaran)

let transactionsInflight = null;

export async function getTransactions() {
  if (transactionsInflight) return transactionsInflight;
  transactionsInflight = (async () => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mendapatkan transaksi");
    }

    return Array.isArray(data) ? data : (data.data ?? []);
  })().finally(() => {
    transactionsInflight = null;
  });
  return transactionsInflight;
}

export async function createTransaction({
  pocket_id,
  type,
  amount,
  description,
}) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ pocket_id, type, amount, description }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mencatat transaksi");
  }

  return data.data ?? data;
}

export async function deleteTransaction(transactionId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal menghapus transaksi");
  }

  return data;
}
