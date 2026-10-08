import { useCallback, useEffect, useState } from "react";
import { getPocketsCached, refreshPocketsCache, peekPocketsCache } from "../API/api";


export function usePockets() {
    const [pockets, setPockets] = useState(() => peekPocketsCache() ?? []);
    const [loading, setLoading] = useState(() => peekPocketsCache() === null);

    useEffect(() => {
        let active = true;
        getPocketsCached()
            .then((data) => { if (active) { setPockets(data); setLoading(false); } })
            .catch(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const refresh = useCallback(() => {
        return refreshPocketsCache()
            .then((data) => { setPockets(data); setLoading(false); return data; })
            .catch((error) => { console.log(error); setLoading(false); return peekPocketsCache() ?? []; });
    }, []);

    return { pockets, loading, refresh };
}
