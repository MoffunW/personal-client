<template>
  <div>
    <div>
      <v-select
        :class="$style.selectWrap"
        :items="exportFormats"
        item-text="icon"
        item-value="val"
        :label="$t('trans__Download')"
        :loading="loading"
        :disabled="loading || !data"
      >
        <template slot="selection" slot-scope="data">
          <div :class="$style.selectItem">
            <v-icon :style="`color: ${icons[data.item].color}`">{{
              icons[data.item].icon
            }}</v-icon>
          </div>
        </template>
        <template slot="item" slot-scope="data">
          <div :class="$style.selectItem" @click="exportData(data.item)">
            <v-icon :style="`color: ${icons[data.item].color}`">{{
              icons[data.item].icon
            }}</v-icon>
          </div>
        </template>
      </v-select>
    </div>
  </div>
</template>

<script>
import { EXPORTICONS } from "@/config";
import axios from "axios";

export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    energyTypes: {
      type: Array,
      default: () => []
    },
    data: {
      type: [Object, Function],
      default: () => {}
    },
    device: {
      type: Object,
      default: () => {}
    },
    name: {
      type: String,
      default: ""
    },
    widget: {
      type: String,
      default: ""
    },
    link: {
      type: Object,
      default: () => {}
    },
    noChart: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    exportFormats() {
      return this.$store.state.exportsSettings[this.widget]
        ? this.$store.state.exportsSettings[this.widget]
        : null;
    },
    icons() {
      return EXPORTICONS;
    },
    energyType() {
      const _ = this.energyTypes.find(
        x => x.unitsGuideEnergyCode === this.params.energyType
      );
      return _ ? _.unitsNote : null;
    },
    chart() {
      //if (this.params.type === "table") return null;
      return this.link.chart ? this.link.chart : null;
    },
    dates() {
      if (!this.link.dateSelector)
        return {
          dateStart: null,
          dateEnd: null
        };
      const _ =
        this.link.dateSelector.useRange ||
        Object.prototype.hasOwnProperty.call(
          this.link.dateSelector.$options.propsData,
          "multiple"
        );
      return this.link.dateSelector.$options.propsData.mode &&
        this.link.dateSelector.$options.propsData.mode === "year"
        ? _
          ? {
              dateStart: this.link.dateSelector.startYear,
              dateEnd: this.link.dateSelector.endYear
            }
          : { dateStart: this.link.dateSelector.startYear, dateEnd: null }
        : _
        ? {
            dateStart: this.link.dateSelector.rangedDate[0],
            dateEnd: this.link.dateSelector.rangedDate[1]
          }
        : { dateStart: this.link.dateSelector.date, dateEnd: null };
    },
    slice() {
      if (
        !this.link.dateSelector._props.sliced ||
        !this.$store.state.serverSettings.slices ||
        !this.params.date.slice
      )
        return null;
      const _ = this.$store.state.serverSettings.slices.find(
        x => x.value === this.params.date.slice
      );
      return _ ? _.key : null;
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async exportData(arg) {
      try {
        const obj = {
          Extension: arg,
          NodeName: this.device.text,
          GuidID: this.device.id,
          WidgetName: this.name,
          DateFrom: this.dates.dateStart,
          EnergyType: this.energyType,
          Testimony: this.params.isTestimony,
          Step: this.step,
          x_axis: this.data.x_axis,
          options: this.data.options
        };
        if (this.dates.dateEnd) obj.DateTo = this.dates.dateEnd;
        //if (this.chart) obj.ImgBase64 = this.chart.exportChart();
        obj.ImgBase64 = this.noChart ? null : this.chart.exportChart();
        this.loading = true;
        const { data } = await axios.post("ChartToFile/GetReportWidget", obj, {
          headers: { "Content-Type": "application/json" }
        });
        let a = document.createElement("a");
        a.href = data;
        a.download = `Report ${new Date()
          .toLocaleString("RU-ru")
          .replace(/,/g, "")
          .replace(/[/:]/g, "-")}.${arg}`;
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
    if (!this.exportFormats) return;
  }
};
</script>

<style module>
.selectWrap {
  width: 80px;
}

.selectItem {
  width: 100%;
  text-align: center;
}
</style>
