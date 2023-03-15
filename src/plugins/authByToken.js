import Vue from "vue";
import axios from "axios";
import store from "@/store";
import { TOKEN_KEY } from "@/config";

(async () => {
  const user = Vue.prototype.$user;
  if (!localStorage.getItem(TOKEN_KEY)) {
    const token = window.location.hash.split("/")[3];
    if (token) {
      const { data } = await axios.get("ServerSettings/Info");
      try {
        if (data && data.registrationbyToken) {
          store.commit("setServerSettings", data);
          const { data } = await axios.post("Integration/IntegratedUser", {
            Token: token ? token : null
          });
          if (data && data.token) {
            user.setToken(data.token);
            store.commit("setUser", data.role);
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
