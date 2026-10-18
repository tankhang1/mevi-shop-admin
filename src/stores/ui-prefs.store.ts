import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListView = "table" | "grid";

interface UiPrefsState {
  /** Per-page list view, keyed by page id */
  views: Record<string, ListView>;
  setView: (page: string, view: ListView) => void;
}

/** Per-user UI preferences, remembered in localStorage */
export const useUiPrefs = create<UiPrefsState>()(
  persist(
    (set) => ({
      views: {},
      setView: (page, view) => set((s) => ({ views: { ...s.views, [page]: view } })),
    }),
    { name: "shop-admin-ui-prefs" },
  ),
);

export function useListView(page: string, fallback: ListView = "table") {
  const view = useUiPrefs((s) => s.views[page] ?? fallback);
  const setView = useUiPrefs((s) => s.setView);
  return [view, (v: ListView) => setView(page, v)] as const;
}
