<template>
  <div ref="wrapper">
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
      </template>
      <template slot="options">
        <!-- Options -->
        <div :class="$style.settingsWrap">
          <v-select
            :class="$style.energies"
            :items="energyTypes"
            item-text="unitsNote"
            item-value="unitsGuideEnergyCode"
            :label="$t('trans__energyType')"
            v-model="widgetParams.energyType"
            @change="handleSettingsChanged()"
          />
        </div>
      </template>
      <template slot="content" v-if="data">
        <!-- Content -->
        <div :class="$style.displayWrap">
          <div :class="`display ${$style.display}`">
            <div
              v-text="`${$t('widgetReadingsFor')} ${displayData.dateStart}`"
            ></div>
            <div :class="`indicator ${$style.indicator}`">
              <div v-html="counterTitle"></div>
              <div>
                <div
                  :class="`digital ${$style.digital}`"
                  :style="`font-size: ${fontSize}px`"
                >
                  <span v-text="displayData.startVal"></span>
                  <span v-text="displayData.digits"></span>
                </div>
                <div v-text="$t(displayData.units)"></div>
              </div>
            </div>
          </div>
          <div :class="`display ${$style.display}`">
            <div
              v-text="`${$t('widgetReadingsFor')} ${displayData.dateCurr}`"
            ></div>
            <div :class="`indicator ${$style.indicator}`">
              <div v-html="counterTitle"></div>
              <div>
                <div
                  :class="`digital ${$style.digital}`"
                  :style="`font-size: ${fontSize}px`"
                >
                  <span v-text="displayData.currVal"></span>
                  <span v-text="displayData.digits"></span>
                </div>
                <div v-text="$t(displayData.units)"></div>
              </div>
            </div>
          </div>
          <div :class="`display ${$style.display}`">
            <div v-text="$t('groupColumnConsTotal')"></div>
            <div :class="`indicator ${$style.indicator}`">
              <div v-html="counterTitle"></div>
              <div>
                <div
                  :class="`digital ${$style.digital}`"
                  :style="`font-size: ${fontSize}px`"
                >
                  <span v-text="displayData.diffVal"></span>
                  <span v-text="displayData.digits"></span>
                </div>
                <div v-text="$t(displayData.units)"></div>
              </div>
            </div>
          </div>
          <div :class="$style.carouselWrap">
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
    WidgetWrapper: () => import("@/components/WidgetWrapper")
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
    counterTitle() {
      const arr = [];
      this.tariffsList.forEach(x => {
        if (x.selected) arr.push(x.name);
      });
      return arr.length > 1 ? `<span>∑</span>${arr.join("")}` : arr.join("");
    },
    displayData() {
      let obj = {
        dateStart: null,
        dateCurr: null,
        startVal: null,
        currVal: null,
        diffVal: null,
        units: null,
        temp: {
          start: null,
          curr: null,
          diff: null
        },
        emptyString: "",
        digits: "",
        max: this.maxDigitsLimit
      };
      obj.dateStart = this.data[0].dT_Start_Period;
      obj.dateCurr = this.data[0].dT_Current_Period;
      obj.units = this.data[0].units;
      let start = 0;
      let curr = 0;
      let tmpStart = 0;
      let tmpCurr = 0;
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
        tmpStart =
          d.vL_Start_Period === null || tmpStart === null
            ? null
            : +d.vL_Start_Period + tmpStart;
        tmpCurr =
          d.vL_Current_Period === null || tmpCurr === null
            ? null
            : +d.vL_Current_Period + tmpCurr;
      });
      obj.startVal = start === null ? null : this.fixResults(start);
      obj.currVal = curr == null ? null : this.fixResults(curr);
      obj.diffVal =
        start === null || curr === null ? null : this.fixResults(curr - start);
      obj.temp.start = tmpStart === null ? null : this.fixResults(tmpStart);
      obj.temp.curr = tmpCurr == null ? null : this.fixResults(tmpCurr);
      obj.temp.diff =
        tmpStart === null || tmpCurr === null
          ? null
          : this.fixResults(tmpCurr - tmpStart);
      const startVal = isNaN(obj.temp.start)
        ? 0
        : String(obj.temp.start).length;
      const currVal = isNaN(obj.temp.curr) ? 0 : String(obj.temp.curr).length;
      const diffVal = isNaN(obj.temp.diff) ? 0 : String(obj.temp.diff).length;
      const max = Math.max(startVal, currVal, diffVal);
      obj.max = max > this.maxDigitsLimit ? max : this.maxDigitsLimit;
      for (let i = 0; i < obj.max; i++) {
        obj.emptyString = obj.emptyString + "-";
        obj.digits = obj.digits + "8";
      }
      obj.startVal = obj.startVal === null ? obj.emptyString : obj.startVal;
      obj.currVal = obj.currVal == null ? obj.emptyString : obj.currVal;
      obj.diffVal = obj.diffVal == null ? obj.emptyString : obj.diffVal;
      return obj;
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
      observer: null,
      fontSize: 50,
      energyTypes: [],
      widgetParams: {
        name: this.params.settings.name ? this.params.settings.name : null,
        energyType: null
      },
      origWidgetParams: {},
      showEditOverlay: false,
      loading: false,
      fail: null,
      data: null,
      tariffsList: [],
      carouselKey: 0,
      timer: null,
      maxDigitsLimit: 9
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

    fixResults(arg) {
      return parseFloat(arg.toFixed(2));
    },

    handleLegendClick(arg) {
      arg.selected = !arg.selected;
      if (this.tariffsList.filter(x => x.selected === true).length < 1)
        arg.selected = !arg.selected;
    },

    handleSettingsChanged() {
      this.getData();
      this.$emit("change", {
        widgetParams: this.widgetParams,
        updateGrid: false
      });
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
          this.data.forEach((x, index) => {
            arr.push({
              name: x.tariff,
              index,
              selected: true,
              color: COLORS[index][1]
            });
          });
          this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
          this.tariffsList = arr;
        } else {
          this.fail = "err_no_data";
          this.data = null;
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
    if (this.$refs.wrapper)
      this.observer = new ResizeObserver(this.handleResize).observe(
        this.$refs.wrapper
      );
    this.getData();
  },
  beforeDestroy() {
    if (this.observer && this.$refs.wrapper)
      this.observer.unobserve(this.$refs.wrapper);
  }
};
</script>

<style module>
.settingsWrap {
  display: flex;
  flex: 1;
  width: 100%;
  justify-content: flex-end;
}

.energies {
  width: 80px;
  max-width: 80px;
}

.energies > * > *:last-child {
  display: none;
}

.displayWrap {
  flex: 1;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: center;
}

.display {
  margin-bottom: 10px;
  color: #000;
}

.display > *:first-child {
  text-align: center;
}

.indicator {
  margin: 0 auto;
  padding: 5px 10px;
  max-width: 410px;
  border-radius: 3px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.35);
}

.indicator > *:last-child {
  display: flex;
  align-items: flex-end;
}

.indicator > *:last-child > *:last-child {
  margin-left: 10px;
  margin-bottom: 2px;
  font-size: 8px;
}

.digital {
  position: relative;
  width: 100%;
  text-align: right;
  line-height: 0.8;
}

.digital > span:first-child {
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
  z-index: 1;
}

.digital > span:last-child {
  text-align: right;
  z-index: -1;
}

.carouselWrap {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.carousel {
  display: flex;
  margin-top: 20px;
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
