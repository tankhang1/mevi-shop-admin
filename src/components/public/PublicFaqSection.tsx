import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { PublicFaqQuestion } from "@/features/content-block";

interface Props {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  items: PublicFaqQuestion[];
  className?: string;
}

export function PublicFaqSection({
  eyebrow,
  title,
  description,
  items,
  className,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className={cn("py-8 sm:py-12 space-y-6 max-w-4xl mx-auto px-4", className)}>
      <div className="text-center space-y-2">
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

      <Accordion type="single" collapsible className="w-full space-y-3">
        {items.map((item, idx) => (
          <AccordionItem
            key={idx}
            value={`faq-${idx}`}
            className="border rounded-2xl bg-card px-5 shadow-xs"
          >
            <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Q
                </span>
                <span>{item.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-5 pl-9">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

