<template>
  <v-app>
    <div v-if="$store.state.serverSettings" :class="$style.root">
      <v-snackbar
        :class="`${sbFontBlack ? $style.sbBlack : ''}`"
        v-model="snackbar"
        top
        :color="snackbarColor"
        :timeout="snackbarTimeout"
      >
        {{ snackbarText }}
      </v-snackbar>
      <div v-if="!$store.state.loading" :class="`mainHeader ${$style.header}`">
        <div>
          <div>
            <div
              class="icons"
              :class="[$style.logo, `logo-${lang}`]"
              @click="handleLogoClick"
            ></div>
          </div>
          <div
            v-if="!auth"
            :class="$style.welcomeText"
            v-text="$t('welcomeText')"
          ></div>
        </div>
        <div
          :class="
            `navigationWrap 
            ${
              menuActive
                ? `navigationWrapActive ${$style.navigationWrap} ${$style.navigationWrapActive}`
                : $style.navigationWrap
            }
          `
          "
        >
          <div v-if="auth" :class="$style.navigation">
            <a
              :class="
                `navItem ${$style.navItem} ${
                  $router.currentRoute.fullPath ===
                  `/${$store.state.lang}/${item.path}`
                    ? ' active'
                    : ''
                }`
              "
              :href="`#/${$store.state.lang}/${item.path}`"
              v-for="item in nav"
              :key="item.path"
              @click="menuActive = false"
            >
              <v-icon> {{ item.icon }} </v-icon>
              <span v-text="$t(item.title)"></span>
            </a>
            <v-menu
              bottom
              origin="center center"
              transition="scale-transition"
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <span
                  :class="`navItem ${$style.navItem} ${$style.profileMenu}`"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon> mdi-account </v-icon>
                  <span v-text="$t('trans_profile')"></span>
                </span>
              </template>
              <v-list>
                <v-list-item>
                  <v-checkbox
                    v-model="welcome"
                    :class="$style.profileCBX"
                    :label="$t('trans_enableWelcome')"
                    @change="handleSetWelcome"
                  />
                </v-list-item>
                <v-list-item>
                  <a
                    :class="`navItem ${$style.navItem}`"
                    class="navItem"
                    @click.prevent="downloadUserGuide"
                  >
                    <v-icon> mdi-download </v-icon>
                    <span v-text="$t('trans__downloadUserGuide')"></span>
                  </a>
                </v-list-item>

                <v-list-item>
                  <a
                    :class="`navItem ${$style.navItem}`"
                    :href="`#/${$store.state.lang}/logout`"
                  >
                    <v-icon> mdi-power </v-icon>
                    <span v-text="$t('exit')"></span>
                  </a>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <div v-else></div>
          <div :class="$style.selectors">
            <div v-if="auth">
              <v-tooltip v-if="$store.state.showEditWidgets" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    :class="
                      edit
                        ? [$style.modeSelector, 'modeSelectorActive']
                        : $style.modeSelector
                    "
                    v-bind="attrs"
                    v-on="on"
                    @click="
                      menuActive = false;
                      edit = !edit;
                    "
                  >
                    mdi-widgets-outline
                  </v-icon>
                </template>
                <span v-text="$t('globalEditMode')"></span>
              </v-tooltip>
            </div>
            <div v-else></div>
            <v-select
              :items="$store.state.serverSettings.themes"
              item-text="text"
              item-value="id"
              :label="$t('trans__themeSelect')"
              v-model="theme"
              @change="
                arg => {
                  menuActive = false;
                  $selectTheme(arg);
                }
              "
            />
            <v-select
              :items="$store.state.serverSettings.langList"
              v-model="lang"
              @change="
                arg => {
                  menuActive = false;
                  $changeLang(arg);
                }
              "
            />
          </div>
        </div>
        <v-icon
          :class="menuActive ? [$style.menu, $style.menuActive] : $style.menu"
          @click="menuActive = !menuActive"
        >
          {{ menuActive ? "mdi-close" : "mdi-menu" }}
        </v-icon>
      </div>
      <div :class="$style.content">
        <router-view v-if="!$store.state.loading" />
        <v-overlay v-else :value="$store.state.loading">
          <v-progress-circular indeterminate size="64" />
        </v-overlay>
      </div>
      <div
        :class="`mainFooter ${$style.footer}`"
        v-text="`${$t('version')} ${$store.state.serverSettings.buildVersion}`"
      ></div>
    </div>
    <SearchModal class="search-modal" />
  </v-app>
</template>

<script>
import Vue from "vue";
import * as api from "./api";
import { NAVIGATION } from "@/config";
import axios from "axios";
import SearchModal from "@/components/SearchModal.vue";

export default {
  components: { SearchModal },
  data() {
    return {
      lang: null,
      theme: null,
      snackbar: null,
      snackbarText: null,
      snackbarColor: null,
      snackbarTimeout: null,
      sbFontBlack: false,
      nav: [],
      menuActive: false,
      edit: false,
      welcome: false
    };
  },
  computed: {
    auth() {
      return this.$store.state.auth;
    }
  },
  watch: {
    "$store.state.role": {
      handler() {
        this.nav =
          this.$store.state.role === "Admin"
            ? NAVIGATION
            : NAVIGATION.filter(x => x.title != "adminPanel");
      },
      immediate: true
    },
    "$store.state.showWelcomeCBX"(arg) {
      this.welcome = arg;
    },
    edit: {
      handler(arg) {
        this.$store.commit("setEditMode", arg);
      },
      immediate: true
    },
    $route(arg) {
      if (
        this.$router.currentRoute.fullPath ===
        `/${this.$store.state.lang}/logout`
      ) {
        this.$user.logout();
        return;
      }
      this.$store.commit("setShowEditWidgets", arg.name === "dashboard");
      this.$checkRoute();
    }
  },
  methods: {
    async handleSetWelcome(arg) {
      this.$store.commit("setShowWelcome", arg);
      this.$store.commit("setShowWelcomeCBX", arg);
      try {
        await axios.post("ServerSettings/SetShowWelcome", { Show: arg });
      } catch (e) {
        this.$message.error("err_some_error");
      }
    },

    handleLogoClick() {
      const path = this.auth
        ? `/${this.$store.state.lang}/dashboard`
        : `/${this.$store.state.lang}/login`;
      if (this.$router.currentRoute.fullPath === path) return;
      this.$router.push({ path });
    },
    downloadUserGuide() {
      const link = document.createElement("a");
      document.body.append(link);
      link.href = "files/User_guide.pdf";
      // link.href = window.URL.createObjectURL(arg.data);
      link.download = "User_guide.pdf";
      link.click();
      link.remove();
    }
  },
  async mounted() {
    try {
      import(`./assets/themes/${process.env.VUE_APP_THEME}/style.scss`);
      if (!this.$store.state.serverSettings) await api.getServerConfig();
      await api.getTranslations();
      const obj = this.$store.state.serverSettings;
      if (obj.themes.length) {
        this.lang = this.$store.state.lang;
        obj.themes.map(x => (x.text = this.$t(x.text)));
      }
      this.$store.commit("setServerSettings", obj);
      const themes = obj.themes.find(x => x.id === this.$store.state.theme);
      this.theme = themes && themes.id ? themes.id : obj.themes[0].id;
      this.$selectTheme(this.$store.state.theme);
    } catch (e) {
      return;
    }
    Vue.prototype.$message = text => {
      this.snackbarText = this.$t(text);
      this.snackbarColor = "#67c23a";
      this.snackbarTimeout = 3000;
      this.snackbar = true;
      this.sbFontBlack = false;
    };
    Vue.prototype.$message.error = text => {
      this.snackbarText = this.$t(text);
      this.snackbarColor = "#e3605a";
      this.snackbarTimeout = 3000;
      this.snackbar = true;
      this.sbFontBlack = false;
    };
    Vue.prototype.$message.warning = text => {
      this.snackbarText = this.$t(text);
      this.snackbarColor = "#fb8c00";
      this.snackbarTimeout = 3000;
      this.snackbar = true;
      this.sbFontBlack = true;
    };
  }
};
</script>

<style scoped lang="scss">
.search-modal {
  background-color: red;
}
</style>
<style module>
.root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  padding: 0 10px;
  height: 70px;
  align-items: center;
  position: sticky;
  top: 0;
  transition: box-shadow 0.2s linear;
  z-index: 99;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  background-color: #fff;
}

.header > div:first-child {
  display: flex;
  align-items: center;
}

.header > div:first-child > div:last-child {
  padding: 0 25px;
}

.logo {
  height: 39px;
  width: 197px;
  background-position: 0 0;
  cursor: pointer;
}

.navigationWrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0s ease-in-out 0s;
}

.navigationWrap > *:first-child * {
  transition: all 0s ease-in-out 0s;
}
.navigation > .navItem span {
  margin-left: 5px;
}

.navItem {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
.navItem > span {
  margin-left: 9px;
}
.navItem + * {
  margin-left: 20px;
}

.selectors {
  display: flex;
  align-items: center;
}

.selectors > *:nth-child(2) {
  width: 120px;
}

.selectors > *:last-child {
  width: 60px;
}

.selectors > * + * {
  margin-left: 15px;
}

.modeSelector {
  cursor: pointer;
}

.modeSelector::after {
  display: none !important;
}

.menu {
  display: none !important;
  position: fixed !important;
  top: 20px;
  right: 20px;
  cursor: pointer;
  transition: all 0.3s ease-in-out 0s;
  z-index: 10;
}

.menu::after {
  display: none !important;
}

.menuActive,
.menuActive * {
  color: #cecece !important;
  background-color: transparent !important;
}

.content {
  flex: 1;
  padding: 0 10px;
}

.footer {
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 0.6em;
  padding: 3px 5px;
  background-color: #fff;
  z-index: 99999;
}

.sbBlack > * > * {
  color: #000 !important;
}

.profileMenu {
  margin-left: 20px;
  display: inline-flex;
  align-items: center;
}

.profileCBX {
  font-size: 18px !important;
}

@media all and (max-width: 1220px) {
  .menu {
    display: block !important;
  }

  .navigationWrap {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 0;
    padding-top: 70px;
    flex-direction: column;
    align-items: flex-start;
    color: #cecece;
    background-color: #333;
    transition: all 0.3s ease-in-out 0s;
    overflow-x: hidden;
  }

  .navigationWrapActive {
    width: 100%;
  }

  .navigationWrap * {
    color: #cecece !important;
  }

  .navigationWrap > * {
    width: 100%;
  }

  .navigationWrap > *:first-child > a,
  .navigationWrap > *:first-child > span {
    display: flex;
    padding: 20px;
    white-space: nowrap;
  }

  .navigationWrap > *:first-child > * + * {
    margin: 0;
  }

  .navigationWrap > *:first-child * {
    transition: all 0.3s ease-in-out 0s;
    background-color: transparent !important;
  }

  .navigationWrap > *:first-child > *:hover {
    background-color: #cecece !important;
  }

  .navigationWrap > *:last-child {
    padding: 20px;
    max-width: 300px;
  }
}

@media all and (max-width: 1100px) {
  .welcomeText {
    display: none;
  }
}
</style>
