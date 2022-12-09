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
            v-model="widgetParams.date"
            mode="month"
            multiple
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
      </template>
      <template slot="content" v-if="dataBefore && dataAfter">
        <!-- Content -->
        <mirt-compare-chart
          v-if="widgetParams.type != 'table'"
          ref="chart"
          :data-before="dataBefore"
          :data-after="dataAfter"
          :type="widgetParams.type"
          :units="EnergyGuide"
          :isDailyChart="true"
        />
        <div v-else>
          <mirt-compare-table
            v-model="table"
            :before="dateBefore"
            :after="dateAfter"
          />
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
    mirtCompareChart: () => import("@/components/charts/MirtCompareChart"),
    numberInput: () => import("@/components/MirtNumberInput"),
    mirtCompareTable: () => import("@/components/MirtCompareTable")
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
    table() {
      if (
        this.widgetParams.type !== "table" ||
        !this.dataBefore ||
        !this.dataAfter
      )
        return [];
      let table = [];
      const tariffs = [...this.tariffs, "trans__EnergyUnits"];
      table = this.dataBefore.x_axis.map((date, i) => {
        let row = { date: this.xFormatter(date) };
        tariffs.forEach((tariff, tariffIndex) => {
          let valueBefore = this.dataBefore.options[tariffIndex]
            ? this.dataBefore.options[tariffIndex].data[i]
            : null;
          let valueAfter = this.dataAfter.options[tariffIndex]
            ? this.dataAfter.options[tariffIndex].data[i]
            : null;
          if (tariff != "trans__EnergyUnits") {
            valueBefore =
              (valueBefore.cut && !valueBefore.err) || valueBefore === null
                ? "-"
                : valueBefore.err
                ? this.$t("chartDataLost")
                : `${valueBefore.val}`;
            valueAfter =
              (valueAfter.cut && !valueAfter.err) || valueAfter === null
                ? "-"
                : valueAfter.err
                ? this.$t("chartDataLost")
                : `${valueAfter.val}`;
          } else {
            valueBefore = this.EnergyGuide;
            valueAfter = this.EnergyGuide;
          }
          row[tariff] = {
            before: valueBefore,
            after: valueAfter
          };
        });
        return row;
      });
      return table;
    },
    dateBefore() {
      if (!this.dataBefore.x_axis.length) return null;
      let d = new Date(this.dataBefore.x_axis[0]).toLocaleString(
        this.$store.state.lang,
        {
          month: "long"
        }
      );
      return d.charAt(0).toUpperCase() + d.slice(1);
    },
    dateAfter() {
      if (!this.dataAfter.x_axis.length) return null;
      let d = new Date(this.dataAfter.x_axis[0]).toLocaleString(
        this.$store.state.lang,
        {
          month: "long"
        }
      );
      return d.charAt(0).toUpperCase() + d.slice(1);
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
          slice: "",
          range: false
        },
        isTestimony: false,
        type: "bar"
      },
      origWidgetParams: {},
      viewModes: VIEWMODES,
      energyTypes: [],
      dataBefore: null,
      dataAfter: null,
      tariffs: [],
      EnergyGuide: null,
      loading: false,
      fail: null,
      showEditOverlay: false
    };
  },
  methods: {
    xFormatter(arg) {
      arg = arg.split("-");
      return +arg[2];
    },

    handleSettingsChanged(arg = true) {
      if (arg) this.getData();
      this.$emit("change", {
        widgetParams: this.widgetParams,
        updateGrid: false
      });
    },

    fixData({ dataBefore, dataAfter }) {
      const length = Math.max(
        dataBefore.x_axis.length,
        dataAfter.x_axis.length
      );
      const before = dataBefore.x_axis[0].split("-");
      const after = dataAfter.x_axis[0].split("-");
      dataBefore.x_axis = [];
      dataAfter.x_axis = [];
      for (let i = 0; i < length; i++) {
        dataBefore.x_axis.push(`${before[0]}-${before[1]}-${i + 1}`);
        dataAfter.x_axis.push(`${after[0]}-${after[1]}-${i + 1}`);
      }
      const obj = { cut: true, err: false, val: 0 };
      dataBefore.options.map(x => {
        const arr = [...new Set([...x.data])];
        for (let i = 0; i < length; i++) if (!x.data[i]) arr.push(obj);
        x.data = arr;
      });
      dataAfter.options.map(x => {
        const arr = [...new Set([...x.data])];
        for (let i = 0; i < length; i++) if (!x.data[i]) arr.push(obj);
        x.data = arr;
      });
      return [dataBefore, dataAfter];
    },

    async getData() {
      this.loading = true;
      try {
        let [dataBefore, dataAfter] = await Promise.all([
          axios.get(
            `Chart/ConsumptionByMonth?DeviceID=${this.device.id}&DateFrom=${this.widgetParams.date.date[0]}&EnergyGuideCode=${this.widgetParams.energyType}&testimony=${this.widgetParams.isTestimony}`
          ),
          axios.get(
            `Chart/ConsumptionByMonth?DeviceID=${this.device.id}&DateFrom=${this.widgetParams.date.date[1]}&EnergyGuideCode=${this.widgetParams.energyType}&testimony=${this.widgetParams.isTestimony}`
          )
        ]);
        dataBefore = dataBefore.data;
        dataAfter = dataAfter.data;
        if (
          !dataBefore.options ||
          !dataBefore.options.length ||
          !dataAfter.options ||
          !dataAfter.options.length
        ) {
          this.fail = this.$chkNoDatas(dataBefore, dataAfter, "month");
          this.dataBefore = null;
          this.dataAfter = null;
          this.EnergyGuide = null;
          this.tariffs = [];
          this.disableExport = true;
        } else if (
          !dataBefore.options[0] ||
          !dataBefore.options[0].units ||
          !dataAfter.options[0] ||
          !dataAfter.options[0].units
        ) {
          this.dataBefore = null;
          this.dataAfter = null;
          this.EnergyGuide = null;
          this.tariffs = [];
          this.disableExport = true;
          this.fail = "err_no_data";
        } else {
          dataBefore.x_axis = this.$fixChartDates(dataBefore);
          dataAfter.x_axis = this.$fixChartDates(dataAfter);
          [dataBefore, dataAfter] = this.fixData({ dataBefore, dataAfter });
          dataBefore.options.map(x => {
            x.data = x.data.map(y => {
              if (!y.val && y.val != 0) y.val = "-";
              return y;
            });
          });
          dataAfter.options.map(x => {
            x.data = x.data.map(y => {
              if (!y.val && y.val != 0) y.val = "-";
              return y;
            });
          });
          this.EnergyGuide = this.$t(dataBefore.options[0].units);
          this.dataBefore = dataBefore;
          this.dataAfter = dataAfter;
          this.disableExport = false;
          this.tariffs = this.dataBefore.options.map(x => x.name);
        }
      } catch (e) {
        console.log(e);
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
