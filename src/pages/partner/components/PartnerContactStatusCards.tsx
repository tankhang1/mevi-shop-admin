import type { ElementType } from "react";
import { Clock, PhoneCall, UserCheck } from "lucide-react";
import { Card, cn, Skeleton } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { PartnerContactStatusCounts } from "@/features/partner";

interface StatusBadgeItem {
  key: string;
  label: string;
  count: number | undefined;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
}

interface PartnerContactStatusCardsProps {
  counts?: PartnerContactStatusCounts;
  isLoading?: boolean;
}

export function PartnerContactStatusCards({
  counts,
  isLoading,
}: PartnerContactStatusCardsProps) {
  const items: StatusBadgeItem[] = [
    {
      key: "new",
      label: "Mới (Chờ liên hệ)",
      count: counts?.new,
      icon: Clock,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "contacted",
      label: "Đã liên hệ",
      count: counts?.contacted,
      icon: PhoneCall,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "accountCreated",
      label: "Đã cấp tài khoản",
      count: counts?.accountCreated,
      icon: UserCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    // {
    //   key: "rejected",
    //   label: "Không hợp tác",
    //   count: counts?.rejected,
    //   icon: UserX,
    //   iconBg: "bg-rose-500/10",
    //   iconColor: "text-rose-600 dark:text-rose-400",
    // },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.key} className="p-3 shadow-none transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9",
                  item.iconBg,
                  item.iconColor,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-5 w-12" />
                ) : (
                  <p className="text-lg font-bold tracking-tight tabular-nums text-foreground sm:text-xl">
                    {(item.count ?? 0).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
