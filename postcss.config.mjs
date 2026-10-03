const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default {
  plugins: {
    "@tailwindcss/postcss": {},
    "./build/public-paths.cjs": { basePath },
  },
};
