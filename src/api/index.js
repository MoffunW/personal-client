import Vue from "vue";
import { SERVER_URL, THEMES } from "@/config";
import store from "@/store";
import axios from "axios";
import { stringify } from "qs";
axios.defaults.baseURL = `${SERVER_URL}`;
axios.defaults.headers.common["Content-Type"] =
  "application/x-www-form-urlencoded";

axios.interceptors.request.use(
  config => {
    if (config.data) {
      if (
        config.data instanceof FormData ||
        config.headers["Content-Type"] === "application/json"
      )
        return config;
    }
    config.data = stringify(config.data, { arrayFormat: "comma" });
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (e, token = null) => {
  failedQueue.forEach(x => (e ? x.reject(e) : x.resolve(token)));
  failedQueue = [];
};

axios.interceptors.response.use(
  response => {
    return response;
  },
  err => {
    let originalRequest = err.config;
    if (originalRequest.data && originalRequest.data.length)
      originalRequest.data = Object.fromEntries(
        new URLSearchParams(originalRequest.data)
      );
    const user = Vue.prototype.$user;
    if (
      Vue.prototype.$message &&
      Vue.prototype.$message.warning &&
      err &&
      err.response &&
      err.response.status &&
      err.response.status === 403 &&
      err.response.data &&
      err.response.data.message
    ) {
      setTimeout(
        () => Vue.prototype.$message.warning(err.response.data.message),
        0
      );
      return Promise.reject(err);
    }
    if (err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      return new Promise(function(resolve, reject) {
        axios
          .post("Authorization/RefreshToken")
          .then(({ data }) => {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${data.token}`;
            originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
            user.setToken(data.token);
            store.commit("setUser", data.role);
            processQueue(null, data.token);
            resolve(axios(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            user.logout();
            reject(err);
          })
          .then(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(err);
  }
);

export async function getServerConfig() {
  store.commit("setLoading", true);
  let lang = navigator.language || navigator.userLanguage;
  lang = lang ? lang.split("-")[0] : "ru";
  try {
    const [info, slices] = await Promise.all([
      axios.get("ServerSettings/Info"),
      axios.get("Chart/TimeSlicesTypes")
    ]);
    let data = info.data;
    data.slices = !slices.data || !slices.data.length ? [] : slices.data;
    data.slices.map(x => {
      x = {
        key: x.value,
        value: x.key
      };
      return x;
    });
    data.currentLang =
      data.langList && data.langList.includes(lang) ? lang : "ru";
    data.themes = THEMES;
    if (data) {
      store.commit("setServerSettings", data);
      if (data.widgetsReportsDownload) {
        let _ = {};
        data.widgetsReportsDownload.forEach(x => (_[x.name] = x.reportType));
        store.commit("setExportsSettings", _);
      }
    }
  } catch (e) {
    return;
  }
}

export async function getTranslations() {
  try {
    let { data } = await axios.get(
      `ServerSettings/GetTranslationLang?Lang=${store.state.lang}`
    );
    if (data) store.commit("setTranslations", data);
  } catch (e) {
    store.commit("setLoading", false);
  }
  store.commit("setLoading", false);
}
