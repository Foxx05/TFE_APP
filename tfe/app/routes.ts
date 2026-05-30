import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("projets/tfe_appDemo", "./routes/home.tsx"),
  route("projets/tfe_appDemo/greenhouseData/:id", "./routes/greenhouseData.tsx"),
  route("projets/tfe_appDemo/manageGreenhouses", "./routes/manageGreenhouses.tsx"),
] satisfies RouteConfig;