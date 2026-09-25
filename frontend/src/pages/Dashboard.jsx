import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  Star,
  User,
  Menu,
  X,
  Filter,
  Eye,
  Bot,
  LogOut,
} from "lucide-react";

import { gsap } from "gsap";\n\nimport EyeTracker from "../components/EyeTracker.jsx";\nimport GazeRuntimeDebugger from "../components/GazeRuntimeDebugger.jsx";\nimport {\n  GAZE_THRESHOLDS,\n  distance,\n  findCardAtPoint,\n} from "../runtime/gazeRuntime.js";
import AIAssistant from "./AIAssistant.jsx";

const categories = [
  "All Products",
  "Audio",
  "Wearables",
  "Workspace",
  "Accessories",
  "New Arrivals",
];

const priceRanges = [
  "Under $50",
  "$50 — $150",
  "$150 — $300",
  "$300+",
];

const products = [
  {
    id: 1,
    name: "Aero ANC Headphones",
    variant: "Midnight Black",
    price: 249,
    rating: 4.9,
    reviews: 124,
    badge: "Top Rated",
    badgeTone: "brand",
    stock: "In stock",
    image: "/product-headphones.jpg",
  },
  {
    id: 2,
    name: "Chrono One Smartwatch",
    variant: "Obsidian Titanium",
    price: 399,
    rating: 4.8,
    reviews: 89,
    badge: "New",
    badgeTone: "success",
    stock: "Low stock",
    image: "/product-watch.jpg",
  },
  {
    id: 3,
    name: "Pulse Portable Speaker",
    variant: "Graphite",
    price: 129,
    rating: 4.7,
    reviews: 215,
    badge: "Best Seller",
    badgeTone: "brand",
    stock: "In stock",
    image: "/product-speaker.jpg",
  },
  {
    id: 4,
    name: "Nova True Wireless Earbuds",
    variant: "Stealth Black",
    price: 179,
    rating: 4.6,
    reviews: 156,
    badge: "Limited",
    badgeTone: "warning",
    stock: "12 left",
    image: "/product-earbuds.jpg",
  },
  {
    id: 5,
    name: "Elevate Laptop Stand",
    variant: "Matte Aluminum",
    price: 89,
    rating: 4.8,
    reviews: 342,
    badge: "Ergonomic",
    badgeTone: "neutral",
    stock: "In stock",
    image: "/product-laptopstand.jpg",
  },
  {
    id: 6,
    name: "Orbit Wireless Charger",
    variant: "LED Ring",
    price: 49,
    rating: 4.5,
    reviews: 98,
    badge: "Under $50",
    badgeTone: "neutral",
    stock: "In stock",
    image: "/product-charger.jpg",
  },
  {
    id: 7,
    name: "Transit Tech Pouch",
    variant: "Geometric Leather",
    price: 65,
    rating: 4.7,
    reviews: 76,
    badge: "Essentials",
    badgeTone: "neutral",
    stock: "Ships free",
    image: "/product-pouch.jpg",
  },
  {
    id: 8,
    name: "Flux Mechanical Keyboard",
    variant: "Compact 75%",
    price: 199,
    rating: 4.9,
    reviews: 201,
    badge: "Gamer Pick",
    badgeTone: "brand",
    stock: "In stock",
    image: "/product-keyboard.jpg",
  },
];

const badgeClasses = {
  brand: "bg-blue-100 text-blue-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  neutral: "bg-slate-100 text-slate-500",
};

export default function Dashboard({ user, onLogout }) {
  const [activeCategory, setActiveCategory] =
    useState("All Products");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const [activeView, setActiveView] =
    useState("store");

  const [search, setSearch] = useState("");\n
  const cardRefs = useRef(new Map());
  const runtimeRef = useRef({
    calibrated: false,
    state: "IDLE",
    previousSample: null,
    samples: [],
    focusedProductId: null,
    cardDwellStart: null,
    outsideStart: null,
    highMovementStart: null,
    switchTimestamps: [],
    lastCardId: null,
  });

  const [gazeRuntime, setGazeRuntime] = useState({
    calibrated: false,
    state: "IDLE",
    focusedProductId: null,
    cardDwellMs: 0,
    velocity: 0,
    switchCount: 0,
    outsideMs: 0,
  });

  useEffect(() => {
    const handleCalibration = () => {
      runtimeRef.current.calibrated = true;
      setGazeRuntime((current) => ({
        ...current,
        calibrated: true,
      }));
    };

    const handleGazeSample = (event) => {
      const runtime = runtimeRef.current;
      const sample = event.detail;

      if (!runtime.calibrated || !sample) return;

      const now = sample.timestamp || Date.now();
      const previous = runtime.previousSample;

      const velocity =
        previous && now > previous.timestamp
          ? (distance(sample, previous) /
              (now - previous.timestamp)) *
            1000
          : 0;

      runtime.previousSample = sample;

      runtime.samples = [
        ...runtime.samples.filter(
          (item) =>
            now - item.timestamp <=
            GAZE_THRESHOLDS.sampleHistoryMs
        ),
        {
          ...sample,
          velocity,
        },
      ];

      const focusedProductId = findCardAtPoint(
        sample.x,
        sample.y,
        cardRefs.current
      );

      if (focusedProductId !== runtime.lastCardId) {
        if (focusedProductId) {
          runtime.cardDwellStart = now;
        } else {
          runtime.cardDwellStart = null;
        }

        if (runtime.lastCardId && focusedProductId) {
          runtime.switchTimestamps.push(now);
        }

        runtime.lastCardId = focusedProductId;
      }

      runtime.switchTimestamps =
        runtime.switchTimestamps.filter(
          (timestamp) =>
            now - timestamp <=
            GAZE_THRESHOLDS.struggleWindowMs
        );

      if (focusedProductId) {
        runtime.outsideStart = null;
      } else if (runtime.outsideStart === null) {
        runtime.outsideStart = now;
      }

      if (velocity >= GAZE_THRESHOLDS.highVelocityPxPerSecond) {
        runtime.highMovementStart ??= now;
      } else {
        runtime.highMovementStart = null;
      }

      const cardDwellMs =
        focusedProductId && runtime.cardDwellStart
          ? now - runtime.cardDwellStart
          : 0;

      const outsideMs =
        runtime.outsideStart !== null
          ? now - runtime.outsideStart
          : 0;

      const highMovementMs =
        runtime.highMovementStart !== null
          ? now - runtime.highMovementStart
          : 0;

      const lastSampleAge = now - sample.timestamp;

      let nextState = runtime.state;

      if (
        outsideMs >= GAZE_THRESHOLDS.abandonOutsideMs ||
        lastSampleAge >= GAZE_THRESHOLDS.abandonNoSampleMs
      ) {
        nextState = "ABANDON";
      } else if (
        highMovementMs >=
          GAZE_THRESHOLDS.struggleHighMovementMs ||
        runtime.switchTimestamps.length >=
          GAZE_THRESHOLDS.struggleSwitchCount
      ) {
        nextState = "STRUGGLE";
      } else if (
        focusedProductId &&
        cardDwellMs >= GAZE_THRESHOLDS.focusDwellMs
      ) {
        nextState = "FOCUS";
      }

      runtime.focusedProductId = focusedProductId;
      runtime.state = nextState;

      setGazeRuntime({
        calibrated: runtime.calibrated,
        state: nextState,
        focusedProductId,
        cardDwellMs,
        velocity,
        switchCount: runtime.switchTimestamps.length,
        outsideMs,
      });
    };

    window.addEventListener(
      "zia:gaze-calibrated",
      handleCalibration
    );
    window.addEventListener(
      "zia:gaze-sample",
      handleGazeSample
    );

    return () => {
      window.removeEventListener(
        "zia:gaze-calibrated",
        handleCalibration
      );
      window.removeEventListener(
        "zia:gaze-sample",
        handleGazeSample
      );
    };
  }, []);

  useEffect(() => {
    const focusedId = gazeRuntime.focusedProductId;
    const card = focusedId
      ? cardRefs.current.get(String(focusedId))
      : null;

    if (!card) return;

    const image = card.querySelector("[data-card-image]");
    const body = card.querySelector("[data-card-body]");
    const quickAdd = card.querySelector("[data-quick-add]");

    gsap.killTweensOf([card, image, body, quickAdd]);

    const timeline = gsap.timeline();

    if (gazeRuntime.state === "FOCUS") {
      timeline
        .to(card, {
          y: -8,
          scale: 1.025,
          duration: 0.32,
          ease: "power3.out",
        })
        .to(
          image,
          {
            scale: 1.06,
            duration: 0.45,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          body,
          {
            y: -2,
            duration: 0.25,
            ease: "power2.out",
          },
          "<"
        )
        .to(
          quickAdd,
          {
            y: 0,
            opacity: 1,
            duration: 0.25,
            ease: "power2.out",
          },
          "<0.08"
        );
    } else if (gazeRuntime.state === "STRUGGLE") {
      timeline
        .to(card, {
          y: -3,
          scale: 1.01,
          duration: 0.28,
          ease: "power2.out",
        })
        .to(
          card,
          {
            rotation: 0.5,
            duration: 0.12,
            ease: "sine.inOut",
            repeat: 3,
            yoyo: true,
          },
          "<"
        );
    } else if (gazeRuntime.state === "ABANDON") {
      timeline
        .to(card, {
          y: 0,
          scale: 0.985,
          duration: 0.4,
          ease: "power2.inOut",
        })
        .to(
          image,
          {
            scale: 1,
            duration: 0.35,
            ease: "power2.inOut",
          },
          "<"
        )
        .to(
          quickAdd,
          {
            y: 12,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          "<"
        );
    }

    return () => timeline.kill();
  }, [
    gazeRuntime.state,
    gazeRuntime.focusedProductId,
  ]);


  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      product.variant
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================
          TOP UTILITY BAR
      ===================================== */}

      <div className="hidden sm:block border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-2 text-[11px] font-medium tracking-wide text-slate-500">

          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-slate-900">
              Store locator
            </span>

            <span className="cursor-pointer hover:text-slate-900">
              Help
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>
              {user?.role === "admin"
                ? "Administrator"
                : "Patient Account"}
            </span>
          </div>

        </div>
      </div>

      {/* =====================================
          PRIMARY NAVIGATION
      ===================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-3 sm:px-6">

          {/* Logo */}

          <div className="flex items-center gap-2">

            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-white">
              <span className="text-sm font-bold">
                Z
              </span>
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                ZIA
              </span>

              <span className="hidden sm:block text-[9px] text-slate-400 tracking-widest">
                ZERO INTERFACE AI
              </span>
            </div>

          </div>

          {/* Desktop navigation */}

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-500">

            <button
              onClick={() => setActiveView("store")}
              className={
                activeView === "store"
                  ? "text-slate-950"
                  : "hover:text-slate-950"
              }
            >
              Marketplace
            </button>

            <button
              onClick={() => setActiveView("eye")}
              className={
                activeView === "eye"
                  ? "text-slate-950"
                  : "hover:text-slate-950"
              }
            >
              Eye Tracker
            </button>

            <button
              onClick={() => setActiveView("ai")}
              className={
                activeView === "ai"
                  ? "text-slate-950"
                  : "hover:text-slate-950"
              }
            >
              AI Assistant
            </button>

          </div>

          {/* Right controls */}

          <div className="flex flex-1 items-center justify-end gap-4">

            {/* Search */}

            <div className="relative hidden sm:block w-full max-w-md">

              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </div>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="h-10 w-full rounded-full bg-slate-50 pl-10 pr-4 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

            </div>

            {/* Account */}

            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">

              <User className="h-5 w-5" />

              <span className="hidden xl:inline">
                {user?.name || "Account"}
              </span>

            </div>

            {/* Logout */}

            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            {/* Mobile menu */}

            <button
              className="lg:hidden p-2 text-slate-500"
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

          </div>

        </div>

        {/* Mobile menu */}

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4">

            <div className="flex flex-col gap-2 text-sm font-medium">

              <button
                onClick={() => {
                  setActiveView("store");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left hover:bg-slate-100"
              >
                Marketplace
              </button>

              <button
                onClick={() => {
                  setActiveView("eye");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left hover:bg-slate-100"
              >
                Eye Tracker
              </button>

              <button
                onClick={() => {
                  setActiveView("ai");
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left hover:bg-slate-100"
              >
                AI Assistant
              </button>

              <button
                onClick={onLogout}
                className="mt-2 rounded-lg bg-slate-950 px-3 py-2 text-left text-white"
              >
                Logout
              </button>

            </div>

            <div className="mt-4 sm:hidden">

              <div className="relative">

                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="h-10 w-full rounded-full bg-slate-50 pl-10 pr-4 text-sm ring-1 ring-slate-200 focus:outline-none"
                />

              </div>

            </div>

          </div>
        )}

      </nav>

      {/* =====================================
          EYE TRACKER VIEW
      ===================================== */}

      {activeView === "eye" && (
        <main className="mx-auto max-w-[1600px] px-6 py-10">

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Eye Tracker
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time gaze detection and
                  calibration.
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <EyeTracker visible={activeView === "eye"} />

          </div>

        </main>
      )}

      {/* =====================================
          AI ASSISTANT VIEW
      ===================================== */}

      {activeView === "ai" && (
        <main className="mx-auto max-w-[1600px] px-6 py-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                ZIA AI Assistant
              </h1>

              <p className="text-sm text-slate-500">
                Ask questions and interact with
                your healthcare assistant.
              </p>
            </div>

          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <AIAssistant
              user={user}
              onLogout={onLogout}
            />

          </div>

        </main>
      )}

      {/* =====================================
          MARKETPLACE VIEW
      ===================================== */}

      {activeView === "store" && (
        <main>

          {/* HERO */}

          <section className="relative overflow-hidden bg-white">

            <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-8 px-6 py-12 lg:grid-cols-2 lg:py-20">

              <div className="order-2 max-w-2xl lg:order-1">

                <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  ZIA Marketplace
                </span>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  SMARTER HEALTHCARE.
                  <br />
                  <span className="text-blue-600">
                    BUILT FOR YOU.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">
                  Explore technology, accessories,
                  and healthcare-focused products
                  designed for a smarter everyday
                  experience.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">

                  <button
                    onClick={() => {
                      document
                        .getElementById("products")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                    className="rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Shop Now
                  </button>

                  <button
                    onClick={() =>
                      setActiveView("ai")
                    }
                    className="rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold hover:bg-slate-50"
                  >
                    Ask ZIA
                  </button>

                </div>

              </div>

              <div className="order-1 lg:order-2">

                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">

                  <img
                    src="/hero-marketplace.jpg"
                    alt="ZIA marketplace"
                    className="h-full w-full object-cover"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* CATALOG */}

          <section
            id="products"
            className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:py-16"
          >

            <div className="flex flex-col gap-10 lg:flex-row">

              {/* SIDEBAR */}

              <aside className="hidden w-60 shrink-0 lg:block">

                <div className="sticky top-28 space-y-8">

                  <div>

                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Categories
                    </h3>

                    <nav className="flex flex-col gap-1">

                      {categories.map(
                        (category) => (
                          <button
                            key={category}
                            onClick={() =>
                              setActiveCategory(
                                category
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                              activeCategory ===
                              category
                                ? "bg-slate-950 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {category}
                          </button>
                        )
                      )}

                    </nav>

                  </div>

                  <div>

                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Price Range
                    </h3>

                    <div className="flex flex-col gap-3">

                      {priceRanges.map(
                        (range) => (
                          <label
                            key={range}
                            className="flex cursor-pointer items-center gap-3 text-sm text-slate-500"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300"
                            />

                            {range}
                          </label>
                        )
                      )}

                    </div>

                  </div>

                  <div>

                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Rating
                    </h3>

                    {[4, 3, 2].map(
                      (rating) => (
                        <label
                          key={rating}
                          className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-slate-500"
                        >

                          <input
                            type="radio"
                            name="rating"
                            className="h-4 w-4"
                          />

                          <span className="flex items-center gap-1">

                            {Array.from({
                              length: 5,
                            }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              )
                            )}

                            <span className="ml-1">
                              & Up
                            </span>

                          </span>

                        </label>
                      )
                    )}

                  </div>

                </div>

              </aside>

              {/* PRODUCTS */}

              <div className="flex-1">

                <div className="mb-8 flex items-end justify-between">

                  <div>

                    <h2 className="text-3xl font-semibold tracking-tight">
                      Latest Drops
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {filteredProducts.length}{" "}
                      curated products
                    </p>

                  </div>

                  <select className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium sm:block">
                    <option>
                      Featured
                    </option>
                    <option>
                      Newest
                    </option>
                    <option>
                      Price: Low to High
                    </option>
                    <option>
                      Price: High to Low
                    </option>
                    <option>
                      Top Rated
                    </option>
                  </select>

                </div>

                {/* MOBILE FILTER */}

                <div className="mb-6 lg:hidden">

                  <button
                    onClick={() =>
                      setMobileFiltersOpen(
                        !mobileFiltersOpen
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>

                  {mobileFiltersOpen && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">

                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Price Range
                      </h3>

                      {priceRanges.map(
                        (range) => (
                          <label
                            key={range}
                            className="mb-3 flex items-center gap-3 text-sm"
                          >
                            <input type="checkbox" />
                            {range}
                          </label>
                        )
                      )}

                    </div>
                  )}

                </div>

                {/* GRID */}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                  {filteredProducts.map(
                    (product) => (
                      <article
                        key={product.id}
                        ref={(element) => {
                          if (element) {
                            cardRefs.current.set(
                              String(product.id),
                              element
                            );
                          } else {
                            cardRefs.current.delete(
                              String(product.id)
                            );
                          }
                        }}
                        data-product-id={product.id}
                        className="group relative flex flex-col rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                      >

                        <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-100">

                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />

                          <span
                            className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              badgeClasses[
                                product.badgeTone
                              ]
                            }`}
                          >
                            {product.badge}
                          </span>

                          <button\n                            data-quick-add\n                            className="absolute bottom-3 left-3 right-3 translate-y-3 rounded-full bg-slate-950 py-2.5 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            Quick Add
                          </button>

                        </div>

                        <div\n                          data-card-body\n                          className="flex flex-1 flex-col justify-between px-1">

                          <div>

                            <div className="flex items-start justify-between gap-3">

                              <h3 className="text-[15px] font-semibold leading-snug">
                                {product.name}
                              </h3>

                              <span className="shrink-0 text-sm font-semibold">
                                ${product.price}
                              </span>

                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {product.variant}
                            </p>

                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                            <div className="flex items-center gap-1">

                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                              <span className="text-xs font-semibold">
                                {product.rating}
                              </span>

                              <span className="text-xs text-slate-400">
                                ({product.reviews})
                              </span>

                            </div>

                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              {product.stock}
                            </span>

                          </div>

                        </div>

                      </article>
                    )
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* TRUST BAR */}

          <section className="border-t border-slate-200 bg-white">

            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">

              {[
                {
                  label: "Secure Platform",
                  value: "Protected user accounts",
                },
                {
                  label: "AI Powered",
                  value: "Intelligent healthcare assistant",
                },
                {
                  label: "Eye Tracking",
                  value: "Real-time gaze technology",
                },
                {
                  label: "24/7 Assistance",
                  value: "ZIA is always available",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="space-y-1"
                >

                  <h4 className="text-xs font-semibold uppercase tracking-widest">
                    {item.label}
                  </h4>

                  <p className="text-sm text-slate-400">
                    {item.value}
                  </p>

                </div>
              ))}

            </div>

          </section>

        </main>
      )}

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-[1600px] px-6 py-12">

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">

            <div>

              <div className="flex items-center gap-2">

                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-white">
                  Z
                </div>

                <span className="font-bold tracking-tight">
                  ZIA
                </span>

              </div>

              <p className="mt-3 text-sm text-slate-400">
                Zero Interface AI — smarter
                healthcare assistance.
              </p>

            </div>

            <p className="text-xs text-slate-400">
              © 2026 ZIA. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}