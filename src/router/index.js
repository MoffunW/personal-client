import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/:lang/login/:token",
    name: "loginauth",
    component: () => import("../plugins/authByToken.js"),
    meta: { title: "authorization" },
    unAuth: true
  },
  {
    path: "/:lang/login",
    name: "login",
    component: () => import("../pages/Unauthorized.vue"),
    meta: { title: "authorization" },
    unAuth: true
  },
  {
    path: "/:lang/registration",
    name: "registration",
    component: () => import("../pages/Registration.vue"),
    meta: { title: "registration" },
    unAuth: true
  },
  {
    path: "/:lang/confirm/:token",
    name: "registrationConfirm",
    component: () => import("../plugins/registration.js"),
    meta: { title: "registration" },
    unAuth: true
  },
  {
    path: "/:lang/restore",
    name: "restore",
    component: () => import("../pages/Restore.vue"),
    meta: { title: "restore" },
    unAuth: true
  },
  {
    path: "/:lang/newpassword/:token",
    name: "newpassword",
    component: () => import("../pages/NewPassword.vue"),
    meta: { title: "newpassword" },
    unAuth: true
  },
  {
    path: "/:lang/dashboard",
    name: "dashboard",
    component: () => import("../pages/Dashboard.vue"),
    meta: { title: "dashboard" }
  },
  {
    path: "/:lang/admin",
    name: "admin",
    component: () => import("../pages/AdminPanel.vue"),
    meta: { title: "admin" }
  },
  { path: "*", component: () => import("../pages/404.vue") }
];

const router = new VueRouter({ routes });

export default router;
