"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function Toast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("msg");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        // Limpiar el query param después de mostrar el mensaje
        const url = new URL(window.location.href);
        url.searchParams.delete("msg");
        router.replace(url.pathname + url.search, { scroll: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, router]);

  if (!show || !message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-lg bg-emerald-600 px-6 py-3 text-white shadow-lg">
        <p className="font-medium">✓ {message}</p>
      </div>
    </div>
  );
}
