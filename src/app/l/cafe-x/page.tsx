"use client";

import LinkTree from "@/components/customer/LinkTree";
import { useTableFromUrl } from "@/components/customer/shared";

export default function LinkTreePage() {
  useTableFromUrl();
  return <LinkTree />;
}
