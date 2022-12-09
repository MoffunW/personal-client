import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import store from "@/store";
import ru from "vuetify/es5/locale/ru";
import en from "vuetify/es5/locale/en";
import de from "vuetify/es5/locale/de";

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { ru, en, de },
    current: store.state.lang
  }
});
