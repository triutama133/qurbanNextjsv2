// Use Next.js recommended ESLint config without directly importing the plugin.
// This avoids relying on a separate `eslint-plugin-next` package which may not
// be available in some build environments.
export default [
  {
    extends: ["next/core-web-vitals"],
  },
];
