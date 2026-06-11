import { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-emerald-100">{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur ${className}`}
    >
      {title && <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>}
      {children}
    </section>
  );
}

export function ScoreInput({
  name,
  defaultValue,
  label,
  disabled = false,
}: {
  name: string;
  defaultValue?: number;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-emerald-100">
      <span>{label}</span>
      <input
        type="number"
        name={name}
        min={0}
        max={20}
        defaultValue={defaultValue ?? 0}
        disabled={disabled}
        readOnly={disabled}
        className="w-16 rounded-lg border border-white/10 bg-emerald-950 px-2 py-1 text-center text-white disabled:opacity-60"
      />
    </label>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
    >
      {label}
    </button>
  );
}

export function TeamSelect({
  name,
  teams,
  defaultValue,
  label,
  disabled = false,
}: {
  name: string;
  teams: { id: string; name: string; code: string }[];
  defaultValue?: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-emerald-100">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2 text-white disabled:opacity-60"
      >
        <option value="">Elegir...</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name} ({team.code})
          </option>
        ))}
      </select>
    </label>
  );
}

export function PlayerSelect({
  name,
  players,
  defaultValue,
  label,
  disabled = false,
}: {
  name: string;
  players: { value: string; label: string; teamName: string }[];
  defaultValue?: string | null;
  label: string;
  disabled?: boolean;
}) {
  const byTeam = players.reduce<Record<string, typeof players>>((acc, player) => {
    (acc[player.teamName] ||= []).push(player);
    return acc;
  }, {});

  const teams = Object.keys(byTeam).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <label className="flex flex-col gap-1 text-sm text-emerald-100">
      <span>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        className="rounded-lg border border-white/10 bg-emerald-950 px-3 py-2 text-white disabled:opacity-60"
      >
        <option value="">Elegir jugador...</option>
        {teams.map((teamName) => (
          <optgroup key={teamName} label={teamName}>
            {byTeam[teamName].map((player) => (
              <option key={player.value} value={player.value}>
                {player.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
