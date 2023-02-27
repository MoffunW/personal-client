<template>
  <div :class="$style.root">
    <div v-if="result" class="formResult" v-text="result"></div>
    <div v-else class="card">
      <div class="header" v-text="$t('registrationTitle')"></div>
      <div>
        <div class="addDummyField"></div>
        <v-text-field
          v-model="account"
          :label="$t('personalAccount')"
          :rules="rules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-badge-account-horizontal-outline"
        />
        <v-text-field
          v-model="serialNumber"
          :label="$t('serialNumber')"
          :rules="rules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-numeric"
        />
        <v-text-field
          v-model="email"
          :label="$t('email')"
          :rules="mailRules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-email-outline"
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
          @click:append="showPass = !showPass"
        />
        <v-text-field
          v-model="snp"
          :label="`${$t('lastName')} ${$t('firstName')} ${$t('patronymic')}`"
          :rules="rules"
          :small="true"
          hide-details="auto"
          prepend-icon="mdi mdi-account"
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
            @click="handleRegistration"
            :loading="loading"
          >
            {{ $t("registrationSubmit") }}
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
      rules: [arg => !!arg || this.$t("fieldIsRequired")],
      mailRules: [
        arg => !!arg || this.$t("fieldIsRequired"),
        arg =>
          !arg ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(arg) ||
          this.$t("fieldInvalidEmail")
      ],
      account: null,
      serialNumber: null,
      email: null,
      password: null,
      snp: null,
      showPass: false,
      loading: false,
      result: null
    };
  },
  methods: {
    async handleRegistration() {
      if (
        !this.account ||
        !this.serialNumber ||
        !this.email ||
        !this.password ||
        !this.snp
      ) {
        this.$message.error(this.$t("trans__allFieldsRequired"));
        return;
      }
      this.loading = true;
      const result = await this.$user.register({
        snp: this.snp,
        account: this.account,
        serialNumber: this.serialNumber,
        email: this.email,
        password: this.password
      });
      if (result) {
        this.result = result;
      } else {
        this.loading = false;
        this.snp = null;
        this.account = null;
        this.serialNumber = null;
        this.email = null;
        this.password = null;
      }
    }
  },
  mounted() {
    if (!this.$store.state.serverSettings.registration)
      this.$router.push("404");
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
  margin: 20px 0 0;
  align-items: center;
  justify-content: space-between;
}

.buttonsWrap > * {
  margin: 0 !important;
}
</style>
