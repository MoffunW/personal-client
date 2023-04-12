<template>
  <div
    :class="$style.root"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <div :class="$style.wrapper">
      <div :class="$style.infoWrap">
        <div v-text="$t(`${statusText}`)"></div>
        <div
          v-if="!noLicense && dateStart"
          v-text="`${$t('trans__LicDateStart')}: ${dateStart}`"
        ></div>
        <div
          v-if="!noLicense && dateEnd"
          v-text="`${$t('trans__LicDateEnd')}: ${dateEnd}`"
        ></div>
        <div
          v-if="!noLicense && data.maxUsers"
          v-text="`${$t('trans__LicUsersCount')}: ${data.maxUsers}`"
        ></div>
      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="data.description.address"
          :label="$t('selectCoordsModalAddress')"
          :small="true"
          :rules="rules"
          :disabled="fieldsDisabled"
          hide-details="auto"
        />
        <v-text-field
          v-model="data.description.phone"
          :label="$t('trans__LicPhone')"
          :small="true"
          :rules="rules"
          :disabled="fieldsDisabled"
          hide-details="auto"
        />
        <v-text-field
          v-model="data.description.fio"
          :label="$t('trans__LicFIO')"
          :small="true"
          :rules="rules"
          :disabled="fieldsDisabled"
          hide-details="auto"
        />
        <v-text-field
          v-model="data.description.server"
          :label="$t('trans__LicServerName')"
          :small="true"
          :rules="rules"
          :disabled="fieldsDisabled"
          hide-details="auto"
        />
        <v-textarea
          :class="$style.textarea"
          v-model="data.description.description"
          :label="$t('trans__LicServerDescr')"
          :small="true"
          :rules="rules"
          :disabled="fieldsDisabled"
          no-resize
          rows="3"
          hide-details="auto"
        />
        <div :class="$style.buttonsWrap">
          <div>
            <v-file-input
              :class="$style.file"
              ref="file"
              v-model="file"
              style="display: none"
            />
            <v-btn
              class="primaryBtn"
              depressed
              tile
              @click="$refs.file.$refs.input.click()"
            >
              {{ $t("trans__LicUploadFile") }}
            </v-btn>
          </div>
          <v-btn class="primaryBtn" depressed tile @click="getFile">
            {{ $t("trans__LicDownloadFile") }}
          </v-btn>
        </div>
        <v-btn
          v-if="showButton"
          class="primaryBtn"
          depressed
          tile
          @click="noLicense ? getLicense() : upgradeLicense()"
        >
          <span
            v-text="
              `${noLicense ? $t('trans__LicGet') : $t('trans__LicUpgrade')}`
            "
          ></span>
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
  computed: {
    dateStart() {
      if (!this.data.dT_Start) return null;
      const d = this.data.dT_Start.split("T");
      return d[0];
    },
    dateEnd() {
      if (!this.data.dT_End) return null;
      const d = this.data.dT_End.split("T");
      return d[0];
    },
    fieldsDisabled() {
      return !this.noLicense;
    },
    statusText() {
      return this.noLicense
        ? this.$t("trans__LicNoLicense")
        : `${this.$t("trans__LicStatus")}: ${this.$t(this.data.status)}`;
    }
  },
  watch: {
    index(arg) {
      if (arg === 2) this.getData();
    },
    file(arg) {
      if (arg) this.downloadFile();
    }
  },
  data() {
    return {
      rules: [...this.$testRules],
      data: {
        dT_Start: "0000-00-00T00:00:00Z",
        dT_End: "0000-00-00T00:00:00Z",
        status: null,
        maxUsers: 0,
        description: {
          address: null,
          phone: null,
          fio: null,
          server: null,
          description: null
        }
      },
      file: null,
      valid: false,
      loading: false,
      noLicense: true,
      showButton: true
    };
  },
  methods: {
    dragover(e) {
      e.preventDefault();
      if (!e.currentTarget.classList.contains("fileWrapActive"))
        e.currentTarget.classList.add("fileWrapActive");
    },

    dragleave(e) {
      e.currentTarget.classList.remove("fileWrapActive");
    },

    drop(e) {
      e.preventDefault();
      this.file = e.dataTransfer.files[0];
      e.currentTarget.classList.remove("fileWrapActive");
    },

    setData(arg) {
      const obj = {
        address: null,
        phone: null,
        fio: null,
        server: null,
        description: null
      };
      arg.description = !arg.description ? obj : JSON.parse(arg.description);
      if (arg.status) this.noLicense = !arg.status;
      this.data = arg;
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get("AdminSection/GetCurrenLicenseInfo");
        this.setData(data);
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async getLicense() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        const data = await axios.post("AdminSection/RequestLicenseOnline", {
          Description: JSON.stringify(this.data.description)
        });
        this.setData(data);
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async upgradeLicense() {
      this.loading = true;
      try {
        const { data } = await axios.get("AdminSection/UpdateLicOnline");
        this.setData(data);
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async downloadFile() {
      let formData = new FormData();
      formData.append("file", this.file);
      this.loading = true;
      try {
        const { data } = await axios.post(
          "AdminSection/UploadFileLic",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" }
          }
        );
        this.setData(data);
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
        this.file = null;
      }
    },

    async getFile() {
      if (!this.$refs.form.validate()) return;
      this.loading = true;
      try {
        const { data } = await axios.post("AdminSection/GetLicFile", {
          Description: JSON.stringify(this.data.description)
        });
        let a = document.createElement("a");
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify(data)], { type: "text/plain" })
        );
        a.download = "license.lic";
        a.click();
        a.remove();
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

.infoWrap,
.textarea {
  font-size: 14px;
}

.infoWrap > * + * {
  margin-top: 10px;
}

.textarea > * > * > * > *:first-child {
  font-size: 14px !important;
}

.file {
  display: none;
}

.buttonsWrap {
  display: flex;
  margin: 20px 0 40px;
  justify-content: space-between;
}

.buttonsWrap > * {
  margin: 0 !important;
}
</style>
