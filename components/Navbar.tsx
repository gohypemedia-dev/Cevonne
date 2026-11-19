"use client";

import React, { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "@/lib/router"
import {
  Menu,
  Search,
  Heart,
  User,
  Phone,
  ShoppingCart,
  ChevronRight,
  Truck,
  ShieldCheck,
  Video,
  Palette,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useShop } from "@/context/ShopContext"
import { useAuth } from "@/context/AuthContext"
import { useLanguage } from "@/context/LanguageContext"
import { STATIC_ASSETS } from "@/lib/assets"
import { API_BASE } from "@/lib/api"

const NAV_H_MOBILE = "h-16"     // 64px
const NAV_H_DESKTOP = "md:h-20" // 80px

const DEFAULT_COLLECTIONS = [
  { name: "Everyday Essentials", slug: "everyday-essentials" },
  { name: "New Arrival", slug: "new-arrival" },
  { name: "The Campaign", slug: "the-campaign" },
  { name: "Lip Color", slug: "lip-color" },
  { name: "Lip Care", slug: "lip-care" },
  { name: "Lip Gloss", slug: "lip-gloss" },
  { name: "Matte Essentials", slug: "matte-essentials" },
  { name: "Satin Finish", slug: "satin-finish" },
];

const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [navCollections, setNavCollections] = useState(DEFAULT_COLLECTIONS)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/collections`)
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setNavCollections(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const THRESHOLD = 24
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === "/"
  const isCollectionPage =
    location.pathname === "/collections" ||
    location.pathname.startsWith("/collections/") ||
    location.pathname.startsWith("/collection/")
  const hasHeroBanner = isHomePage || isCollectionPage

  // Transparent at top for hero pages (Home & Collections), solid everywhere else
  const [solid, setSolid] = useState(!hasHeroBanner)
  const ticking = useRef(false)

  const { cartItems, wishlist, openDrawer, totalCount } = useShop()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!hasHeroBanner) {
      setSolid(true)
      return
    }

    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        setSolid(window.scrollY > THRESHOLD)
        ticking.current = false
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [hasHeroBanner])

  const handleMenuSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setMenuOpen(false)
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const textClass = solid ? "text-neutral-900" : "text-white"

  return (
    <>
      <header
        className={`hidden md:block fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-200
        ${solid
            ? "bg-white/95 border-b border-neutral-200/80 backdrop-blur-md shadow-xs"
            : "bg-transparent border-transparent shadow-none"
          }`}
        style={{
          backgroundColor: solid ? "rgba(255,255,255,0.95)" : "transparent",
        }}
      >
        <div
          className={`flex w-full items-center justify-between px-3 font-normal md:px-6 lg:px-[54px] ${NAV_H_MOBILE} ${NAV_H_DESKTOP}`}
        >
          {/* Left: Menu + Search */}
          <div className="flex items-center gap-4 md:gap-6">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={`group flex items-center gap-2 text-sm hover:opacity-80 transition-colors duration-300 ${textClass}`}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                  <span className="hidden sm:inline font-medium tracking-wide">{t("nav.menu")}</span>
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[90vw] max-w-[380px] sm:max-w-[410px] p-0 bg-white border-r border-neutral-200/80 shadow-2xl flex flex-col justify-between"
              >
                <SheetTitle className="sr-only">Main navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Cevonne luxury beauty catalog, AR virtual try-on studio, and brand discovery.
                </SheetDescription>

                {/* Top Section: Brand Header & Search */}
                <div className="border-b border-neutral-100 px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="group flex flex-col"
                    >
                      <img
                        src={STATIC_ASSETS.logoNavbar}
                        alt="Cevonne"
                        className="h-5 w-auto object-contain brightness-0 transition-opacity group-hover:opacity-80"
                      />
                    </Link>
                  </div>

                  {/* Clean Search Input */}
                  <form onSubmit={handleMenuSearch} className="relative mt-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search shades, products..."
                      className="w-full rounded-full bg-neutral-100/70 focus:bg-white border border-neutral-200/80 focus:border-black pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
                    />
                  </form>
                </div>

                {/* Center Scrollable Nav: Clean Luxury Categories & Services */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-none">
                  {/* Category Links (All 8 Collections) */}
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase block mb-2">
                      Collections
                    </span>

                    <nav className="divide-y divide-neutral-100">
                      {navCollections.map((col) => (
                        <Link
                          key={col.slug || col.name}
                          to={`/collections/${encodeURIComponent(col.slug || col.name)}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between py-3 text-sm font-serif tracking-wide text-neutral-900 hover:text-neutral-600 transition-colors"
                        >
                          <span>{col.name}</span>
                          <ChevronRight className="h-4 w-4 text-neutral-300" />
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Digital Services (Virtual Try-On & Shade Finder) - Clean Luxury Tiles */}
                  <div>
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase block mb-2.5">
                      Services
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        to="/ar/lipstick"
                        onClick={() => setMenuOpen(false)}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 hover:bg-neutral-100/70 hover:border-neutral-300 transition-all group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <Video className="h-4 w-4 text-neutral-700 group-hover:text-black transition-colors" />
                          <span className="text-[9px] font-semibold tracking-wider text-rose-600 uppercase">AR</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-medium text-neutral-900">{t("nav.virtualTryOn")}</div>
                          <div className="text-[10px] text-neutral-500">Live Camera Studio</div>
                        </div>
                      </Link>

                      <Link
                        to="/quiz"
                        onClick={() => setMenuOpen(false)}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 hover:bg-neutral-100/70 hover:border-neutral-300 transition-all group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <Palette className="h-4 w-4 text-neutral-700 group-hover:text-black transition-colors" />
                          <span className="text-[9px] font-semibold tracking-wider text-neutral-400 uppercase">Quiz</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-medium text-neutral-900">Shade Finder</div>
                          <div className="text-[10px] text-neutral-500">Find Your Match</div>
                        </div>
                      </Link>
                    </div>
                  </div>


                </div>

                {/* Bottom Section: Concierge & Brand Assurance */}
                <div className="border-t border-neutral-100 bg-neutral-50/60 p-4 space-y-2.5">
                  <a
                    href="https://wa.me/917061009669?text=Hi%20Cevonne,%20I%20would%20like%20assistance%20with%20choosing%20a%20shade."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl bg-white border border-neutral-200/80 px-3.5 py-2 shadow-2xs hover:border-neutral-300 transition-all text-neutral-800"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-neutral-500" />
                      <span className="text-xs font-medium">Beauty Advisor · WhatsApp</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                  </a>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 pt-1">
                    <span>Complimentary Shipping &gt; ₹999</span>
                    <span>100% Cruelty-Free</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link
              to="/search"
              className={`group flex items-center gap-2 text-sm hover:opacity-80 transition-colors duration-300 ${textClass}`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t("nav.search")}</span>
            </Link>
          </div>

          {/* Center brand */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/">
              <img
                src={STATIC_ASSETS.logoNavbar}
                alt="Cevonne"
                draggable={false}
                className="h-5 w-auto select-none object-contain lg:h-7"
                style={{ filter: solid ? "brightness(0)" : "brightness(0) invert(1)" }}
              />
            </Link>
          </div>

          {/* Right: Call + icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              to="/quiz"
              className={`hidden md:inline-flex items-center text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all duration-300 ${
                solid
                  ? "border-neutral-200 text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300"
                  : "border-white/30 text-white hover:bg-white/10"
              }`}
            >
              Shade Quiz
            </Link>

            <a
              href="https://wa.me/917061009669"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:inline text-sm hover:opacity-80 transition-colors duration-300 ${textClass}`}
              aria-label="Call Us"
            >
              {t("nav.callUs")}
            </a>

            <Separator
              orientation="vertical"
              className={`hidden md:block h-4 bg-[var(--border)] transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"
                }`}
            />

            <button
              type="button"
              onClick={() => openDrawer("wishlist")}
              className={`relative inline-flex items-center justify-center hover:opacity-80 transition-colors duration-300 ${textClass}`}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {mounted && wishlist.length > 0 && (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold uppercase leading-none text-white">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => openDrawer("cart")}
              className={`relative inline-flex items-center justify-center hover:opacity-80 transition-colors duration-300 ${textClass}`}
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
              {mounted && totalCount > 0 && (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-semibold uppercase leading-none text-white">
                  {totalCount}
                </span>
              )}
            </button>
            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className={`inline-flex items-center justify-center hover:opacity-80 transition-colors duration-300 ${textClass}`}
              aria-label={isAuthenticated ? "Account" : "Sign In"}
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
