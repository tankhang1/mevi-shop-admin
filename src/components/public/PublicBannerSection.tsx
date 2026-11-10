import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { PublicBannerSlide } from "@/features/content-block";

interface Props {
  autoplay?: boolean;
  intervalSeconds?: number;
  items: PublicBannerSlide[];
  onCtaClick?: (cta: NonNullable<PublicBannerSlide["cta"]>) => void;
  className?: string;
}

export function PublicBannerSection({
  autoplay = true,
  intervalSeconds = 5,
  items,
  onCtaClick,
  className,
}: Props) {
  const [index, setIndex] = useState(0);

  const total = items.length;

  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const interval = (intervalSeconds || 5) * 1000;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, intervalSeconds, total]);

  if (!items || items.length === 0) return null;

  const current = items[index] ?? items[0];

  return (
    <div
      className={cn(
        "relative aspect-[16/7] min-h-[240px] sm:min-h-[340px] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md",
        className,
      )}
    >
      <img
        src={current.imageUrl}
        alt={current.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl text-white">
        {current.badge && (
          <div className="mb-2 sm:mb-3">
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white border border-white/25">
              {current.badge}
            </span>
          </div>
        )}

        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight">
          {current.title}
        </h2>

        {current.description && (
          <p className="mt-2 text-xs sm:text-sm md:text-base text-white/85 line-clamp-2 max-w-xl font-normal leading-relaxed">
            {current.description}
          </p>
        )}

        {current.cta && (
          <div className="mt-4 sm:mt-6">
            <Button
              type="button"
              size="default"
              onClick={() => onCtaClick?.(current.cta!)}
              className="rounded-full bg-white text-neutral-900 hover:bg-white/90 font-bold px-4 sm:px-6 shadow-lg text-xs sm:text-sm h-9 sm:h-11 transition-all group"
            >
              <span>{current.cta.label}</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-sm shadow hover:bg-white transition-colors"
            aria-label="Slide trước"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((prev) => (prev + 1) % total)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-sm shadow hover:bg-white transition-colors"
            aria-label="Slide tiếp theo"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="absolute bottom-3 sm:bottom-5 left-6 sm:left-12 z-20 flex items-center gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === index ? "w-6 bg-white shadow-xs" : "w-2 bg-white/50 hover:bg-white/75",
                )}
                aria-label={`Chuyển đến slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

