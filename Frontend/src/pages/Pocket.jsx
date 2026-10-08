import { Pencil, Trash2, Wallet, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PocketPageSkeleton } from "../components/PocketSkeleton";
import Pocketcard from "../components/dashboard/Pocketcard";
import PocketEdit from "../components/Pocket/PocketEdit";
import PocketDel from "../components/Pocket/PocketDel";
import PocketForm from "./PocketForm";
import { usePockets } from "../hooks/usePockets";
import { enrichPocket, isDefaultPocket, sortDefaultPocketsFirst } from "../utils/pocketUI";

function Pocket() {
    const { pockets, loading, refresh: refreshPockets } = usePockets()
    const [view, setView] = useState("list")
    const [editPocket, setEditPocket] = useState(null)
    const [delPocket, setDelPocket] = useState(null)

    const sortedPockets = useMemo(() => sortDefaultPocketsFirst(pockets), [pockets]);

    if (view === "create") {
        return (
            <PocketForm
                onBack={() => setView("list")}
                onCreated={() => { setView("list"); refreshPockets(); }}
            />
        );
    }

    if (loading) {
        return (
            <div className="pocket">
                <PocketPageSkeleton count={6} />
            </div>
        );
    }

    return (
        <div className="pocket">
            <div className="pocket-header pocket-header-spread page-header">
                <div className="pocket-titlebox">
                    <Wallet size={30} />
                    <h1>Pocket</h1>
                </div>
                <button className="btn-add-pocket" onClick={() => setView("create")}>
                    <Plus size={16} /> Buat Pocket
                </button>
            </div>

            <div className="pocketsPage-grid">
                {sortedPockets.length === 0 ? (
                    <div className="empty-state-pocket">
                        <Wallet size={40} />
                        <h2>Kamu Belum ada Pocket</h2>
                        <p>Ayo buat Pocket sekarang</p>
                    </div>
                ) : (
                    sortedPockets.map((pocket, index) => {
                        const enriched = enrichPocket(pocket, index);
                        const locked = isDefaultPocket(pocket);
                        return (
                            <Pocketcard
                                key={pocket.id}
                                color={enriched.color}
                                icon={enriched.Icon}
                                title={enriched.title}
                                amount={enriched.amount}
                                actions={
                                    <>
                                        <button
                                            className="btn-edit btn-icon"
                                            onClick={() => setEditPocket(pocket)}
                                            title={`Ubah ${pocket.name}`}
                                            aria-label={`Ubah ${pocket.name}`}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        {!locked && (
                                            <button
                                                className="btn-delete btn-icon"
                                                onClick={() => setDelPocket(pocket)}
                                                title={`Hapus ${pocket.name}`}
                                                aria-label={`Hapus ${pocket.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </>
                                }
                            />
                        );
                    })
                )}
            </div>

            {editPocket && (
                <PocketEdit
                    pocket={editPocket}
                    onBack={() => setEditPocket(null)}
                    onUpdated={refreshPockets}
                />
            )}
            {delPocket && (
                <PocketDel
                    pocket={delPocket}
                    onBack={() => setDelPocket(null)}
                    onUpdated={refreshPockets}
                />
            )}
        </div>
    )
}

export default Pocket;
