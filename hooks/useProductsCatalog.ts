import { useEffect, useState } from "react";
import { API_BASE, HAS_API_BASE } from "@/lib/api";
import type { Product } from "@/types/product";

const cache = {
  data: null as Product[] | null,
  hasFetched: false,
  error: null as string | null,
  promise: null as Promise<Product[]> | null,
};

const normalizeItems = (payload: unknown): Product[] => {
  const items = Array.isArray(payload) ? payload : (payload as { data?: unknown })?.data;
  return Array.isArray(items) ? items : [];
};

export function useProductsCatalog() {
  const [products, setProducts] = useState<Product[]>(() => cache.data || []);
  const [loading, setLoading] = useState<boolean>(() => !cache.data || cache.data.length === 0);
  const [error, setError] = useState<string>(cache.error || "");

  useEffect(() => {
    let cancelled = false;

    // Check client sessionStorage on mount if cache.data is empty
    if (!cache.data && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("cevonne_catalog_cache");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cache.data = parsed;
            if (!cancelled) {
              setProducts(parsed);
              setLoading(false);
            }
          }
        }
      } catch {}
    }

    if (cache.hasFetched && cache.data) {
      setLoading(false);
      return;
    }

    if (cache.promise) {
      cache.promise
        .then((items) => {
          if (!cancelled && items.length > 0) {
            setProducts(items);
          }
        })
        .catch((err: any) => setError(err?.message || "Failed to load products"))
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    const fetcher = fetch(`${API_BASE}/products`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load products");
        const payload = await res.json();
        const items = normalizeItems(payload);
        if (items.length > 0) {
          cache.data = items;
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem("cevonne_catalog_cache", JSON.stringify(items));
            } catch {}
          }
        }
        cache.hasFetched = true;
        cache.error = null;
        return items;
      })
      .catch((err: any) => {
        cache.error = err?.message || "Failed to load products";
        return [];
      })
      .finally(() => {
        cache.promise = null;
      });

    cache.promise = fetcher;

    fetcher
      .then((items) => {
        if (!cancelled && items.length > 0) {
          setProducts(items);
        }
      })
      .catch((err: any) => setError(err?.message || "Failed to load products"))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

export default useProductsCatalog;
