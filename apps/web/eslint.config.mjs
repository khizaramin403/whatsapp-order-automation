import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const rtlPlugin = {
  rules: {
    "no-physical-tailwind": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow physical left/right Tailwind classes in favor of logical RTL classes",
        },
        schema: [],
      },
      create(context) {
        const physicalRegex = /\b(ml-|mr-|pl-|pr-|left-|right-|text-left\b|text-right\b|border-l-|border-r-|rounded-l-|rounded-r-)\S*/g;
        return {
          JSXAttribute(node) {
            if (node.name && node.name.name === "className" && node.value && typeof node.value.value === "string") {
              const matches = node.value.value.match(physicalRegex);
              if (matches) {
                context.report({
                  node,
                  message: `Avoid physical Tailwind classes (${matches.join(", ")}). Use logical classes (ms-, me-, ps-, pe-, start-, end-, text-start, text-end) for RTL support.`,
                });
              }
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      rtl: rtlPlugin,
    },
    rules: {
      "rtl/no-physical-tailwind": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
