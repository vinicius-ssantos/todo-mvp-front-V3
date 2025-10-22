import { Suspense } from "react";
import type { ReactNode } from "react";

// Força renderização dinâmica deste segmento (evita SSG do "/")
export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
};

// Este template envolve todo o segmento raiz ("/") em um Suspense boundary,
// cobrindo qualquer uso de useSearchParams/usePathname em componentes cliente.
export default function RootTemplate({children}: Props) {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando…</div>}>
            {children}
        </Suspense>
    );
}