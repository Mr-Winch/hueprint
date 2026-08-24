"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ColorNames, getNtcColorName } from "./colorNames";
import { CommunityColorNameResolver } from "./colorHarmony.types";

const cacheKey = "hueprint-community-color-names-v1";

function readCache() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(cacheKey) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? parsed as Record<string, string> : {};
  } catch {
    return {} as Record<string, string>;
  }
}

export function useColorNames(colors: string[], resolver?: CommunityColorNameResolver) {
  const normalized = useMemo(() => [...new Set(colors.map((color) => color.toUpperCase()))], [colors.join("|")]);
  const [community, setCommunity] = useState<Record<string, string>>(readCache);
  const [offline, setOffline] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const requested = useRef(new Set<string>());

  useEffect(() => {
    if (!resolver) return;
    const missing = normalized.filter((hex) => !(hex in community) && !requested.current.has(hex));
    if (!missing.length) return;
    let cancelled = false;
    missing.forEach((hex) => requested.current.add(hex));
    setPending((current) => new Set([...current, ...missing]));
    void Promise.all(missing.map(async (hex) => {
      try {
        const result = (await resolver(hex))?.trim() || "Unnamed";
        if (cancelled) return;
        setCommunity((current) => {
          const next = { ...current, [hex]: result };
          if (result !== "Unnamed") window.localStorage.setItem(cacheKey, JSON.stringify(next));
          return next;
        });
      } catch {
        if (!cancelled) {
          setOffline((current) => new Set(current).add(hex));
          requested.current.delete(hex);
        }
      } finally {
        if (!cancelled) setPending((current) => { const next = new Set(current); next.delete(hex); return next; });
      }
    }));
    return () => { cancelled = true; };
  }, [community, normalized, resolver]);

  return useMemo(() => Object.fromEntries(normalized.map((hex): [string, ColorNames] => {
    const resolved = community[hex];
    const status = !resolver ? "unavailable" : pending.has(hex) ? "loading" : offline.has(hex) ? "offline" : resolved === "Unnamed" ? "unnamed" : resolved ? "resolved" : "loading";
    const label = status === "unavailable" ? "Not configured" : status === "loading" ? "Looking up…" : status === "offline" ? "No connection" : resolved ?? "Unnamed";
    return [hex, { ntc: getNtcColorName(hex), community: label, communityStatus: status }];
  })), [community, normalized, offline, pending, resolver]);
}
