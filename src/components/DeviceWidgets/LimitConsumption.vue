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
          v-for="item in widgetParams.consumptionLimits"
          v-model="item.value"
          :max="999999999999"
          :step="1"
          :label="`${$t('widgetConsumptionLimit')} ${item.name}`"
          :key="item.name"
        />
      </template>
      <template slot="options">
        <!-- Options -->
        <div :class="$style.settingsWrap">
          <div>
            <div>
              <span :style="`background-color: ${defaultColor}`"></span
              ><span
                v-text="
                  `${$t(
                    'widgetLimitLegendLimit'
                  )}: ${consumptionLimit.toLocaleString()} ${$t(units)}`
                "
              ></span>
            </div>
            <div>
              <span :style="`background-color: ${color}`"></span
              ><span
                v-text="
                  `${$t('widgetLimitLegendCurrent')}: ${chartData} ${$t(units)}`
                "
              ></span>
            </div>
          </div>
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
      </template>
      <template slot="content" v-if="chartData || chartData === 0">
        <!-- Content -->
        <div :class="$style.chartWrap">
          <mirt-gauge-chart
            ref="chart"
            v-model="chartData"
            :limit="consumptionLimit"
            :units="units"
            :getColor="getColor"
            :defaultColor="defaultColor"
          />
          <div>
            <v-slide-group
              :class="$style.carousel"
              show-arrows
              :key="carouselKey"
            >
              <v-slide-item v-for="item in tariffsList" :key="item.index">
                <div
                  :class="$style.legendItem"
                  @click="handleLegendClick(item)"
                >
                  <span
                    :style="
                      `background-color: ${item.selected ? item.color : '#ddd'}`
                    "
                  ></span>
                  <span v-text="item.name"></span>
                </div>
              </v-slide-item>
            </v-slide-group>
          </div>
        </div>
      </template>
    </widget-wrapper>
  </div>
</template>

<script>
import { COLORS } from "@/config";
import axios from "axios";

export default {
  components: {
    WidgetWrapper: () => import("@/components/WidgetWrapper"),
    numberInput: () => import("@/components/MirtNumberInput"),
    mirtGaugeChart: () => import("@/components/Charts/MirtGaugeChart")
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
    color() {
      const p = (100 * this.chartData) / this.consumptionLimit;
      return this.getColor(p > 100 ? 100 : p);
    },
    chartData() {
      let start = 0;
      let curr = 0;
      let result = 0;
      this.tariffsList.forEach(x => {
        const d = this.data[x.index];
        if (x.selected) {
          start =
            d.vL_Start_Period === null || start === null
              ? null
              : +d.vL_Start_Period + start;
          curr =
            d.vL_Current_Period === null || curr === null
              ? null
              : +d.vL_Current_Period + curr;
        }
      });
      start = start === null ? null : this.fixResults(start);
      curr = curr == null ? null : this.fixResults(curr);
      result =
        start === null || curr === null ? null : this.fixResults(curr - start);
      return result ? result : 0;
    },
    consumptionLimit() {
      let result = 0;
      this.tariffsList.forEach(x => {
        if (x.selected)
          result = result + this.widgetParams.consumptionLimits[x.index].value;
      });
      return result;
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
        consumptionLimits: [],
        energyType: null
      },
      origWidgetParams: {},
      energyTypes: [],
      tariffsList: [],
      carouselKey: 0,
      loading: false,
      fail: null,
      showEditOverlay: false,
      defaultColor: "#d7e9f7",
      units: "",
      defaultConsumptionLimits: []
    };
  },
  methods: {
    handleResize() {
      if (!this.$refs.wrapper) return;
      const size = Math.round(this.$refs.wrapper.clientWidth / 9);
      this.fontSize = size >= 50 ? 50 : size;
      if (!this.timer)
        this.timer = setTimeout(() => {
          this.carouselKey = new Date().getTime();
          this.timer = null;
        }, 500);
    },

    getColor(arg) {
      const hue = ((1 - arg / 100) * 120).toString(10);
      return isNaN(hue) ? this.defaultColor : `hsl(${hue}, 100%, 45%)`;
    },

    handleLimitsRestore() {
      this.widgetParams.consumptionLimits = JSON.parse(
        JSON.stringify(this.defaultConsumptionLimits)
      );
    },

    handleSettingsChanged(arg = true) {
      if (arg) this.getData();
      this.$emit("change", {
        widgetParams: this.widgetParams,
        updateGrid: false
      });
    },

    fixResults(arg) {
      return parseFloat(arg.toFixed(2));
    },

    handleLegendClick(arg) {
      arg.selected = !arg.selected;
      if (this.tariffsList.filter(x => x.selected === true).length < 1)
        arg.selected = !arg.selected;
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get(
          `Chart/CurrentReadingsWithEnergyGuideCode?DeviceID=${this.device.id}&EnergyGuideCode=${this.widgetParams.energyType}`
        );
        if (data.readings.length) {
          this.data = data.readings;
          const arr = [];
          let limits = [];
          this.data.forEach((x, index) => {
            arr.push({
              name: x.tariff,
              index,
              selected: true,
              color: COLORS[index][1]
            });
            limits.push({
              name: x.tariff,
              value: 0
            });
          });
          this.tariffsList = arr;
          if (!this.widgetParams.consumptionLimits.length)
            this.widgetParams.consumptionLimits = limits;
          this.defaultConsumptionLimits = JSON.parse(
            JSON.stringify(this.widgetParams.consumptionLimits)
          );
          this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
          this.units = this.data[0].units;
        } else {
          this.data = null;
          this.fail = "err_no_data";
        }
      } catch (e) {
        this.fail = "err_bad_request_api";
        this.data = null;
      }
      this.loading = false;
    }
  },
  created() {
    this.widgetParams = this.$getWidgetParams(this);
    this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
  },
  async mounted() {
    if (!this.auth) return;
    if (this.$refs.wrapper)
      this.observer = new ResizeObserver(this.handleResize).observe(
        this.$refs.wrapper
      );
    this.loading = true;
    try {
      const { data } = await axios.get(
        `Device/UnitsDevice?DeviceID=${this.device.id}&DeviceType=${this.device.deviceType}`
      );
      this.energyTypes = data;
      if (!this.widgetParams.energyType && this.widgetParams.energyType != 0)
        this.widgetParams.energyType = data[0].unitsGuideEnergyCode;
      this.getData();
    } catch (e) {
      this.loading = false;
      this.fail = "err_bad_request_api";
      return;
    }
  },
  beforeDestroy() {
    if (this.observer && this.$refs.wrapper)
      this.observer.unobserve(this.$refs.wrapper);
  }
};
</script>

<style module>
.root {
  overflow: auto;
}

.settingsWrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settingsWrap > div > div {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.settingsWrap > div > div > span:first-child {
  display: inline-block;
  height: 14px;
  width: 14px;
  min-width: 14px;
  border-radius: 50%;
  margin-right: 10px;
}

.energies {
  margin-left: 15px;
  width: 80px;
  max-width: 80px;
}

.chartWrap {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.chartWrap > *:first-child {
  flex: 1;
}

.carousel {
  display: flex;
  align-items: center;
}

.legendItem {
  display: inline-block;
  cursor: pointer;
}

.legendItem + .legendItem {
  margin-left: 5px;
}

.legendItem > span:first-child {
  display: inline-block;
  height: 14px;
  width: 14px;
  margin: 0 10px 0 8px;
  border-radius: 50%;
  vertical-align: middle;
  background-color: #ddd;
}

.legendItem > span:first-child {
  vertical-align: sub;
}
</style>
