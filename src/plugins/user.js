import Vue from "vue";
import { SERVER_URL, TOKEN_KEY } from "@/config";
import store from "@/store";
import router from "@/router";
import axios from "axios";

export class __User {
  constructor() {
    this._ = Vue.prototype;
    this.init();
  }

  go(arg) {
    let lang = navigator.language || navigator.userLanguage;
    lang = lang.split("-")[0];
    if (store.state.serverSettings && store.state.serverSettings.langList)
      lang = store.state.serverSettings.langList[0];
    if (store.state.lang) lang = store.state.lang;
    if (window.location.hash.split("/")[2] != arg)
      router.push({
        path: `/${lang}/${arg}`
      });
  }

  setToken(arg = null) {
    localStorage.setItem(TOKEN_KEY, arg ? arg : "");
    axios.defaults.headers.common["Authorization"] = arg
      ? `Bearer ${arg}`
      : null;
    if (!arg) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("path");
      localStorage.removeItem("selected");
    }
  }

  async login({ login, password }) {
    try {
      const { data } = await axios.post("Authorization/Authorization", {
        login,
        password
      });
      if (data) {
        this.setToken(data.token);
        store.commit("setUser", data.role);
        this.go("dashboard");
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.length) {
        this._.$message.error(
          e.response.status === 401
            ? "errWrongCredentials"
            : "authErrorAccountNotActive"
        );
      } else {
        this._.$message.error("err_some_error");
      }
    }
  }

  async logout() {
    store.commit("unsetUser");
    this.setToken();
    await router.push("login");
    router.go();
  }

  async register({ snp, account, serialNumber, email, password }) {
    try {
      const { data } = await axios.post("Authorization/Register", {
        FIO: snp,
        Contract: account,
        DeviceSerial: serialNumber,
        Login: email,
        Password: password
      });
      if (data) {
        if (data.useEmailConfirmation) {
          return this._.$t("registrationEmailSendNotify");
        } else {
          this.setToken(data.token);
          store.commit("setUser", data.role);
          this.go("dashboard");
        }
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.length) {
        this._.$message.error(
          e.response && e.response.data && e.response.data.length
            ? e.response.data
            : "err_some_error"
        );
      } else {
        this._.$message.error("err_some_error");
      }
      return false;
    }
  }

  async restore(arg) {
    try {
      const { data } = await axios.post("Authorization/AccessRecovery", {
        Email: arg
      });
      if (data) {
        return this._.$t("resetEmailSendNotify");
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.length) {
        this._.$message.error(
          e.response && e.response.data && e.response.data.length
            ? e.response.data
            : "err_some_error"
        );
      } else {
        this._.$message.error("err_some_error");
      }
      return false;
    }
  }

  async setNewPass(arg) {
    try {
      this.loading = true;
      axios.defaults.headers.common["Authorization"] = `Bearer ${
        window.location.hash.split("/")[3]
      }`;
      const { data } = await axios.post("Authorization/SetNewPassword", {
        pass: arg
      });
      if (data) {
        this._.$message("profilePasswordChangedNotify");
        this.setToken(data.token);
        store.commit("setUser", data.role);
        this.go("dashboard");
      }
    } catch (e) {
      this.$message.error(
        e.response && e.response.data && e.response.data.length
          ? e.response.data
          : "err_some_error"
      );
      return false;
    }
  }

  parseJWT(arg) {
    try {
      let obj = {};
      const b = JSON.parse(
        window.atob(
          arg
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );
      Object.keys(b).forEach(x => {
        obj[x.split("/").pop()] = b[x];
      });
      return obj;
    } catch (e) {
      return false;
    }
  }

  async init() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const _ = this.parseJWT(token);
    if (_) store.commit("setUser", _.role);
    try {
      const response = await fetch(`${SERVER_URL}Authorization/RefreshToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: token
        }
      });
      const data = await response.json();
      if (data && data.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        this.setToken(data.token);
        store.commit("setUser", data.role);
      }
      return !!data;
    } catch (e) {
      this.logout();
      return false;
    }
  }
}
