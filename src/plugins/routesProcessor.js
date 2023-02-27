import Vue from "vue";
import router from "@/router";
import store from "@/store";
import * as api from "@/api";
import { TOKEN_KEY } from "@/config";

Vue.prototype.$checkRoute = async () => {
  if (!store.state.serverSettings) await api.getServerConfig();
  const user = Vue.prototype.$user;
  const loggedIn = !!localStorage.getItem(TOKEN_KEY);
  const path = window.location.hash.split("/")[2];
  const unAuth = !!router.options.routes
    .filter(x => x.unAuth)
    .find(
      x => x.path === `/:lang/${path}` || x.path === `/:lang/${path}/:token`
    );
  let _ = new Proxy(new URLSearchParams(window.location.hash), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  _ = _["#/ru/login?token"];
  if (!path) {
    user.go(loggedIn ? "dashboard" : "login");
    return;
  }
  if (path && !loggedIn && path != "login" && !unAuth && !_) {
    if (path != "404") user.go("404");
    return;
  } else if (path && loggedIn && unAuth) {
    if (path != "404") user.go("404");
    return;
  }
};

export default {};
