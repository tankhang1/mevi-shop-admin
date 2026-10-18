import { type DependencyList, type ReactNode, useEffect } from "react";
import { create } from "zustand";

interface PageHeaderState {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

/** Buttons shown next to the layout's page title (ShopAdminLayout `actions`) */
export const usePageHeaderStore = create<PageHeaderState>()((set) => ({
  actions: null,
  setActions: (actions) => set({ actions }),
}));

/**
 * Put `render()` in the header row next to the title; cleared on unmount.
 * Re-rendered only when `deps` change — JSX is a new object every render, so it can't be the dep itself.
 */
export function usePageActions(render: () => ReactNode, deps: DependencyList = []) {
  const setActions = usePageHeaderStore((s) => s.setActions);
  useEffect(() => {
    setActions(render());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
  useEffect(() => () => setActions(null), [setActions]);
}
