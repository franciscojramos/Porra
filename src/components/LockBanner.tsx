export function DraftBanner({ phase = "phase1" }: { phase?: "phase1" | "phase2" }) {
  const label =
    phase === "phase2"
      ? "Fase 2 en borrador. Puedes rellenar y cambiar tus eliminatorias."
      : "Fase 1 en borrador. Puedes rellenar y cambiar grupos, terceros y premios.";

  return (
    <div className="mb-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
      <strong>{label}</strong> Cuando termines, envíala desde <strong>Mi perfil</strong>.
    </div>
  );
}

export function LockBanner({
  locked,
  phase = "phase1",
}: {
  locked: boolean;
  phase?: "phase1" | "phase2";
}) {
  if (!locked) return null;

  const message =
    phase === "phase2"
      ? "Tu Fase 2 (eliminatorias) está enviada y bloqueada."
      : "Tu Fase 1 (grupos, terceros y premios) está enviada y bloqueada.";

  return (
    <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-amber-100">
      {message} Si necesitas un cambio, contacta con el administrador.
    </div>
  );
}

export function AdminEditBanner({ displayName }: { displayName: string }) {
  return (
    <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-amber-100">
      Modo administrador: editando los pronósticos de <strong>{displayName}</strong>.
      Puedes cambiar sus elecciones aunque estén enviadas y bloqueadas.
    </div>
  );
}
