import Vue from "vue";
import axios from "axios";
import store from "@/store";
import { TOKEN_KEY } from "@/config";

(async () => {
  const user = Vue.prototype.$user;
  if (!localStorage.getItem(TOKEN_KEY)) {
    const token = window.location.hash.split("/")[3];
    let _ = null;
    if (token) {
      _ = await axios.get("ServerSettings/Info");
      try {
        if (_.data && _.data.registrationbyToken) {
          store.commit("setServerSettings", _.data);
          _ = await axios.post("Integration/IntegratedUser", {
            Token: token ? token : null
          });
          if (_.data && _.data.token) {
            user.setToken(_.data.token);
            store.commit("setUser", _.data.role);
            user.go("dashboard");
          } else {
            user.logout();
          }
        }
      } catch (e) {
        user.logout();
        return;
      }
    }
  } else {
    user.go("404");
  }
})();
