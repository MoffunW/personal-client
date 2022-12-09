<template>
  <div :class="$style.root" ref="chart"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    dataBefore: {
      required: true
    },
    dataAfter: {
      required: true
    },
    type: {
      type: String,
      default: "line"
    },
    units: {
      type: String,
      required: true
    },
    isDailyChart: {
      type: Boolean,
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

    dataBefore() {
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

    xFormatter(arg) {
      if (this.isDailyChart) {
        arg = arg.split("-");
        return +arg[2];
      } else {
        arg = new Date(arg).toLocaleString(this.$store.state.lang, {
          month: "long"
        });
        return arg.charAt(0).toUpperCase() + arg.slice(1);
      }
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
    this.chartInstance = this.$initCompareChart(this);
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
  position: relative;
  height: 100%;
  min-height: 266px;
  font-size: 10px;
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

.marker {
  display: inline-block;
  margin-right: 4px;
  border-radius: 50%;
  width: 10px;
  height: 10px;
}

span.valueGreen {
  color: #9bca7c !important;
}

span.valueRed {
  color: #cf5b45 !important;
}

.noData {
  background-color: #cf5b45;
  color: #fff !important;
}
</style>
