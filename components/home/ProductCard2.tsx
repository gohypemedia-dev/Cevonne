"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Heart, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "@/lib/router";

import { DEFAULT_PRODUCT_IMAGE, STATIC_ASSETS, resolveProductAsset } from "@/lib/assets";
import { useShop } from "@/context/ShopContext";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";

const resolveAsset = (pth = "") => {
  if (!pth) return DEFAULT_PRODUCT_IMAGE;
  return resolveProductAsset(pth, DEFAULT_PRODUCT_IMAGE);
};

type ProductCardItem = {
  id: string;
  image: string;
  name: string;
  price?: number;
  currency?: string;
};

const mapProduct = (product): ProductCardItem | null => {
  if (!product) return null;
  const galleryItems = Array.isArray(product.media?.gallery) ? product.media.gallery : [];
  const hero =
    product.media?.heroImage ||
    galleryItems.find((g) => g.role === "hero")?.url ||
    galleryItems.find((g) => g.role === "hero")?.id ||
    galleryItems[0]?.url ||
    galleryItems[0]?.id ||
    product.images?.[0]?.url ||
    "";
  const rawPrice = Number(product.pricing?.price ?? product.price ?? product.basePrice);
  return {
    id: product.slug || product.id,
    image: resolveAsset(hero),
    name: product.name,
    price: Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 899,
    currency: product.pricing?.currency === "INR" || !product.pricing?.currency ? "₹" : (product.currency || "₹"),
  };
};

const INITIAL_VISIBLE = 4;

const getCachedCollection = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(`cevonne_col_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
};

const setCachedCollection = (key: string, data: any[]) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`cevonne_col_${key}`, JSON.stringify(data));
  } catch {}
};

const ProductCard2 = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, openDrawer } = useShop();

  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const cached = getCachedCollection("new-arrival");
    if (cached.length > 0 && !cancelled) {
      setCollectionProducts(cached);
      setLoading(false);
    }

    const fetchNewArrivals = async () => {
      try {
        const res = await fetch(`${API_BASE}/collections/new-arrival`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.products) && data.products.length > 0) {
            setCollectionProducts(data.products);
            setCachedCollection("new-arrival", data.products);
          }
        }
      } catch (err) {
        console.error("Error loading new-arrival collection:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNewArrivals();
    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo<ProductCardItem[]>(() => {
    return Array.isArray(collectionProducts)
      ? collectionProducts.map(mapProduct).filter((product): product is ProductCardItem => Boolean(product))
      : [];
  }, [collectionProducts]);

  const visible = expanded ? products : products.slice(0, INITIAL_VISIBLE);

  return (
    <section className="w-full bg-white px-0 py-10">
      <div className="mx-auto mb-8 max-w-2xl px-4 text-center sm:mb-10">
        <h2 className="font-sans text-[26px] font-normal leading-tight tracking-tight text-neutral-950 sm:text-[32px]">
          New Collection &amp; Arrivals
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed text-neutral-500 sm:text-[15px]">
          Discover the latest couture releases and fresh additions to your vanity.
        </p>
      </div>

      {/* Product grid */}
      <div className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:pb-0 lg:grid-cols-4 no-scrollbar">
        {loading && visible.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skel-arrival-${i}`}
              className="relative flex min-w-[85vw] flex-col justify-between overflow-hidden bg-white text-center snap-center sm:min-w-0 p-3"
            >
              <div className="w-full aspect-[4/5] bg-neutral-100 animate-pulse rounded-xs" />
              <div className="mt-3 space-y-2 text-left px-1">
                <div className="h-3 w-20 bg-neutral-100 animate-pulse rounded-full" />
                <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded-full" />
              </div>
            </div>
          ))
        ) : (
          visible.map((product, i) => {
          const productKey = product.id || `home-p2-${i}`;
          const isWishlisted = wishlist.some((w) => w.key === productKey || w.id === product.id || w.slug === product.id);

          const handleToggleWishlist = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const status = toggleWishlist({
              key: productKey,
              id: product.id,
              slug: product.id,
              name: product.name,
              productName: product.name,
              price: product.price || 899,
              currency: product.currency || "₹",
              image: product.image,
              thumb: product.image,
            });
            if (status === "added") {
              toast.success(`${product.name} saved to wishlist`);
              openDrawer("wishlist");
            } else if (status === "removed") {
              toast(`${product.name} removed from wishlist`);
            }
          };

          const handleVirtualTryOn = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/ar/lipstick");
          };

          return (
            <div
              key={product.id || i}
              className="relative flex min-w-[85vw] flex-col justify-between overflow-hidden bg-white text-center snap-center sm:min-w-0 group"
            >
              {/* Background behind everything */}
              <img
                src={STATIC_ASSETS.cardBackground}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Card content (wrapped with Link to details) */}
              <Link
                to={`/product/${product.id}`}
                className="relative z-10 flex h-full flex-col justify-between"
              >
                {/* Image area - Full Card Edge-to-Edge */}
                <div className="relative w-full aspect-[4/5] overflow-hidden flex items-center justify-center bg-[#f7f6f2]/40">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Virtual Try On Button */}
                  <button
                    type="button"
                    aria-label="Open Virtual Try On in AR"
                    className="absolute left-2 top-2 z-20 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-neutral-900 bg-white/85 hover:bg-white active:scale-95 backdrop-blur-sm rounded-full shadow-xs border border-black/5 hover:border-black/20 transition-all cursor-pointer group/vto"
                    onClick={handleVirtualTryOn}
                  >
                    <Video className="h-3.5 w-3.5 text-neutral-800 group-hover/vto:text-rose-600 transition-colors" />
                    <span>Virtual Try On</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    aria-label="Add to wishlist"
                    className={`absolute right-2 top-2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur transition-all shadow-xs cursor-pointer ${
                      isWishlisted ? "text-rose-500" : "text-neutral-700 hover:text-rose-500"
                    }`}
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>

                  {/* Left arrow */}
                  <button
                    type="button"
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1 rounded-full bg-white/70 hover:bg-white text-neutral-800 backdrop-blur-sm shadow-xs transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Right arrow */}
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1 rounded-full bg-white/70 hover:bg-white text-neutral-800 backdrop-blur-sm shadow-xs transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="mt-2 px-4 pb-6 text-sm text-left">
                <p className="text-[12px] leading-none text-neutral-500">New · Refillable</p>
                <div className="mt-1 flex items-center justify-between">
                  <h3 className="text-[14px] font-medium text-neutral-800">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#AD0F23]" />
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#BF4A57]" />
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8E0F1E]" />
                    <span className="ml-2 text-[12px] leading-none text-neutral-600">+ 24</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })
        )}
      </div>

      {/* View more / less */}
      {products.length > INITIAL_VISIBLE && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((s) => !s)}
            className="rounded-full border border-neutral-400 px-8 py-2 text-sm font-medium hover:bg-neutral-100"
            aria-expanded={expanded}
          >
            {expanded ? "View Less" : "View More"}
          </button>
        </div>
      )}
      {!products.length && !loading && (
        <div className="mt-6 text-center text-sm text-neutral-500">
          No products available.
        </div>
      )}
    </section>
  );
};

export default ProductCard2;
