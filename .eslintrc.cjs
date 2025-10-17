module.exports = {
  extends: ["next/core-web-vitals", "plugin:@tanstack/query/recommended"],
  plugins: ["@tanstack/query"],
  rules: {
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
  },
};
