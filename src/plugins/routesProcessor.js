import Vue from "vue";
import router from "@/router";
import store from "@/store";
import * as api from "@/api";
import { TOKEN_KEY } from "@/config";

function pathExists(path, routes) {
  return routes.some(
    x => x.path === `/:lang/${path}` || x.path === `/:lang/${path}/:token`
  );
}

function checkIfUnAuthRoute(path, routes) {
  return routes.some(
    route =>
      route.unAuth &&
      (route.path === `/:lang/${path}` ||
        route.path === `/:lang/${path}/:token`)
  );
}

Vue.prototype.$checkRoute = async () => {
  if (!store.state.serverSettings) await api.getServerConfig();

  const user = Vue.prototype.$user;
  const loggedIn = Boolean(localStorage.getItem(TOKEN_KEY));
  const path = window.location.hash.split("/")[2];
  const routes = router.options.routes;
  const unAuth = checkIfUnAuthRoute(path, routes);

  if (path === "404") return;

  if (!path) {
    user.go(loggedIn ? "dashboard" : "login");
    return;
  }

  if (!pathExists(path, routes)) {
    user.go("404");
    return;
  }

  if (loggedIn) {
    if (unAuth) {
      user.go("dashboard");
      return;
    }
  } else {
    if (path == "login" || unAuth) return;
    user.go("login");
  }
};

export default {};
