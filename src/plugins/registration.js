import Vue from "vue";
import axios from "axios";
import store from "@/store";

(async () => {
  const token = window.location.hash.split("/")[3];
  const user = Vue.prototype.$user;
  if (token) {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await axios.post("Authorization/ConfirmationUser", {});
      if (data) {
        user.setToken(data.token);
        store.commit("setUser", data.role);
        user.go("dashboard");
      }
    } catch (e) {
      user.go("404");
      return;
    }
  }
})();
