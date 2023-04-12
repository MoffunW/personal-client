<template>
  <div :class="$style.root">
    <div class="card">
      <div class="header" v-text="$t('pleaseLogIn')"></div>
      <div class="addDummyField">
        <v-text-field
          v-model="login"
          :label="$t('login')"
          :rules="rules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-account"
          autocomplete="off"
        />
        <v-text-field
          v-model="password"
          :label="$t('password')"
          :rules="rules"
          :small="true"
          :type="showPass ? 'text' : 'password'"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          autocomplete="off"
          @click:append="showPass = !showPass"
        />
        <div class="cbxWrap" :class="$style.cbxWrap">
          <!--v-checkbox
            v-model="remember"
            small
            :label="$t('rememberMe')"
            @change="arg => $store.commit('setRememberMe', arg)"
          /-->
          <a
            v-if="$store.state.serverSettings.recoveryAccess"
            :href="`#/${$store.state.lang}/restore`"
            v-text="$t('forgotPassword')"
          ></a>
        </div>
        <div :class="$style.buttonsWrap">
          <v-btn
            v-if="$store.state.serverSettings.registration"
            class="cancelBtn"
            depressed
            tile
            @click="
              () =>
                $router.push({
                  path: `/${this.$store.state.lang}/registration`
                })
            "
          >
            {{ $t("registrationSubmit") }}
          </v-btn>
          <div v-else></div>
          <v-btn
            class="primaryBtn"
            depressed
            tile
            @click="handleLogin"
            :loading="loading"
            :disabled="!$store.state.serverSettings.authorizationsInForm"
          >
            {{ $t("signIn") }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /*
      ,
        arg =>
          !arg || !arg.match(/[*;'`"\\/]+/) || this.$t("trans__wrongSymbol")
      */
      rules: [arg => !!arg || this.$t("fieldIsRequired")],
      remember: this.$store.state.rememberMe,
      login: null,
      password: null,
      showPass: false,
      loading: false
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      await this.$user.login({
        login: this.login,
        password: this.password
      });
      this.loading = false;
      return;
    }
  },
  mounted() {
    const _ =
      this.$store.state.serverSettings &&
      this.$store.state.serverSettings.redirectAddress
        ? this.$store.state.serverSettings.redirectAddress
        : null;
    if (_) window.location.replace(_);
    this.$dummyField();
  }
};
</script>

<style lang="scss" module>
.root {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.buttonsWrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.buttonsWrap > * {
  margin: 0 !important;
}

.cbxWrap {
  min-height: 66px;
  justify-content: flex-end !important;
}
</style>
