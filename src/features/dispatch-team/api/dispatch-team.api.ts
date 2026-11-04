import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import { cleanFilters, toSpringPageParams } from "@/lib/pagination";
import type { ApiResponse, Paginated } from "@/types/api";
import type {
  AssignOrdersResult,
  DispatchTeam,
  DispatchTeamInput,
  DispatchTeamListParams,
  DispatchTeamRow,
} from "../types";

const EP = API_ENDPOINTS.admin.dispatchTeams;

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

const mapDispatchTeam = (t: Record<string, unknown>): DispatchTeamRow => {
  const members = Array.isArray(t.members)
    ? (t.members as Array<Record<string, unknown>>).map((m) => ({
        id: String(m.id ?? m.userId ?? ""),
        name: String(m.fullName || m.name || "Thành viên"),
        fullName: m.fullName ? String(m.fullName) : undefined,
      }))
    : [];

  const leaderObj =
    t.leader && typeof t.leader === "object"
      ? (t.leader as Record<string, unknown>)
      : null;

  const categoryObjects = Array.isArray(t.categories)
    ? (t.categories as Array<Record<string, unknown>>).map((c) => ({
        id: Number(c.id ?? 0) || String(c.id ?? ""),
        name: String(c.name ?? ""),
      }))
    : [];

  const categories = categoryObjects.map((c) => String(c.id)).filter(Boolean);
  const categoryIds = categoryObjects
    .map((c) => Number(c.id))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    id: String(t.id ?? ""),
    name: String(t.name ?? ""),
    code: t.code ? String(t.code) : undefined,
    description: t.description ? String(t.description) : undefined,
    active: t.active !== false,
    members,
    leader: leaderObj
      ? {
          id: String(leaderObj.id ?? leaderObj.userId ?? ""),
          name: String(leaderObj.fullName || leaderObj.name || "Trưởng nhóm"),
        }
      : null,
    leaderId: leaderObj ? String(leaderObj.id ?? leaderObj.userId ?? "") : null,
    memberIds: members.map((m) => m.id).filter(Boolean),
    memberCount:
      typeof t.memberCount === "number" ? t.memberCount : members.length,
    categories,
    categoryIds,
    categoryObjects,
    processingCount:
      typeof t.activeOrderCount === "number"
        ? t.activeOrderCount
        : typeof t.processingCount === "number"
          ? t.processingCount
          : 0,
    openOrders:
      typeof t.activeOrderCount === "number"
        ? t.activeOrderCount
        : typeof t.processingCount === "number"
          ? t.processingCount
          : 0,
    createdAt: String(t.createdAt || new Date().toISOString()),
    updatedAt: t.updatedAt ? String(t.updatedAt) : undefined,
  };
};

const toBackendRequest = (data: Partial<DispatchTeamInput>) => {
  const memberUserIds = (data.memberUserIds ?? data.memberIds ?? [])
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);

  const leaderUserId =
    data.leaderUserId !== undefined &&
    data.leaderUserId !== null &&
    data.leaderUserId !== ""
      ? Number(data.leaderUserId)
      : data.leaderId !== undefined &&
          data.leaderId !== null &&
          data.leaderId !== ""
        ? Number(data.leaderId)
        : null;

  const categoryIds = (data.categoryIds ?? data.categories ?? [])
    .map((id) => Number(id))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    name: data.name,
    description: data.description || undefined,
    active: data.active ?? true,
    memberUserIds,
    leaderUserId:
      leaderUserId && Number.isFinite(leaderUserId) ? leaderUserId : null,
    categoryIds,
  };
};

export const dispatchTeamApi = {
  list: async (
    params?: DispatchTeamListParams,
  ): Promise<Paginated<DispatchTeamRow>> => {
    const keyword =
      params?.keyword ||
      (typeof (params as Record<string, unknown> | undefined)?.search ===
      "string"
        ? ((params as Record<string, unknown>).search as string)
        : undefined);
    const queryParams = params
      ? toSpringPageParams({
          ...cleanFilters(params as unknown as Record<string, unknown>),
          keyword,
        })
      : undefined;
    const res = await realApiClient.get<unknown>(EP.base, {
      params: queryParams,
    });
    const raw = unwrap<unknown>(res.data);

    let list: Array<Record<string, unknown>> = [];
    let total = 0;
    let page = 1;
    let size = 20;

    if (Array.isArray(raw)) {
      list = raw as Array<Record<string, unknown>>;
      total = list.length;
      size = list.length || 20;
    } else if (raw && typeof raw === "object") {
      if (
        "content" in raw &&
        Array.isArray((raw as { content: unknown[] }).content)
      ) {
        list = (raw as { content: Array<Record<string, unknown>> }).content;
        total =
          (raw as { totalElements?: number }).totalElements ?? list.length;
        page = ((raw as { page?: number }).page ?? 0) + 1;
        size = (raw as { size?: number }).size ?? list.length;
      } else if (
        "items" in raw &&
        Array.isArray((raw as { items: unknown[] }).items)
      ) {
        list = (raw as { items: Array<Record<string, unknown>> }).items;
        total = (raw as { total?: number }).total ?? list.length;
        page = (raw as { page?: number }).page ?? 1;
        size = (raw as { size?: number }).size ?? list.length;
      }
    }

    const items = list.map(mapDispatchTeam);

    return {
      items,
      total,
      page,
      size,
    };
  },

  detail: async (id: string | number): Promise<DispatchTeam> => {
    const res = await realApiClient.get<unknown>(EP.detail(id));
    const raw = unwrap<Record<string, unknown>>(res.data);
    return mapDispatchTeam(raw);
  },

  create: async (data: DispatchTeamInput): Promise<DispatchTeam> => {
    const payload = toBackendRequest(data);
    const res = await realApiClient.post<unknown>(EP.base, payload);
    const raw = unwrap<Record<string, unknown>>(res.data);
    return mapDispatchTeam(raw);
  },

  update: async (
    id: string | number,
    data: Partial<DispatchTeamInput>,
  ): Promise<DispatchTeam> => {
    const payload = toBackendRequest(data);
    const res = await realApiClient.put<unknown>(EP.detail(id), payload);
    const raw = unwrap<Record<string, unknown>>(res.data);
    return mapDispatchTeam(raw);
  },

  remove: async (id: string | number) => {
    await realApiClient.delete(EP.detail(id));
  },

  assignOrders: async () => {
    const res = await realApiClient.post<
      AssignOrdersResult | ApiResponse<AssignOrdersResult>
    >(EP.assignOrders);
    return unwrap<AssignOrdersResult>(res.data);
  },

  /** Tương thích cũ */
  autoAssign: async () => {
    const res = await realApiClient.post<
      AssignOrdersResult | ApiResponse<AssignOrdersResult>
    >(EP.autoAssign);
    const data = unwrap<AssignOrdersResult>(res.data);
    return {
      assigned: data.assigned,
      unmatched: data.remaining ?? data.unmatched ?? 0,
    };
  },
};
