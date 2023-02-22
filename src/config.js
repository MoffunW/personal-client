export const SERVER_URL = "http://192.168.1.164:81/api/v1/";

//export const SERVER_URL = "/api/v1/";

export const TOKEN_KEY = "auth.access";

export const THEMES = [
  { id: "light", text: "trans__themeLight" },
  { id: "dark", text: "trans__themeDark" },
  { id: "contrast", text: "trans__themeContrast" }
];

export const VIEWMODES = [
  { icon: "mdi-chart-bar", val: "bar" },
  { icon: "mdi-chart-line", val: "line" },
  { icon: "mdi-table-large", val: "table" }
];

export const EXPORTICONS = {
  pdf: { icon: "mdi-file-pdf-box", color: "#f00" },
  xlsx: { icon: "mdi-file-excel", color: "#32b61e" }
};

export const COLORS = [
  ["#6ec6ff", "#2196f3"],
  ["#ff7961", "#f44336"],
  ["#fff350", "#ffc107"],
  ["#bef67a", "#8bc34a"],
  ["#00b2d6", "#00819b"],
  ["#ff7d01", "#d26700"],
  ["#028681", "#005653"],
  ["#9612b6", "#590b6c"]
];

export const NAVIGATION = [
  {
    title: "dashboard",
    path: "dashboard",
    icon: "mdi-view-dashboard"
  },
  {
    title: "adminPanel",
    path: "admin",
    icon: "mdi-cog-outline"
  } /*,
  {
    title: "informationCenter",
    path: "info",
    icon: "mdi-information-outline"
  },
  {
    title: "navMap",
    path: "map",
    icon: "mdi-map-marker"
  },
  {
    title: "adminPanel",
    path: "admin",
    icon: "mdi-cog-outline"
  },
  {
    title: "profile",
    path: "profile",
    icon: "mdi-account"
  }*/,
  {
    title: "exit",
    path: "logout",
    icon: "mdi-power"
  }
];
