<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <div :class="$style.wrapper">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          :label="$t('trans__IntegrationGUID')"
          :rules="rules"
          :small="true"
          v-model="fields.GUID"
          hide-details="auto"
          prepend-icon="mdi mdi-lock"
        />
        <v-btn
          class="primaryBtn"
          :class="$style.addButton"
          depressed
          tile
          @click="addItem(index)"
        >
          {{ $t("trans__AddIntegrationIPRow") }}
        </v-btn>
        <div
          :class="$style.fieldWrap"
          v-for="(item, index) in fields.IP"
          :key="index"
        >
          <v-text-field
            :label="$t('trans__IntegrationIP')"
            :rules="ipRules"
            :small="true"
            v-model="fields.IP[index]"
            hide-details="auto"
            prepend-icon="mdi mdi-server"
          />
          <v-btn
            v-if="fields.IP.length > 1"
            class="primaryBtn"
            depressed
            tile
            @click="removeItem(index)"
          >
            <span class="mdi mdi-minus-thick"></span>
          </v-btn>
        </div>
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
      rules: [arg => !!arg || this.$t("fieldIsRequired")],
      ipRules: [
        arg => !!arg || this.$t("fieldIsRequired"),
        arg =>
          !arg ||
          /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(arg) ||
          this.$t("fieldInvalidIP")
      ],
      fields: {
        GUID: null,
        IP: ["0.0.0.0"]
      },
      valid: true,
      loading: false
    };
  },
  methods: {
    addItem() {
      this.fields.IP = [...this.fields.IP, null];
    },

    removeItem(arg) {
      this.fields.IP.splice(arg, 1);
    },

    async saveData() {
      if (!this.$refs.form.validate()) return;
      this.fields.IP = this.fields.IP.filter(x => !!x);
      let formData = new FormData();
      formData.append("GUID", this.fields.GUID);
      this.fields.IP.forEach(x => formData.append("IP", x));
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
        this.fields.GUID = data.GUID;
        if (data.IP.length) this.fields.IP = data.IP;
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
  border: transparent 3px dashed;
  transition: border-color 0.2s ease-in-out 0s;
}

.wrapper {
  height: 100%;
  max-width: 400px;
  padding: 10px;
  margin: 0 auto;
  overflow: auto;
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
