import { Sparkles } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { HIGHLIGHT_ICON_MAP } from "@/features/storefront";
import type { PublicHighlightCard } from "@/features/content-block";

interface Props {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  items: PublicHighlightCard[];
  className?: string;
}

export function PublicHighlightsSection({
  eyebrow,
  title,
  description,
  items,
  className,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn("py-8 sm:py-12 space-y-6", className)}>
      <div className="text-center space-y-2 max-w-3xl mx-auto px-4">
        {eyebrow && (
          <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-4">
        {items.map((card, idx) => {
          const iconDef = HIGHLIGHT_ICON_MAP[card.icon];
          const Icon = iconDef ? iconDef.icon : Sparkles;
          const Wrapper = card.link ? "a" : "div";
          const wrapperProps = card.link
            ? {
                href: card.link,
                target: card.link.startsWith("http") ? "_blank" : undefined,
                rel: card.link.startsWith("http") ? "noopener noreferrer" : undefined,
              }
            : {};

          return (
            <Wrapper
              key={idx}
              {...wrapperProps}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-xs space-y-2.5 transition-all",
                card.link && "hover:border-primary hover:shadow-md cursor-pointer block",
              )}
            >
              <div className="flex items-center gap-2.5 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-base text-foreground">
                  {card.title}
                </h3>
              </div>
              {card.description && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              )}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}

