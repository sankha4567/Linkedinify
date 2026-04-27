import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Convex auto-generated code — owned by the framework, no point linting:
    "convex/_generated/**",
  ]),
  {
    // Avatar / post images come from external CDNs (Clerk, Convex storage,
    // FileReader blob: URLs for previews). Routing these through next/image
    // would require configuring remotePatterns for every host and breaks the
    // blob: previews. Disabling the rule project-wide is the pragmatic call.
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
