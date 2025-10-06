import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\bbanana peel\\b/i]",
          message:
            "Non-diegetic humor keyword \"banana peel\" detected. Swap in an in-universe gag sanctioned by Paranoid Times canon.",
        },
        {
          selector: "Literal[value=/\\bclown car\\b/i]",
          message:
            "Non-diegetic humor keyword \"clown car\" detected. Channel conspiratorial wit instead of slapstick props.",
        },
        {
          selector: "Literal[value=/\\brubber chicken\\b/i]",
          message:
            "Non-diegetic humor keyword \"rubber chicken\" detected. Keep jokes rooted in the Paranoid Times mythos.",
        },
      ],
    },
  },
);
