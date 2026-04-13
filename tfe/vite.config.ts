import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  base: "/projets/tfe_test5/",
  plugins: [reactRouter(), tsconfigPaths()],
});