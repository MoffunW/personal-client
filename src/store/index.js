import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    auth: false,
    role: null,
    rememberMe: true,
    devicesImgs: [],
    devicesList: [],
    selectedTreeNode: null,
    serverSettings: null,
    translations: null,
    lang: localStorage.getItem("lang") ? localStorage.getItem("lang") : null,
    theme: localStorage.getItem("theme") ? localStorage.getItem("theme") : null,
    loading: true,
    editMode: false,
    showEditWidgets: true,
    exportsSettings: {},
    showWelcome: false
  },
  mutations: {
    setRememberMe(state, arg) {
      state.rememberMe = arg;
    },

    setServerSettings(state, arg) {
      state.serverSettings = arg;
      let l = window.location.hash ? window.location.hash.split("/") : [];
      l = !l[1] ? null : l[1];
      state.lang = !state.lang ? arg.currentLang : state.lang;
      if (arg.langList.includes(l)) state.lang = l;
      localStorage.setItem("lang", state.lang);
      state.theme = !state.theme ? arg.themes[0].id : state.theme;
    },

    setLang(state, arg) {
      state.lang = arg;
    },

    setTranslations(state, arg) {
      state.translations = arg;
    },

    setTheme(state, arg) {
      state.theme = arg;
    },

    setUser(state, arg) {
      state.auth = true;
      state.role = arg;
    },

    unsetUser(state) {
      state.auth = false;
      state.role = null;
    },

    setdevicesImgs(state, arg) {
      state.devicesImgs = arg;
    },

    setEditMode(state, arg) {
      state.editMode = arg;
    },

    setLoading(state, arg) {
      state.loading = arg;
    },

    setSelectedTreeNode(state, arg) {
      state.selectedTreeNode = arg;
    },

    setShowEditWidgets(state, arg) {
      state.showEditWidgets = arg;
    },

    setExportsSettings(state, arg) {
      state.exportsSettings = arg;
    },

    setShowWelcome(state, arg) {
      state.showWelcome = arg;
    }
  }
});
