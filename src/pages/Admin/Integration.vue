<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <div :class="$style.wrapper">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-textarea
          :label="$t('trans__IntegrationGUID')"
          :rules="
            fields.TokenRegistration
              ? [arg => !!arg || $t('fieldIsRequired')]
              : []
          "
          :small="true"
          no-resize
          rows="8"
          v-model="fields.PubKey"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
        />
        <v-switch
          v-model="fields.FormRegistration"
          prepend-icon="mdi-form-select"
          :label="$t('trans__FormRegistration')"
        />
        <v-card>
          <div :class="$style.cardWrap">
            <v-switch
              v-model="fields.TokenRegistration"
              prepend-icon="mdi-code-json"
              :label="$t('trans__TokenRegistration')"
            />
            <v-text-field
              v-model="fields.redirectAddress"
              :label="$t('trans__RedirectLink')"
              prepend-icon="mdi mdi-link-variant"
              :disabled="!fields.TokenRegistration"
            /></div
        ></v-card>
        <v-btn
          class="primaryBtn"
          :class="$style.button"
          depressed
          tile
          @click="saveData"
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
      if (arg === 3) this.getData();
    }
  },
  data() {
    return {
      fields: {
        PubKey: "",
        FormRegistration: false,
        TokenRegistration: false
      },
      valid: true,
      loading: false
    };
  },
  methods: {
    async saveData() {
      if (!this.$refs.form.validate()) return;
      let formData = new FormData();
      formData.append("PubKey", this.fields.PubKey);
      formData.append("FormRegistration", this.fields.FormRegistration);
      formData.append("TokenRegistration", this.fields.TokenRegistration);
      formData.append("redirectAddress", this.fields.redirectAddress);
      this.loading = true;
      try {
        await axios.post("Integration/SetParams", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
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
        const { data } = await axios.get("Integration/GetParams");
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
    console.log(this.$store.state.serverSettings.redirectAddress);
    this.getData();
  }
};
</script>

<style module>
.root {
  height: 100%;
  border: transparent 3px dashed;
  transition: border-color 0.2s ease-in-out 0s;
}

.wrapper {
  height: 100%;
  max-width: 700px;
  padding: 10px;
  margin: 0 auto;
  overflow: auto;
}

.cardWrap {
  margin: 0 20px 0 0;
  padding-top: 1px;
}

.fieldWrap {
  display: flex;
  align-items: center;
}

.fieldWrap > * + * {
  margin-left: 15px !important;
}

.addButton {
  margin: 30px 0 10px auto !important;
}

.button {
  margin-top: 30px !important;
}
</style>
