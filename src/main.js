import Vue from "vue";
import vuetify from "@/plugins/vuetify";
import { __User } from "@/plugins/user";
import routesProcessor from "@/plugins/routesProcessor";
import charts from "@/plugins/charts";
import compareChart from "@/plugins/compare-chart";
import "vuetify/dist/vuetify.min.css";
import router from "@/router";
import store from "@/store";
import App from "@/App.vue";
import "@/registerServiceWorker";
import "@mdi/font/css/materialdesignicons.css";

/*
var link = document.querySelector("link[rel~='icon']");
if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
}
link.href = 'https://stackoverflow.com/favicon.ico';
*/

Vue.prototype.$user = new __User();

Vue.prototype.$fixChartDates = arg => {
  if (!arg.x_axis.length) return arg.x_axis;
  const arr = [];
  arg.x_axis.forEach(x => {
    const _ = x.split(" ");
    _[0] = _[0] ? _[0].split(".") : null;
    x = _[1]
      ? `${_[0][2]}-${_[0][1]}-${_[0][0]} ${_[1]}`
      : `${_[0][2]}-${_[0][1]}-${_[0][0]}`;
    arr.push(x);
  });
  return arr;
};

Vue.prototype.$getWidgetParams = arg => {
  let params = arg.params.settings;
  let widgetParams = JSON.parse(JSON.stringify(arg.widgetParams));
  if (!params || !Object.keys(params).length) return widgetParams;
  for (let i in params)
    if (params[i] || params[i] === 0) widgetParams[i] = params[i];
  return widgetParams;
};

Vue.prototype.$setSettingsScroll = arg => {
  if (!arg) return;
  setTimeout(() => (arg.scrollLeft = arg.scrollWidth), 500);
};

Vue.prototype.$chkNoDatas = (start, end, formatter = null) => {
  const t = Vue.prototype.$t;
  if (
    !start ||
    !start.x_axis ||
    !start.x_axis.length ||
    !end ||
    !end.x_axis ||
    !end.x_axis.length
  )
    return t("err_no_data");
  let dStart = start.x_axis[0].replace(/\./gi, "-").split("-");
  let dEnd = end.x_axis[0].replace(/\./gi, "-").split("-");
  if (formatter) {
    dStart = formatter === "month" ? `${dStart[2]}-${dStart[1]}` : dStart[2];
    dEnd = formatter === "month" ? `${dEnd[2]}-${dEnd[1]}` : dEnd[2];
  }
  if (
    (!start.options || !start.options.length) &&
    (!end.options || !end.options.length)
  )
    return t("err_no_data");
  if (!start.options || !start.options.length)
    return `${dStart} ${t("err_no_data")}`;
  if (!end.options || !end.options.length) return `${dEnd} ${t("err_no_data")}`;
};

Vue.prototype.$t = arg => {
  return store.state.translations && store.state.translations[arg]
    ? store.state.translations[arg]
    : arg;
};

Vue.prototype.$pad = arg => {
  if (isNaN(Number(arg))) return arg;
  return String(arg).padStart(2, "0");
};

Vue.prototype.$selectTheme = arg => {
  localStorage.setItem("theme", arg);
  store.commit("setTheme", arg);
  const a = document.querySelector("html");
  const b = document.querySelector("body");
  a.removeAttribute("class");
  b.removeAttribute("class");
  if (arg !== "light") {
    a.classList.add(arg);
    b.classList.add(arg);
  }
};

Vue.prototype.$dummyField = () => {
  const el = document.createElement("input");
  el.setAttribute("type", "password");
  el.style.display = "none";
  document.querySelectorAll(".addDummyField").forEach(x => x.prepend(el));
};

Vue.prototype.$changeLang = arg => {
  store.commit("setLang", arg);
  localStorage.setItem("lang", arg);
  let arr =
    router.currentRoute &&
    router.currentRoute.path &&
    router.currentRoute.path.length
      ? router.currentRoute.path.split("/")
      : [];
  arr.shift();
  arr[0] = store.state.lang;
  let str = "";
  arr.forEach(x => {
    str += `/${x}`;
  });
  router.push({ path: `${str}` });
  window.location.reload();
};

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  routesProcessor,
  vuetify,
  charts,
  compareChart,
  render: h => h(App)
}).$mount("#app");
