import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("projets/tfe_test5", "./routes/home.tsx"),
  route("projets/tfe_test5/greenhouseData/:id", "./routes/greenhouseData.tsx")
] satisfies RouteConfig;