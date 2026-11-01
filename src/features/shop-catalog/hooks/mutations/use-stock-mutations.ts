import { useMutation } from "@tanstack/react-query";
import { stockApi } from "../../api";
import type {
  ApproveStockMovementInput,
  RejectStockMovementInput,
  StockAdjustmentInput,
  StockReceiptInput,
} from "../../types";
import { useInvalidateProducts } from "./invalidate";

export function useCreateStockReceipt() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: StockReceiptInput }) =>
      stockApi.receipt(productId, data),
    onSuccess: invalidate,
  });
}

export function useCreateStockAdjustment() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: StockAdjustmentInput }) =>
      stockApi.adjust(productId, data),
    onSuccess: invalidate,
  });
}

export function useApproveStockMovement() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveStockMovementInput }) => stockApi.approve(id, data),
    onSuccess: invalidate,
  });
}

export function useRejectStockMovement() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectStockMovementInput }) => stockApi.reject(id, data),
    onSuccess: invalidate,
  });
}
