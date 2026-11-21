"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { Order } from "@app/shared";
import { addPendingOrder, type PaginatedResponse } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useUI } from "@/stores/ui.store";

/**
 * Synthesizes a soft, pleasant 2-tone notification chime (D5 -> A5)
 * using the browser's native Web Audio API (no external download needed).
 */
function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Note 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.18, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch (err) {
    // Autoplay policy or unsupported audio silently suppressed
    console.debug("Web Audio chime suppressed:", err);
  }
}

/**
 * LiveOrderListener: Simulates live incoming order arrivals.
 * TODO: removed in Phase 5 when SSE is connected
 */
export function LiveOrderListener() {
  const t = useTranslations("orders");
  const queryClient = useQueryClient();
  const incrementNewOrdersCount = useUI((s) => s.incrementNewOrdersCount);

  const handleArrival = React.useCallback(async () => {
    try {
      // 1. Add new pending order in fake API store
      const newOrder: Order = await addPendingOrder();

      // 2. Update TanStack Query list caches by prepending new pending order
      queryClient.setQueriesData<PaginatedResponse<Order>>(
        { queryKey: queryKeys.orders.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          // Avoid duplicate insertion
          if (oldData.data.some((o) => o.id === newOrder.id)) return oldData;
          return {
            ...oldData,
            data: [newOrder, ...oldData.data],
            meta: {
              ...oldData.meta,
              total: (oldData.meta?.total ?? oldData.data.length) + 1,
            },
          };
        }
      );

      // Seed single order cache
      queryClient.setQueryData(queryKeys.orders.detail(newOrder.id), newOrder);

      // 3. Increment sidebar new orders badge count
      incrementNewOrdersCount();

      // 4. Play audio chime if soundOn is true
      const soundOn = useUI.getState().soundOn;
      if (soundOn) {
        playChime();
      }

      // 5. Trigger Sonner toast notification
      toast.success(t("live.newOrderTitle"), {
        description: t("live.newOrderDesc", {
          number: newOrder.number,
          customer: newOrder.customer?.name || "Customer",
        }),
      });

      return newOrder;
    } catch (err) {
      console.error("Failed to simulate incoming order:", err);
      return null;
    }
  }, [incrementNewOrdersCount, queryClient, t]);

  React.useEffect(() => {
    // Expose for deterministic test / screenshot triggering
    (window as unknown as { __triggerFakeNewOrder?: () => Promise<Order | null> })
      .__triggerFakeNewOrder = handleArrival;

    // TODO: removed in Phase 5 when SSE is connected
    // Interval between 40 and 60 seconds (default ~45s)
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = Math.floor(40000 + Math.random() * 20000); // 40-60s
      timeoutId = setTimeout(async () => {
        await handleArrival();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
      delete (window as unknown as { __triggerFakeNewOrder?: () => Promise<Order | null> })
        .__triggerFakeNewOrder;
    };
  }, [handleArrival]);

  return null;
}
