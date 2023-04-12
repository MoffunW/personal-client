<template>
  <div :class="$style.root">
    <div class="card">
      <div class="header" v-text="$t('profilePasswordPage')"></div>
      <div>
        <v-text-field
          v-model="pass"
          :label="$t('passwordNew')"
          :rules="rules"
          :small="true"
          :type="showPass ? 'text' : 'password'"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          autocomplete="off"
          @click:append="showPass = !showPass"
        />
        <v-text-field
          v-model="newPass"
          :label="$t('passwordConfirm')"
          :rules="rules"
          :small="true"
          :type="showNewPass ? 'text' : 'password'"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
          :append-icon="showNewPass ? 'mdi-eye' : 'mdi-eye-off'"
          autocomplete="off"
          @click:append="showNewPass = !showNewPass"
        />
        <div :class="$style.buttonsWrap">
          <v-btn
            class="cancelBtn"
            depressed
            tile
            @click="
              () =>
                $router.push({
                  path: `/${this.$store.state.lang}/login`
                })
            "
          >
            <v-icon dark>
              mdi-arrow-left
            </v-icon>
          </v-btn>
          <v-btn
            class="primaryBtn"
            depressed
            tile
            @click="handleRestore"
            :loading="loading"
          >
            {{ $t("changePasswordSubmit") }}
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
      rules: [
        arg => !!arg || this.$t("fieldIsRequired"),
        arg => !arg || arg.length >= 6 || this.$t("trans_min6sym"),
        arg => !arg || arg.length <= 25 || this.$t("trans_max25sym"),
        ...this.$testRules
      ],
      showPass: false,
      showNewPass: false,
      pass: null,
      newPass: null,
      loading: false
    };
  },
  methods: {
    async handleRestore() {
      if (!this.pass || !this.newPass) return;
      if (this.pass !== this.newPass) {
        this.$message.error("trans_passwordsMissMatch");
        return;
      }
      this.loading = true;
      const result = await this.$user.setNewPass(this.pass);
      if (!result) {
        this.pass = null;
        this.newPass = null;
      }
      this.loading = false;
    }
  },
  mounted() {
    const _ =
      this.$store.state.serverSettings &&
      this.$store.state.serverSettings.redirectAddress
        ? this.$store.state.serverSettings.redirectAddress
        : null;
    if (_) window.location.replace(_);
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
  margin: 20px 0 0;
  align-items: center;
  justify-content: space-between;
}

.buttonsWrap > * {
  margin: 0 !important;
}
</style>
