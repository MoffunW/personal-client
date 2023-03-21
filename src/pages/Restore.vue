<template>
  <div :class="$style.root">
    <div v-if="result" class="formResult" v-text="result"></div>
    <div v-else class="card">
      <div class="header" v-text="$t('resetPasswordTitle')"></div>
      <div>
        <v-text-field
          v-model="email"
          :label="$t('email')"
          :rules="rules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-email-outline"
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
            {{ $t("resetPasswordSubmit") }}
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
        arg =>
          !arg ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(arg) ||
          this.$t("fieldInvalidEmail")
      ],
      email: null,
      loading: false,
      result: false
    };
  },
  methods: {
    async handleRestore() {
      if (!this.email) return;
      this.loading = true;
      const result = await this.$user.restore(this.email);
      if (result) {
        this.result = result;
      } else {
        this.loading = false;
        this.email = null;
      }
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
