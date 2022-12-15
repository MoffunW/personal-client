<template>
  <div :class="`MirtChart ${$style.root}`" ref="chart"></div>
</template>


<script>
import * as echarts from "echarts";

export default {
  props: {
    data: {
      required: true
    },
    type: {
      type: String,
      required: true
    },
    units: {
      type: String,
      required: true
    },
    isDailyChart: {
      type: Boolean,
      required: false
    },
    xFormatter: {
      type: Function,
      required: false
    }
  },
  data() {
    return {
      chart: null,
      chartInstance: null,
      observer: null,
      timer: null
    };
  },
  watch: {
    "$store.state.theme"() {
      this.chartInstance.updateTheme();
    },

    type() {
      this.chartInstance.updateType();
    },

    data() {
      this.chartInstance.updateData();
    },

    units() {
      this.chartInstance.updateUnits(this.units);
    }
  },
  methods: {
    exportChart() {
      return this.chartInstance.exportChart();
    },

    tooltipFormatter(arg) {
      if (this.chartInstance && this.chartInstance.parent)
        this.chartInstance.parent.style.zIndex = 1;
      let name = "";
      if (this.isDailyChart) {
        name = arg[0].axisValue;
      } else {
        let m = new Date(arg[0].axisValue).toLocaleString(
          this.$store.state.lang,
          {
            month: "long"
          }
        );
        name = `${m.charAt(0).toUpperCase()}${m.slice(1)} ${
          arg[0].axisValue.split("-")[0]
        }`;
      }
      let total = 0;
      let arr = [];
      let str = `<table class="${this.$style.toolTipTable}">`;
      arg.forEach(x => {
        arr.push(x.data === "-");
        total += !isNaN(x.data) ? x.data : 0;
        let color =
          typeof x.color === "object" ? x.color.colorStops[1].color : x.color;
        let marker = `<span class="${this.$style.marker}" style="background-color:${color}!important;"></span>`;
        str += `<tr><td>${marker}</td><td>${x.seriesName}:</td><td>&nbsp;${x.value}</td></tr>`;
      });
      let show = arr.includes(false);
      total = !show ? show : +total.toFixed(2);
      str += "</table>";
      str += `<div class="${this.$style.toolTipTotal}">${this.$t(
        "chartTooltipTotal"
      )}: ${total}</div>`;
      return `<div class="${show ? "" : `noData ${this.$style.noData}`} ${
        this.$style.toolTip
      }">
      <div class="${this.$style.toolTipTitle}">${name}</div>${
        show ? str : this.$t("chartDataLost")
      }
    </div>`;
    },

    handleResize() {
      if (!this.chart) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(
        () => (this.chart ? this.chart.resize() : null),
        200
      );
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el);
    this.chartInstance = this.$initEChart(this);
    if (this.$el)
      this.observer = new ResizeObserver(this.handleResize).observe(this.$el);
  },
  beforeDestroy() {
    this.chart.dispose();
    this.chart = null;
    if (this.observer) this.observer.unobserve(this.$el);
  }
};
</script>

<style module>
.root {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 266px;
  font-size: 10px;
}

.root * canvas {
  background-color: transparent !important;
}

.toolTip {
  padding: 5px;
  font-size: 12px;
}

.toolTipTitle {
  font-weight: bold;
  text-align: center;
  border-bottom: #ccc 1px solid;
}

.toolTipTotal {
  font-weight: bold;
  border-top: #ccc 1px solid;
}

.toolTipTable {
  border: none;
  border-collapse: separate;
}

.toolTipTable td {
  vertical-align: middle;
}

.toolTipTable td .marker {
  display: inline-block;
  margin-right: 4px;
  border-radius: 50%;
  width: 10px;
  height: 10px;
}

.noData {
  background-color: #cf5b45;
  color: #fff !important;
}
</style>
