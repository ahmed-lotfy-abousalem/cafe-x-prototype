"use client";

import { useEffect } from "react";
import { useDevice, useVenue } from "@/lib/store";
import type { Settings } from "@/lib/types";

/** Reads `?t=<token>` from the QR link once and remembers the table for this device. */
export function useTableFromUrl() {
  const setTableToken = useDevice((s) => s.setTableToken);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (t) setTableToken(t);
  }, [setTableToken]);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function openState(s: Settings, now = new Date()) {
  const h = s.hours.find((d) => d.day === DAYS[now.getDay()]);
  if (!h || h.closed) return { open: false, close: "" };
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = h.open.split(":").map(Number);
  const [ch, cm] = h.close.split(":").map(Number);
  const o = oh * 60 + om;
  let c = ch * 60 + cm;
  if (c <= o) c += 24 * 60;
  const m = mins < o ? mins + 24 * 60 : mins;
  return { open: m >= o && m < c, close: h.close };
}

export function useActiveOrder() {
  const myOrders = useDevice((s) => s.myOrders);
  const orders = useVenue((s) => s.orders);
  return orders.find((o) => myOrders.includes(o.id) && o.type === "dine_in" && o.status !== "served" && o.status !== "cancelled");
}
