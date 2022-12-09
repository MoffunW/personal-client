<template>
  <div>
    <widget-wrapper
      v-model="widgetParams"
      :params="params"
      :loading="loading"
      :fail="fail"
      useOptions
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
      <template slot="options">
        <!-- Options -->
        <div style="width: 208px">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="dateRangeText"
                :label="$t('trans__dateSelect')"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="widgetParams.date"
              range
              no-title
              scrollable
              :max="max"
              :min="min"
            >
              <v-spacer></v-spacer>
              <v-btn class="primaryBtn" depressed tile @click="handleSaveDate">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
        </div>
      </template>
      <template slot="content" v-if="$options.data && $options.data.length">
        <!-- Content -->
        <div :class="$style.root">
          <mirt-table v-model="$options.data" />
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
    mirtTable: () => import("@/components/VirtualMirtTable")
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
    },
    dateRangeText() {
      return this.widgetParams.date.join(" - ");
    }
  },
  watch: {
    device() {
      if (!this.device.isFolder) this.getData();
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
          : this.params.minHeight,
        date: [
          new Date().toISOString().split("T")[0],
          new Date().toISOString().split("T")[0]
        ]
      },
      loading: false,
      fail: null,
      data: [],
      menu: false,
      min: new Date().toISOString().split("T")[0],
      max: new Date().toISOString().split("T")[0]
    };
  },
  methods: {
    getLimits() {
      let d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      this.min = d.toISOString().split("T")[0];
    },

    handleSaveDate() {
      this.getData();
      this.$emit("change", {
        widgetParams: this.widgetParams,
        updateGrid: false
      });
      this.menu = false;
    },

    fixDate() {
      if (
        new Date(this.widgetParams.date[0]) >
        new Date(this.widgetParams.date[1])
      )
        this.widgetParams.date = [
          this.widgetParams.date[1],
          this.widgetParams.date[0]
        ];
    },

    async getData() {
      this.fixDate();
      this.loading = true;
      try {
        const { data } = await axios.get(
          `Journal/GetMeterJournals?DeviceID=${this.device.id}&DateFrom=${this.widgetParams.date[0]}&DateTo=${this.widgetParams.date[1]}`
        );
        if (!data.length) this.fail = "err_no_data";
        data.map(x => {
          const d = x.dt.split("T");
          x.date = `${d[0]} ${d[1].split(".")[0]}`;
          x.ev__Type = x.type;
          x.ev__Event = x.event;
          delete x.dt;
          delete x.event;
          delete x.type;
          return x;
        });
        this.$options.data = data;
      } catch (e) {
        this.fail = "err_bad_request_api";
      } finally {
        this.loading = false;
      }
    }
    //3DF69238-E790-473E-9B5C-ADFD53124151
  },
  created() {
    this.widgetParams = this.$getWidgetParams(this);
    this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
  },
  mounted() {
    if (!this.auth) return;
    this.getLimits();
    this.getData();
  }
};
</script>

<style module>
.root {
  height: 100%;
  position: relative;
}
</style>
