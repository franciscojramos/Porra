"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function Toast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("msg");
  const [show, setShow] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setShow(false);
      return;
    }

    setShow(true);
    const hideTimer = setTimeout(() => setShow(false), 3000);
    const cleanTimer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("msg");
      router.replace(url.pathname + url.search, { scroll: false });
    }, 3300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(cleanTimer);
    };
  }, [message, router]);

  if (!message || !show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-lg bg-emerald-600 px-6 py-3 text-white shadow-lg">
        <p className="font-medium">✓ {message}</p>
      </div>
    </div>
  );
}
