"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

export default function ClerkProviderWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "hsl(221 83% 53%)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: isDark
            ? "bg-card border border-border shadow-lg"
            : "bg-card border border-border shadow-lg",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:opacity-90 transition normal-case font-semibold",
          footerActionLink: "text-primary hover:underline",
          avatarBox: "h-9 w-9 ring-2 ring-border hover:ring-primary/40 transition-all",
          userButtonPopoverCard: "bg-card border border-border shadow-lg",
          userButtonPopoverActionButton: "text-foreground hover:bg-muted",
          userButtonPopoverActionButtonText: "text-foreground",
          userButtonPopoverFooter: "hidden",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
