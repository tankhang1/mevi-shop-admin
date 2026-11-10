import { LoadingBlock } from "@/components/common/ui-bits";
import {
  type ContentBlockType,
  usePublicContentBlocks,
} from "@/features/content-block";
import { PublicBannerSection } from "./PublicBannerSection";
import { PublicHighlightsSection } from "./PublicHighlightsSection";
import { PublicFaqSection } from "./PublicFaqSection";

interface Props {
  block?: ContentBlockType;
  className?: string;
}

/**
 * Render các khối nội dung công khai từ /api/public/shop/content-blocks
 * Tự động ẩn các khối không có dữ liệu hoặc đang tắt.
 */
export function PublicContentBlocksView({ block, className }: Props) {
  const { data, isLoading } = usePublicContentBlocks(block);

  if (isLoading) return <LoadingBlock />;
  if (!data) return null;

  return (
    <div className={className}>
      {data.banner && data.banner.items && data.banner.items.length > 0 && (
        <PublicBannerSection
          autoplay={data.banner.autoplay}
          intervalSeconds={data.banner.intervalSeconds}
          items={data.banner.items}
        />
      )}

      {data.highlights && data.highlights.items && data.highlights.items.length > 0 && (
        <PublicHighlightsSection
          eyebrow={data.highlights.eyebrow}
          title={data.highlights.title}
          description={data.highlights.description}
          items={data.highlights.items}
        />
      )}

      {data.faq && data.faq.items && data.faq.items.length > 0 && (
        <PublicFaqSection
          eyebrow={data.faq.eyebrow}
          title={data.faq.title}
          description={data.faq.description}
          items={data.faq.items}
        />
      )}
    </div>
  );
}

