<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <div :class="$style.wrapper">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          :class="$style.field"
          :label="$t('trans__Host')"
          :rules="$testRules"
          :small="true"
          v-model="fields.Host"
          hide-details="auto"
          prepend-icon="mdi mdi-server"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('trans__Port')"
          :rules="intRules"
          :small="true"
          v-model="fields.Port"
          hide-details="auto"
          prepend-icon="mdi mdi-lan-connect"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('login')"
          :rules="mailRules"
          :small="true"
          v-model="fields.Login"
          hide-details="auto"
          prepend-icon="mdi mdi-account"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('password')"
          :rules="rules"
          :small="true"
          :type="showPass ? 'text' : 'password'"
          v-model="fields.Password"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPass = !showPass"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('trans__SendFrom')"
          :rules="mailRules"
          :small="true"
          v-model="fields.SendFrom"
          hide-details="auto"
          prepend-icon="mdi mdi-email-outline"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('trans__ServerAddress')"
          :rules="rules"
          :small="true"
          v-model="fields.ServerAddress"
          hide-details="auto"
          prepend-icon="mdi mdi-server"
        />
        <v-text-field
          :class="$style.field"
          :label="$t('trans__MailSender')"
          :rules="senderRules"
          :small="true"
          v-model="fields.DisplayName"
          hide-details="auto"
          prepend-icon="mdi mdi-account"
        />
        <v-checkbox
          :class="$style.checkbox"
          v-model="fields.EnableSSL"
          :label="$t('trans_UseSSL')"
        />
        <v-checkbox
          :class="$style.checkbox"
          v-model="fields.UseEmailConfirmation"
          :label="$t('trans__UseEmailConfirmation')"
        />
        <v-btn
          class="primaryBtn"
          :class="$style.field"
          depressed
          tile
          @click="sendData"
        >
          {{ $t("widgetOptionsSubmit") }}
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    index: {
      type: Number,
      default: 0
    }
  },
  watch: {
    index(arg) {
      if (arg === 1) this.getData();
    }
  },
  data() {
    return {
      rules: [arg => !!arg || this.$t("fieldIsRequired")],
      intRules: [
        arg => !!arg || this.$t("fieldIsRequired"),
        arg => !isNaN(arg) || this.$t("trans_NotInt")
      ],
      mailRules: [
        arg => !!arg || this.$t("fieldIsRequired"),
        arg =>
          !arg ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(arg) ||
          this.$t("fieldInvalidEmail")
      ],
      senderRules: [
        arg => !arg || arg.length <= 25 || this.$t("trans_max25sym")
      ],
      fields: {
        Host: null,
        Port: null,
        Login: null,
        Password: null,
        EnableSSL: false,
        SendFrom: null,
        UseEmailConfirmation: false,
        ServerAddress: null,
        DisplayName: null
      },
      valid: true,
      showPass: false,
      loading: false
    };
  },
  methods: {
    async sendData() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      if (!this.fields.DisplayName) delete this.fields.DisplayName;
      try {
        await axios.post("AdminSection/SetMailSettings", this.fields);
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get("AdminSection/GetMailSettings");
        this.fields = data;
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style module>
.root {
  height: 100%;
}

.wrapper {
  height: 100%;
  max-width: 400px;
  padding: 10px;
  margin: 0 auto;
  overflow: auto;
}

.checkbox {
  height: 32px !important;
  margin: 20px auto !important;
}

.checkbox + .checkbox {
  margin-top: -5px !important;
}
</style>
