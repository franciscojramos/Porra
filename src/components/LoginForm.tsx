"use client";

import { useFormState } from "react-dom";
import { loginAction } from "@/lib/actions";
import { SubmitButton } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useFormState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await loginAction(formData)) ?? undefined;
    },
    undefined
  );

  return (
    <form action={action} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
      <div>
        <label className="mb-1 block text-sm text-emerald-100">Usuario</label>
        <input
          name="username"
          required
          className="w-full rounded-xl border border-white/10 bg-emerald-950 px-4 py-3 text-white"
          placeholder="tu_usuario"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-emerald-100">Contraseña</label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-white/10 bg-emerald-950 px-4 py-3 text-white"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{state.error}</p>
      )}
      <SubmitButton label="Entrar" />
    </form>
  );
}
