import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Pocketcard from "./Pocketcard";
import { PocketDashboardSkeleton } from "../PocketSkeleton";
import { enrichPocket, sortDefaultPocketsFirst } from "../../utils/pocketUI";
import { usePockets } from "../../hooks/usePockets";

const MAX_VISIBLE = 3;
const LEGACY_STORAGE_KEY = "pocketflow:dashboardPockets";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) ?? null;
  } catch {
    return null;
  }
}

function dashboardKeyFor(user) {
  if (user?.id !== undefined && user?.id !== null && String(user.id) !== "") {
    return `pocketflow:dashboardPockets:uid:${String(user.id)}`;
  }
  if (user?.email) {
    return `pocketflow:dashboardPockets:email:${String(user.email).toLowerCase()}`;
  }
  return LEGACY_STORAGE_KEY;
}

function getDashboardKey() {
  return dashboardKeyFor(readStoredUser());
}

function loadIdsFor(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

function loadStoredIds() {
  // Utamakan pilihan milik user ini; fallback legacy hanya untuk migrasi
  // (id pocket unik per user, jadi pilihan user lain otomatis terbuang saat pruning).
  const key = getDashboardKey();
  return loadIdsFor(key) ?? (key !== LEGACY_STORAGE_KEY ? loadIdsFor(LEGACY_STORAGE_KEY) : null);
}

function saveIds(ids) {
  try {
    localStorage.setItem(getDashboardKey(), JSON.stringify(ids));
  } catch {
    /* abaikan */
  }
}

function Pocketlist({ pockets: pocketsProp, loading: loadingProp }) {
  const { pockets: pocketsState, loading: loadingState } = usePockets();

  const controlled = pocketsProp !== undefined;

  const pockets = controlled ? pocketsProp : pocketsState;
  const loading = controlled ? loadingProp : loadingState;

  const [selectedIds, setSelectedIds] = useState(loadStoredIds);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const closePanel = () => {
    setPanelOpen(false);
    triggerRef.current?.focus();
  };

  // Kalau akun berganti tanpa remount, muat ulang pilihan milik akun itu.
  useEffect(() => {
    const onUserChange = () => {
      setSelectedIds(loadStoredIds());
    };
    window.addEventListener("user-updated", onUserChange);
    window.addEventListener("storage", onUserChange);
    return () => {
      window.removeEventListener("user-updated", onUserChange);
      window.removeEventListener("storage", onUserChange);
    };
  }, []);

  const activeIds = useMemo(() => {
    const existing = new Set(pockets.map((p) => String(p.id)));
    const base =
      selectedIds ?? pockets.slice(0, MAX_VISIBLE).map((p) => String(p.id));
    const pruned = base.filter((id) => existing.has(id));
    if (pruned.length > 0) return pruned;
    return pockets.slice(0, MAX_VISIBLE).map((p) => String(p.id));
  }, [pockets, selectedIds]);

  // Bekukan pilihan awal supaya pocket baru TIDAK otomatis masuk dashboard
  // dan menggeser pocket yang sudah dipilih. Pilihan hanya berubah saat
  // user mencentang manual di panel, atau saat pocket yang dipilih dihapus.
  // Sinkronisasi sekali dari async data + localStorage memang butuh effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (pockets.length === 0) return;
    if (!selectedIds) {
      const initial = pockets.slice(0, MAX_VISIBLE).map((p) => String(p.id));
      setSelectedIds(initial);
      saveIds(initial);
      return;
    }
    const existing = new Set(pockets.map((p) => String(p.id)));
    const pruned = selectedIds.filter((id) => existing.has(id));
    if (pruned.length !== selectedIds.length) {
      if (pruned.length > 0) {
        setSelectedIds(pruned);
        saveIds(pruned);
      } else {
        const fallback = pockets.slice(0, MAX_VISIBLE).map((p) => String(p.id));
        setSelectedIds(fallback);
        saveIds(fallback);
      }
    }
  }, [pockets, selectedIds]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!panelOpen) return;
    panelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  // Kunci scroll halaman selama bottom sheet terbuka di HP,
  // supaya daftar kategori tidak ikut kegeser halaman belakang.
  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [panelOpen]);

  const visible = useMemo(() => {
    const wanted = new Set(activeIds);
    return sortDefaultPocketsFirst(
      pockets.filter((p) => wanted.has(String(p.id))),
    ).slice(0, MAX_VISIBLE);
  }, [pockets, activeIds]);

  const hiddenCount = Math.max(pockets.length - visible.length, 0);

  const panelPockets = useMemo(
    () => sortDefaultPocketsFirst(pockets),
    [pockets],
  );

  const togglePocket = (id) => {
    const key = String(id);
    const current = [...activeIds];
    if (current.includes(key)) {
      if (current.length <= 1) return;
      const next = current.filter((v) => v !== key);
      setSelectedIds(next);
      saveIds(next);
    } else {
      if (current.length >= MAX_VISIBLE) return;
      const next = [...current, key];
      setSelectedIds(next);
      saveIds(next);
    }
  };

  if (loading) {
    return <PocketDashboardSkeleton count={MAX_VISIBLE} />;
  }

  if (pockets.length === 0) {
    return (
      <div className="pockets-section">
        <div className="empty-state-pocket">
          <p>
            Belum ada pocket. Buat pocket dulu untuk mulai mencatat keuangan.
          </p>
          <Link className="btn-cta-recent" to="/pocket">
            Buat pocket
          </Link>
        </div>
      </div>
    );
  }

  const activeSet = new Set(activeIds);
  const chosenCount = Math.min(activeSet.size, MAX_VISIBLE);

  return (
    <div className="pockets-section">
      <div className="pockets-section-header">
        <h2 className="pockets-section-title">
          Pocket Saya
          <span className="pockets-count">
            {visible.length} dari {pockets.length}
          </span>
        </h2>
        <button
          type="button"
          ref={triggerRef}
          className={panelOpen ? "btn-icon-only is-open" : "btn-icon-only"}
          aria-label="Pilih pocket yang ditampilkan di dashboard"
          aria-expanded={panelOpen}
          aria-controls="pocket-display-panel"
          onClick={() => setPanelOpen((open) => !open)}
        >
          {panelOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
        </button>
      </div>

      {panelOpen && (
        <>
          <div
            className="pockets-panel-overlay"
            onClick={closePanel}
            aria-hidden="true"
          />
          <div
            className="pockets-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Pilih pocket yang ditampilkan"
            tabIndex={-1}
            ref={panelRef}
            id="pocket-display-panel"
          >
            <div className="pockets-panel-grabber" aria-hidden="true" />
            <div className="pockets-panel-header">
              <div className="pockets-panel-titlebox">
                <p>Tampilkan di dashboard</p>
                <span className="pockets-panel-counter">
                  {chosenCount} dari {MAX_VISIBLE} dipilih
                </span>
              </div>
              <button
                type="button"
                className="btn-icon-only pockets-panel-close"
                aria-label="Tutup pilihan pocket"
                onClick={closePanel}
              >
                <X size={18} />
              </button>
            </div>
            <div className="pockets-panel-list">
              {panelPockets.map((pocket, index) => {
                const enriched = enrichPocket(pocket, index);
                const Icon = enriched.Icon;
                const checked = activeSet.has(String(pocket.id));
                const maxed = !checked && chosenCount >= MAX_VISIBLE;
                const lastOne = checked && chosenCount <= 1;
                return (
                  <label
                    key={pocket.id}
                    className={
                      checked
                        ? "pockets-panel-row is-checked"
                        : "pockets-panel-row"
                    }
                    title={maxed ? `Maksimal ${MAX_VISIBLE} pocket` : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={maxed || lastOne}
                      onChange={() => togglePocket(pocket.id)}
                    />
                    <span
                      className={`goal-pocket-option-icon pocket-icon-${enriched.color}`}
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <span className="goal-pocket-option-info">
                      <span className="goal-pocket-option-name">
                        {pocket.name}
                      </span>
                      <span className="goal-pocket-option-balance">
                        Rp{Number(pocket.balance ?? 0).toLocaleString("id-ID")}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="pockets-panel-hint">
              Pilihan tersimpan otomatis di perangkat ini.
            </p>
            <div className="pockets-panel-footer">
              <button
                type="button"
                className="pockets-panel-done"
                onClick={closePanel}
              >
                Selesai
              </button>
            </div>
          </div>
        </>
      )}

      <div className="pockets-grid">
        {visible.map((pocket, index) => {
          const enriched = enrichPocket(pocket, index);
          return (
            <Pocketcard
              key={pocket.id}
              color={enriched.color}
              icon={enriched.Icon}
              title={enriched.title}
              amount={enriched.amount}
            />
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <Link className="pockets-more" to="/pocket">
          Lihat semua {pockets.length} pocket <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default Pocketlist;
