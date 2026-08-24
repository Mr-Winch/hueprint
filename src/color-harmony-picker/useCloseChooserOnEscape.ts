"use client";

import { RefObject, useEffect } from "react";

export function useCloseChooserOnEscape(detailsRef: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    function closeChooser(event: KeyboardEvent) {
      const details = detailsRef.current;
      if (event.key !== "Escape" || !details?.open) return;

      event.preventDefault();
      event.stopPropagation();
      details.open = false;
      details.querySelector<HTMLElement>("summary")?.focus();
    }

    document.addEventListener("keydown", closeChooser, true);
    return () => document.removeEventListener("keydown", closeChooser, true);
  }, [detailsRef]);
}
