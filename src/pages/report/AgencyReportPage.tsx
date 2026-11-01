import { Link, useParams } from "wouter";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { AGENCY_KIND, useAgency } from "@/features/agency";
import { ShopSalesReport } from "./components/ShopSalesReport";

/** Root drill-down from "Doanh thu theo đại lý / CTV": one partner's referred sales */
export default function AgencyReportPage() {
  const { id } = useParams<{ id: string }>();
  const { data: agency, isLoading, isError } = useAgency(id);

  if (isLoading) return <LoadingBlock />;
  if (isError || !agency) {
    return (
      <EmptyBlock>
        Không tìm thấy đại lý / CTV.{" "}
        <Link href={ROUTES.report("agency")} className="text-primary underline">
          Quay lại báo cáo
        </Link>
      </EmptyBlock>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <BackLink to={ROUTES.report("agency")} label="Doanh thu theo đại lý / CTV" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold" style={{ color: agency.brandColor }}>
          {agency.name}
        </h2>
        <StatusPill {...AGENCY_KIND[agency.kind]} />
        <StatusPill label={`Hoa hồng ${agency.commissionRate}%`} className="bg-primary/10 text-primary" />
        <Link href={ROUTES.agencyDetail(agency.id)} className="text-xs font-medium text-primary hover:underline">
          Xem hồ sơ
        </Link>
      </div>
      <ShopSalesReport agencyId={agency.id} />
    </div>
  );
}
