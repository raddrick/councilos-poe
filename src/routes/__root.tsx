import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { WalletProvider } from "../lib/wallet";
import { WalletBar } from "../components/WalletBar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Route not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This council record doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-primary-foreground"
          >
            Back to console
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CouncilOS Console — Proof of Effort on Monad" },
      {
        name: "description",
        content:
          "CouncilOS is an EVM smart contract primitive for StudioOS-style venture studios. A Director defines a Founder and Product together. The Founder owns the Product",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "CouncilOS Console — Proof of Effort on Monad" },
      { name: "twitter:title", content: "CouncilOS Console — Proof of Effort on Monad" },
      { property: "og:description", content: "CouncilOS is an EVM smart contract primitive for StudioOS-style venture studios. A Director defines a Founder and Product together. The Founder owns the Product" },
      { name: "twitter:description", content: "CouncilOS is an EVM smart contract primitive for StudioOS-style venture studios. A Director defines a Founder and Product together. The Founder owns the Product" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e3feafc4-45d7-4f00-a98e-ca9c339c43fc" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e3feafc4-45d7-4f00-a98e-ca9c339c43fc" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <div className="min-h-screen">
          <WalletBar />
          {/* Required: nested routes render here. */}
          <Outlet />
          <footer className="mx-auto max-w-7xl px-5 py-10 label-mono">
            CouncilOS · Monad Testnet (chain 10143) · Director → Founder → Fractionals → Executors
          </footer>
        </div>
        <Toaster theme="dark" position="bottom-right" richColors />
      </WalletProvider>
    </QueryClientProvider>
  );
}
