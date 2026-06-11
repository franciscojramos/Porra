import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Mundial 2026</p>
      <h1 className="mt-4 text-4xl font-black text-white">Porra entre amigos</h1>
      <p className="mx-auto mt-4 max-w-xl text-emerald-100">
        Entra con tu usuario y contraseña para rellenar tus pronósticos de grupos,
        eliminatorias y premios individuales.
      </p>
      <LoginForm />
      <p className="mt-6 text-sm text-emerald-200">
        Si no tienes cuenta, pídesela al administrador de la porra.
      </p>
    </div>
  );
}
