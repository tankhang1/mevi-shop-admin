import { Printer } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ORDER_PAYMENT_STATUS,
  type Order,
  type OrderItem,
} from "@/features/order";
import { formatDate, formatVnd } from "@/lib/format";

const CARRIER_LABELS: Record<string, string> = {
  SELF_DELIVERY: "Tự giao hàng",
  GHN: "Giao Hàng Nhanh (GHN)",
  GHTK: "Giao Hàng Tiết Kiệm (GHTK)",
  VIETTEL_POST: "Viettel Post",
  VNPOST: "VNPost",
  JT_EXPRESS: "J&T Express",
  NINJA_VAN: "Ninja Van",
  OTHER: "Đơn vị khác",
};

function escapeHtml(value?: string | null): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getRecipientInfo(order: Order) {
  const name = order.recipient?.name ?? order.recipientName ?? "—";
  const phone = order.recipient?.phone ?? order.recipientPhone ?? "—";
  const address =
    order.address ||
    [
      order.recipient?.addressLine,
      order.recipient?.district,
      order.recipient?.province,
    ]
      .filter(Boolean)
      .join(", ") ||
    "—";
  return { name, phone, address };
}

function getItemUnitPrice(item: OrderItem): number {
  return item.unitPrice ?? item.price ?? 0;
}

function getItemLineTotal(item: OrderItem): number {
  return item.lineTotal ?? getItemUnitPrice(item) * item.quantity;
}

function getItemSubtitle(item: OrderItem): string {
  const parts: string[] = [];
  if (item.variant?.title) parts.push(item.variant.title);
  if (item.baseUnit && item.unitQuantity && item.unitQuantity > 0) {
    parts.push(`${item.unitQuantity} ${item.baseUnit}`);
  } else if (item.baseUnit && !item.variant?.title) {
    parts.push(item.baseUnit);
  }
  return parts.join(" · ");
}

function printOrderSlip(order: Order) {
  const items = order.items ?? [];
  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
  const senderName =
    order.storefront?.name ?? order.shopName ?? "Gian hàng Mevi";
  const carrierLabel = order.shippingCarrier
    ? (CARRIER_LABELS[order.shippingCarrier] ?? order.shippingCarrier)
    : "Chưa chọn";
  const isPaid = order.paymentStatus === "PAID";
  const codAmount = isPaid ? 0 : order.total;
  const customerNote = order.deliveryNote ?? order.note;
  const recipient = getRecipientInfo(order);

  const rowsHtml = items
    .map((item, idx) => {
      const name = escapeHtml(item.product?.title ?? item.name);
      const sub = getItemSubtitle(item);
      const unitPrice = formatVnd(getItemUnitPrice(item));
      const lineTotal = formatVnd(getItemLineTotal(item));
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td>
            <div style="font-weight:600;">${name}</div>
            ${sub ? `<div style="font-size:11px;color:#555;">${escapeHtml(sub)}</div>` : ""}
          </td>
          <td style="text-align:center;">${item.quantity}</td>
          <td style="text-align:right;">${escapeHtml(unitPrice)}</td>
          <td style="text-align:right;font-weight:600;">${escapeHtml(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Phiếu giao hàng - ${escapeHtml(order.code)}</title>
  <style>
    @page { size: A5 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111827;
      font-size: 12px;
      line-height: 1.45;
      margin: 0;
      padding: 10mm;
    }
    .sheet { border: 1.5px solid #111827; padding: 12px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1.5px dashed #9ca3af;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .brand { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; color: #166534; }
    .doc-title { font-size: 13px; font-weight: 700; text-transform: uppercase; }
    .meta { text-align: right; font-size: 11px; }
    .code { font-family: monospace; font-size: 13px; font-weight: 700; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      border-bottom: 1.5px dashed #9ca3af;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .box-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #4b5563;
      margin-bottom: 3px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { border: 1px solid #d1d5db; padding: 5px 6px; vertical-align: top; }
    th { background: #f3f4f6; font-size: 11px; font-weight: 700; text-align: left; }
    .summary {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1.5px dashed #9ca3af;
      padding-top: 10px;
      gap: 12px;
    }
    .cod-box {
      border: 1.5px solid #111827;
      padding: 8px 12px;
      text-align: center;
      min-width: 170px;
    }
    .cod-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #4b5563; }
    .cod-amount { font-size: 17px; font-weight: 800; margin-top: 2px; }
    .note {
      margin-top: 8px;
      padding: 6px 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      font-size: 11px;
    }
    .sign-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      text-align: center;
      font-size: 11px;
    }
    .sign-space { height: 42px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="brand">MEVI SHOP</div>
        <div class="doc-title">Phiếu đóng gói &amp; giao hàng</div>
      </div>
      <div class="meta">
        <div>Mã đơn: <span class="code">${escapeHtml(order.code)}</span></div>
        <div>Ngày đặt: ${escapeHtml(formatDate(order.createdAt))}</div>
        ${order.trackingCode ? `<div>Mã vận đơn: <span class="code">${escapeHtml(order.trackingCode)}</span></div>` : ""}
      </div>
    </div>

    <div class="grid-2">
      <div>
        <div class="box-label">Từ (Người gửi)</div>
        <div style="font-weight:700;">${escapeHtml(senderName)}</div>
        <div style="font-size:11px;color:#374151;margin-top:2px;">ĐVVC: ${escapeHtml(carrierLabel)}</div>
      </div>
      <div>
        <div class="box-label">Đến (Người nhận)</div>
        <div style="font-weight:700;">${escapeHtml(recipient.name)}</div>
        <div>SĐT: <strong>${escapeHtml(recipient.phone)}</strong></div>
        <div style="font-size:11px;">${escapeHtml(recipient.address)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:32px;text-align:center;">STT</th>
          <th>Sản phẩm</th>
          <th style="width:42px;text-align:center;">SL</th>
          <th style="width:82px;text-align:right;">Đơn giá</th>
          <th style="width:92px;text-align:right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="5" style="text-align:center;color:#6b7280;">Không có sản phẩm</td></tr>`}
      </tbody>
    </table>

    <div class="summary">
      <div style="font-size:11px;">
        <div>Tổng số lượng: <strong>${totalQty}</strong> sản phẩm</div>
        <div>Tổng tiền hàng: <strong>${escapeHtml(formatVnd(order.total))}</strong></div>
        <div>Thanh toán: <strong>${escapeHtml(ORDER_PAYMENT_STATUS[order.paymentStatus ?? "UNPAID"].label)}</strong></div>
      </div>
      <div class="cod-box">
        <div class="cod-label">Tiền thu hộ (COD)</div>
        <div class="cod-amount">${escapeHtml(formatVnd(codAmount))}</div>
      </div>
    </div>

    ${customerNote ? `<div class="note"><strong>Ghi chú khách hàng:</strong> ${escapeHtml(customerNote)}</div>` : ""}

    <div class="sign-row">
      <div>
        <strong>Chữ ký người giao</strong>
        <div class="sign-space"></div>
      </div>
      <div>
        <strong>Chữ ký người nhận</strong>
        <div style="font-size:10px;color:#6b7280;">(Kiểm tra kỹ hàng trước khi ký nhận)</div>
        <div class="sign-space"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 300);
  };

  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  cleanup();
}

export function OrderPrintDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}) {
  const items = order.items ?? [];
  const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);
  const senderName =
    order.storefront?.name ?? order.shopName ?? "Gian hàng Mevi";
  const carrierLabel = order.shippingCarrier
    ? (CARRIER_LABELS[order.shippingCarrier] ?? order.shippingCarrier)
    : "Chưa chọn";
  const isPaid = order.paymentStatus === "PAID";
  const codAmount = isPaid ? 0 : order.total;
  const customerNote = order.deliveryNote ?? order.note;
  const recipient = getRecipientInfo(order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước phiếu in đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border-2 border-foreground/80 bg-white p-4 text-xs text-foreground sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed pb-3">
            <div>
              <div className="text-base font-extrabold tracking-wide text-primary">
                MEVI SHOP
              </div>
              <div className="text-xs font-bold uppercase">
                Phiếu đóng gói &amp; giao hàng
              </div>
            </div>
            <div className="text-right text-[11px]">
              <div>
                Mã đơn:{" "}
                <span className="font-mono text-xs font-bold">
                  {order.code}
                </span>
              </div>
              <div>Ngày đặt: {formatDate(order.createdAt)}</div>
              {order.trackingCode && (
                <div>
                  Mã vận đơn:{" "}
                  <span className="font-mono font-bold">
                    {order.trackingCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 border-b border-dashed py-3 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground">
                Từ (Người gửi)
              </div>
              <div className="mt-0.5 font-bold">{senderName}</div>
              <div className="mt-0.5 text-muted-foreground">
                ĐVVC: {carrierLabel}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-muted-foreground">
                Đến (Người nhận)
              </div>
              <div className="mt-0.5 font-bold">{recipient.name}</div>
              <div>
                SĐT: <span className="font-semibold">{recipient.phone}</span>
              </div>
              <div className="text-muted-foreground">{recipient.address}</div>
            </div>
          </div>

          <div className="overflow-x-auto py-3">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="w-10 border px-2 py-1.5 text-center">STT</th>
                  <th className="border px-2 py-1.5 text-left">Sản phẩm</th>
                  <th className="w-12 border px-2 py-1.5 text-center">SL</th>
                  <th className="w-24 border px-2 py-1.5 text-right">
                    Đơn giá
                  </th>
                  <th className="w-28 border px-2 py-1.5 text-right">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const sub = getItemSubtitle(item);
                    return (
                      <tr key={item.id ?? `${item.productId}-${idx}`}>
                        <td className="border px-2 py-1.5 text-center">
                          {idx + 1}
                        </td>
                        <td className="border px-2 py-1.5">
                          <div className="font-medium">
                            {item.product?.title ?? item.name}
                          </div>
                          {sub && (
                            <div className="text-[11px] text-muted-foreground">
                              {sub}
                            </div>
                          )}
                        </td>
                        <td className="border px-2 py-1.5 text-center">
                          {item.quantity}
                        </td>
                        <td className="border px-2 py-1.5 text-right">
                          {formatVnd(getItemUnitPrice(item))}
                        </td>
                        <td className="border px-2 py-1.5 text-right font-semibold">
                          {formatVnd(getItemLineTotal(item))}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="border px-2 py-3 text-center text-muted-foreground"
                    >
                      Không có sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3 border-t border-dashed pt-3">
            <div className="space-y-0.5 text-[11px]">
              <div>
                Tổng số lượng: <strong>{totalQty}</strong> sản phẩm
              </div>
              <div>
                Tổng tiền hàng: <strong>{formatVnd(order.total)}</strong>
              </div>
              <div>
                Thanh toán:{" "}
                <strong>
                  {ORDER_PAYMENT_STATUS[order.paymentStatus ?? "UNPAID"].label}
                </strong>
              </div>
            </div>
            <div className="min-w-[160px] border-2 border-foreground/80 px-3 py-2 text-center">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">
                Tiền thu hộ (COD)
              </div>
              <div className="mt-0.5 text-base font-extrabold">
                {formatVnd(codAmount)}
              </div>
            </div>
          </div>

          {customerNote && (
            <div className="mt-3 rounded border bg-muted/30 px-2.5 py-2 text-[11px]">
              <strong>Ghi chú khách hàng:</strong> {customerNote}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={() => printOrderSlip(order)}>
            <Printer className="mr-1.5 h-4 w-4" /> In đơn hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
