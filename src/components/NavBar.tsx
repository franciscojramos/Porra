import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { NavBarMenu } from "@/components/NavBarMenu";

export async function NavBar() {
  const session = await getSession();
  if (!session) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-emerald-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
          <Link href="/inicio" className="block shrink-0">
            <Image
              src="/logo.png"
              alt="Porrita.io Amigos"
              width={677}
              height={369}
              className="h-11 w-auto sm:h-12 md:h-14"
              priority
            />
          </Link>
          <p className="hidden min-w-0 truncate text-sm text-emerald-200 sm:block">
            Hola, {session.displayName}
            {session.isAdmin && (
              <span className="ml-2 rounded-full bg-amber-500/25 px-2 py-0.5 text-xs text-amber-200">
                Admin
              </span>
            )}
          </p>
        </div>

        <NavBarMenu displayName={session.displayName} isAdmin={session.isAdmin} />
      </div>
    </header>
  );
}
