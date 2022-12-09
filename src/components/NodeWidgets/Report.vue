<template>
  <div>
    <v-dialog
      v-if="formData"
      transition="dialog-top-transition"
      max-width="500"
      v-model="showModal"
    >
      <v-card>
        <forms-constructor
          v-model="formData"
          :types="reportsExts"
          @cancel="showModal = false"
          @input="handleGetReport"
        />
      </v-card>
    </v-dialog>
    <widget-wrapper
      v-model="widgetParams"
      :params="params"
      :loading="loading"
      :fail="fail"
      @cancel="widgetParams = origWidgetParams"
      @save="arg => $emit('change', { widgetParams, updateGrid: arg })"
      @delete="$emit('delete')"
    >
      <template slot="settings">
        <!-- Settings -->
        <v-text-field
          v-model="widgetParams.name"
          :label="$t('widgetName')"
          :small="true"
          append-outer-icon=" "
          prepend-icon=" "
          hide-details="auto"
        />
        <number-input
          v-if="params.minWidth != params.maxWidth"
          v-model="widgetParams.width"
          :min="params.minWidth"
          :max="params.maxWidth"
          :label="$t('trans__widgetWidth')"
        />
        <number-input
          v-if="params.minHeight != params.maxHeight"
          v-model="widgetParams.height"
          :min="params.minHeight"
          :max="params.maxHeight"
          :label="$t('trans__widgetHeight')"
        />
      </template>
      <template slot="content" v-if="data">
        <!-- Content -->
        <div :class="$style.root">
          <div>
            <v-treeview open-on-click :items="data"
              ><!--open-all-->
              <template v-slot:label="{ item }">
                <div
                  :class="
                    item.selected
                      ? [$style.treeItemWrap, 'reportItemSelected']
                      : $style.treeItemWrap
                  "
                >
                  <div
                    :class="$style.treeItem"
                    @click="e => handleTreeClick(e, item)"
                  >
                    <span v-text="item.name"></span>
                  </div>
                  <div
                    :class="$style.playButton"
                    v-if="
                      selectedItem &&
                        selectedItem.reportParam === item.reportParam
                    "
                  >
                    <v-icon @click="getForm">mdi-play</v-icon>
                  </div>
                </div>
              </template>
            </v-treeview>
          </div>
        </div>
      </template>
    </widget-wrapper>
  </div>
</template>

<script>
import axios from "axios";

export default {
  components: {
    WidgetWrapper: () => import("@/components/WidgetWrapper"),
    numberInput: () => import("@/components/MirtNumberInput"),
    FormsConstructor: () => import("@/components/FormsConstructor")
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    device() {
      return this.$store.state.selectedTreeNode;
    },
    auth() {
      return this.$store.state.auth;
    },
    name() {
      return this.params.settings.name
        ? this.params.settings.name
        : this.$t(this.params.name);
    }
  },
  watch: {
    device() {
      if (this.device.isFolder) this.getData();
    },
    loading(arg) {
      if (arg) this.fail = null;
    }
  },
  data() {
    return {
      widgetParams: {
        name: this.params.settings.name ? this.params.settings.name : null,
        width: this.params.settings.width
          ? this.params.settings.width
          : this.params.minWidth,
        height: this.params.settings.height
          ? this.params.settings.height
          : this.params.minHeight
      },
      origWidgetParams: {},
      reportsExts: [],
      data: [],
      selectedItem: null,
      formData: {},
      showModal: false,
      loading: false,
      fail: null
    };
  },
  methods: {
    async getForm() {
      try {
        this.loading = true;
        const { data } = await axios.post("Report/GetReportForm", {
          DeviceID: this.device.id,
          ReportParam: this.selectedItem.reportParam
        });
        if (!data) this.$message.error(this.$t("trans__ErrorGetReportForm"));
        this.formData = data;
        this.showModal = true;
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.loading = false;
      }
    },

    getFile(arg) {
      const link = document.createElement("a");
      document.body.append(link);
      link.href = arg.data;
      // link.href = window.URL.createObjectURL(arg.data);
      link.download = arg.title;
      link.click();
      link.remove();
    },

    async handleGetReport(arg) {
      this.showModal = false;
      try {
        this.loading = true;
        const { data } = await axios.post("Report/GetReport", {
          responseType: "blob",
          DeviceID: this.device.id,
          ReportParam: this.selectedItem.reportParam,
          ReportForm: JSON.stringify(arg.formData),
          ReportFileTypeExtension: arg.fileType.type
        });
        const _ = new Date();
        const name = `${this.selectedItem.name} ${_.toLocaleDateString(
          "ru-RU"
        )} ${_.toLocaleTimeString("ru-RU")}`;
        this.getFile({
          title: `${name.replace(/:/g, "-")}.${arg.fileType.ext}`,
          data: data
        });
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.loading = false;
      }
    },

    resetSelections(arg = null) {
      arg = arg ? arg : this.data;
      arg.forEach(x => {
        x.selected ? (x.selected = false) : this.$set(arg, "selected", false);
        if (x.children) this.resetSelections(x.children);
      });
    },

    handleTreeClick(e, arg) {
      e.preventDefault();
      e.stopPropagation();
      this.resetSelections();
      this.$set(arg, "selected", true);
      this.selectedItem = arg;
    },

    async getData() {
      try {
        this.loading = true;
        const { data } = await axios.get("Report/GetReportList");
        this.data = data;
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.widgetParams = this.$getWidgetParams(this);
    this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
  },
  async mounted() {
    if (!this.auth) return;
    try {
      this.loading = true;
      const { data } = await axios.get("Report/GetReportFileTypeExtension");
      this.reportsExts = data;
    } catch (e) {
      if (e.response) this.$message.error(this.$t(e.response.data));
    } finally {
      this.loading = false;
    }
    this.getData();
  }
};
</script>

<style module>
.root {
  height: 100%;
  position: relative;
}

.root > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.treeItemWrap {
  display: flex;
  height: 48px;
  align-items: center;
}

.treeItemWrap::before {
  content: "";
  position: absolute;
  height: 48px;
  width: 100%;
  left: 0;
  right: 0;
  z-index: -1;
}

.playButton {
  padding-right: 5px;
}

.treeItem {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  position: relative;
}

.treeItem > span {
  position: absolute;
  left: 0;
  right: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
