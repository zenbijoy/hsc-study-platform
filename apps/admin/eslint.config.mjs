import ts from "typescript-eslint";

export default ts.config(
  {
    ignores: [".next/**", "node_modules/**", "dist/**", ".turbo/**"],
  },
  ...ts.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "off",
    },
  }
);
