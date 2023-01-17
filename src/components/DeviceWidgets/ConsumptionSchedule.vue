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
        <!--span v-html="$t('trans__consumption_testimony')"></span>
        <v-switch
          v-model="widgetParams.isTestimony"
          @change="handleSettingsChanged(true)"
        /-->
        <v-select
          :class="$style.modes"
          :items="viewModes"
          item-text="icon"
          item-value="val"
          :label="$t('trans__chartType')"
          v-model="widgetParams.type"
          @change="handleSettingsChanged(false)"
        >
          <template slot="selection" slot-scope="data">
            <v-icon>{{ data.item.icon }}</v-icon>
          </template>
          <template slot="item" slot-scope="data">
            <v-icon>{{ data.item.icon }}</v-icon>
          </template>
        </v-select>
        <div>
          <sliced-date-intervals
            ref="dateSelector"
            v-model="widgetParams.date"
            sliced
            :range="widgetParams.date.range"
            @input="handleSettingsChanged"
          />
        </div>
        <div>
          <v-select
            :class="$style.energies"
            :items="energyTypes"
            item-text="unitsNote"
            item-value="unitsGuideEnergyCode"
            :label="$t('trans__energyType')"
            v-model="widgetParams.energyType"
            @change="handleSettingsChanged(true)"
          />
        </div>
        <export-selector
          :data="$options.data"
          :params="widgetParams"
          :energyTypes="energyTypes"
          :device="device"
          :name="name"
          :widget="params.name"
          :link="$refs"
          noChart
        />
      </template>
      <template slot="content" v-if="isData">
        <!-- Content -->
        <div v-show="widgetParams.type != 'table'">
          <mirt-chart
            ref="chart"
            :data="$options.data"
            :type="widgetParams.type"
            :units="EnergyGuide"
            isDailyChart
          />
        </div>
        <div v-if="widgetParams.type === 'table'">
          <mirt-table v-model="$options.table" />
        </div>
      </template>
    </widget-wrapper>
  </div>
</template>

<script>
import { VIEWMODES } from "@/config";
import axios from "axios";

export default {
  components: {
    WidgetWrapper: () => import("@/components/WidgetWrapper"),
    slicedDateIntervals: () => import("@/components/SlicedDateIntervals"),
    mirtChart: () => import("@/components/Charts/MirtChart"),
    numberInput: () => import("@/components/MirtNumberInput"),
    mirtTable: () => import("@/components/VirtualMirtTable"),
    ExportSelector: () => import("@/components/ExportSelector")
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
        energyType: null,
        date: {
          date: [new Date().toISOString(), new Date().toISOString()],
          slice: "one",
          range: false
        },
        isTestimony: true,
        type: "bar"
      },
      origWidgetParams: {},
      viewModes: VIEWMODES,
      energyTypes: [],
      isData: false,
      data: null,
      table: null,
      tariffs: [],
      EnergyGuide: null,
      loading: false,
      fail: null,
      showEditOverlay: false
    };
  },
  methods: {
    handleSettingsChanged(arg = true) {
      if (arg) this.getData();
      this.$emit("change", {
        widgetParams: this.widgetParams,
        updateGrid: false
      });
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get(
          `Chart/TimeSlicesIndications?DeviceID=${this.device.id}&DateFrom=${
            this.widgetParams.date.date[0]
          }&DateTo=${
            this.widgetParams.date.range
              ? this.widgetParams.date.date[1]
              : this.widgetParams.date.date[0]
          }&Period=${this.widgetParams.date.slice}&EnergyGuideCode=${
            this.widgetParams.energyType
          }&testimony=${this.widgetParams.isTestimony}`
        );
        if (
          !data.options ||
          !data.options.length ||
          !data.options[0] ||
          !data.options[0].units
        ) {
          this.isData = false;
          this.$options.data = null;
          this.EnergyGuide = null;
          this.tariffs = [];
          this.disableExport = true;
          this.fail = "err_no_data";
        } else {
          data.x_axis = this.$fixChartDates(data);
          data.options.map(x => {
            x.data = x.data.map(y => {
              if (!y.val && y.val != 0) y.val = "-";
              return y;
            });
          });
          this.EnergyGuide = this.$t(data.options[0].units);
          this.$options.data = data;
          this.disableExport = false;
          this.tariffs = this.$options.data.options.map(x => x.name);
          let table = [];
          const tariffs = [...this.tariffs, "trans__EnergyUnits"];
          table = this.$options.data.x_axis.map((date, i) => {
            let row = { date };
            tariffs.forEach((tariff, tariffIndex) => {
              const value =
                this.$options.data.options[tariffIndex] &&
                this.$options.data.options[tariffIndex].data
                  ? this.$options.data.options[tariffIndex].data[i]
                  : { val: this.EnergyGuide };
              row[tariff] = value.cut && !value.err ? "-" : `${value.val}`;
              row[tariff] = value.err ? this.$t("chartDataLost") : row[tariff];
            });
            return row;
          });
          this.$options.table = table;
          this.isData = true;
        }
      } catch (e) {
        this.fail = "err_bad_request_api";
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
    this.loading = true;
    try {
      const { data } = await axios.get(
        `Device/UnitsDevice?DeviceID=${this.device.id}`
      );
      this.energyTypes = data;
      if (!this.widgetParams.energyType && this.widgetParams.energyType != 0)
        this.widgetParams.energyType = data[0].unitsGuideEnergyCode;
      this.getData();
    } catch (e) {
      this.loading = false;
      this.fail = "err_bad_request_api";
      return;
    } finally {
      await this.$nextTick();
      this.$setSettingsScroll(this.$refs.settings);
    }
  }
};
</script>

<style module>
.modes {
  width: 50px;
  max-width: 50px;
}

.energies {
  margin-left: 15px;
  width: 80px;
  max-width: 80px;
}
</style>
