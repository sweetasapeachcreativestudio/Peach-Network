"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerCarouselSlide } from "@/lib/business-banners";

interface BusinessBannerCarouselProps {
  slides: BannerCarouselSlide[];
}

export function BusinessBannerCarousel({ slides }: BusinessBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || isPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [count, isPaused]);

  if (count === 0) return null;

  const current = slides[activeIndex % count];
  const hasBannerImage =
    current.kind === "image_banner" &&
    Boolean(current.desktopImageUrl || current.mobileImageUrl);

  const desktopSrc = current.desktopImageUrl || current.mobileImageUrl || "";
  const mobileSrc = current.mobileImageUrl || current.desktopImageUrl || "";
  const hasDistinctMobileBanner = Boolean(
    current.mobileImageUrl &&
      current.desktopImageUrl &&
      current.mobileImageUrl !== current.desktopImageUrl
  );

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % count);
  };

  return (
    <section
      aria-label="Featured announcements and upcoming events"
      className="relative bg-white border border-[#F7DFD0] rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(232,93,59,0.08)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {hasBannerImage ? (
        /* Custom image banner: render ONLY the responsive banner graphic */
        <Link
          href={current.ctaHref}
          aria-label={current.title}
          className="block w-full focus:outline-none"
        >
          <div className="hidden md:block w-full aspect-[1600/460] bg-[#FFF6EE] relative overflow-hidden">
            <img
              src={desktopSrc}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
            />
          </div>

          <div
            className={`block md:hidden w-full bg-[#FFF6EE] relative overflow-hidden ${
              hasDistinctMobileBanner ? "aspect-[1080/560]" : "aspect-[1600/460]"
            }`}
          >
            <img
              src={mobileSrc}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
            />
          </div>
        </Link>
      ) : (
        /* Hero Gradient Banner with Peachy™ cartoon illustration */
        <div
          className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FF7350 0%, #FFAE78 100%)",
          }}
        >
          <div className="space-y-2 min-w-0 flex-1 relative z-10">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="inline-block px-3 py-1 rounded-full bg-[#231714] text-white font-extrabold uppercase tracking-wider">
                {current.badge}
              </span>
              {current.dateLabel && (
                <span className="font-bold text-white/95 text-sm">
                  {current.dateLabel}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {current.title}
            </h2>

            <p className="text-[15px] text-white/95 leading-relaxed max-w-2xl font-medium">
              {current.description || current.subtitle}
            </p>

            <div className="pt-2">
              <Link
                href={current.ctaHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#231714] hover:bg-[#3A2722] text-white text-sm font-bold transition-colors whitespace-nowrap"
              >
                <span>{current.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end shrink-0 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/95 p-1.5 shadow-[0_12px_28px_rgba(35,23,20,0.14)] border border-white/60 overflow-hidden">
              <img
                src="/images/peachy-avatar.jpg"
                alt="Peachy Creative Director"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Clean Carousel Dots & Arrows Bar */}
      {count > 1 && (
        <div className="px-5 py-2.5 sm:px-7 bg-white border-t border-[#F7DFD0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Select slide">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex % count;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "w-7 bg-[#FF5E3A]"
                      : "w-2.5 bg-[#FFD8BE] hover:bg-[#FFAE78]"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-full bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] text-[#231714] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="w-8 h-8 rounded-full bg-[#FFF6EE] hover:bg-[#FFD8BE] border border-[#F7DFD0] text-[#231714] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
