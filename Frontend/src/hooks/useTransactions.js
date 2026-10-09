import { useCallback, useEffect, useState } from "react";
import {
  TRANSACTIONS_UPDATED_EVENT,
  getTransactionsCached,
  peekTransactionsCache,
  refreshTransactionsCache,
} from "../API/api";

// Cache bersama untuk Weekly & Recent: ganti halaman tidak fetch ulang,
// hanya refresh saat ada pemasukan/pengeluaran baru (invalidateTransactionsCache).
export function useTransactions() {
  const [transactions, setTransactions] = useState(() => peekTransactionsCache() ?? []);
  const [loading, setLoading] = useState(() => peekTransactionsCache() === null);

  useEffect(() => {
    let active = true;

    if (peekTransactionsCache() === null) {
      getTransactionsCached()
        .then((data) => {
          if (active) {
            setTransactions(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    }

    const onUpdated = () => {
      const cached = peekTransactionsCache();
      // Cache dihapus karena ada transaksi baru -> fetch ulang sekali.
      if (cached === null) {
        if (active) setLoading(true);
        refreshTransactionsCache()
          .then((data) => {
            if (active) {
              setTransactions(data);
              setLoading(false);
            }
          })
          .catch(() => {
            if (active) setLoading(false);
          });
      } else if (active) {
        setTransactions(cached);
        setLoading(false);
      }
    };

    window.addEventListener(TRANSACTIONS_UPDATED_EVENT, onUpdated);
    return () => {
      active = false;
      window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, onUpdated);
    };
  }, []);

  const refresh = useCallback(() => {
    return refreshTransactionsCache().then((data) => {
      setTransactions(data);
      setLoading(false);
      return data;
    });
  }, []);

  return { transactions, loading, refresh };
}
