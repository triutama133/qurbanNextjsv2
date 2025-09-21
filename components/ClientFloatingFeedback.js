"use client";
import FloatingFeedback from "../components/FloatingFeedback";
import { usePathname } from "next/navigation";

export default function ClientFloatingFeedback() {
  const pathname = usePathname();
  if (pathname === "/qurban/home") return null;
  return <FloatingFeedback />;
}
