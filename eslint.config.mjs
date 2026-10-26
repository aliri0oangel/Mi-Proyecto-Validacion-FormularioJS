import js from "@eslint/js";

/**
 * Configuracion ESLint 10 (flat config).
 * Reglas orientadas a Clean Code: consistencia, prevencion de
 * variables globales accidentales, funciones pequenas y sin console.
 */
export default [
  {
    ignores: ["node_modules/**", "tailwind.css", "package-lock.json"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        globalThis: "readonly",
        // Namespaces declarados en validators.js / form_ui.js
        Validators: "readonly",
        FormUI: "readonly",
      },
    },
    rules: {
      // Consistencia y claridad
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "consistent-return": "error",
      "prefer-template": "error",
      // Seguridad e higiene
      "no-console": "error",
      "no-implicit-globals": "error",
      "no-undef": "error",
      // Tamaño y complejidad razonables (advertencia, no error)
      complexity: ["warn", 10],
      "max-lines-per-function": [
        "warn",
        { max: 45, skipComments: true, skipBlankLines: true },
      ],
      "max-depth": ["warn", 3],
      "max-params": ["warn", 3],
    },
  },
];
