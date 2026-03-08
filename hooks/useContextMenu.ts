import { useCallback, useReducer } from "react";

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

/** Hook for right-click context menu positioning and visibility. */
export function useContextMenu() {
  const [state, setState] = useReducer(
    (s: ContextMenuState, a: Partial<ContextMenuState>) => ({ ...s, ...a }),
    { visible: false, x: 0, y: 0 },
  );

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setState({ visible: true, x: e.clientX, y: e.clientY });
  }, []);

  const close = useCallback(() => {
    setState({ visible: false });
  }, []);

  return { contextMenu: state, openContextMenu: open, closeContextMenu: close };
}
