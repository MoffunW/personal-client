import Vue from "vue";
import { COLORS } from "@/config";

class __Chart {
  constructor({ _ }) {
    this._ = _;
    this.noDataText = _.$t("chartDataLost");
    this.colors = COLORS;
    this.parent = _.$el.closest(".vue-grid-item");
    this.xFormatter = this._.xFormatter ? this._.xFormatter : arg => arg;
    this.themeProps = {
      light: {
        color: "#5f5f5f",
        fontWeight: "normal",
        formatter: arg => arg,
        xFormatter: this.xFormatter,
        zonesFormatter: this.noDataText
      },
      dark: {
        color: "#cecece",
        fontWeight: "normal",
        formatter: arg => arg,
        xFormatter: this.xFormatter,
        zonesFormatter: this.noDataText
      },
      contrast: {
        color: "#000",
        fontWeight: 600,
        formatter: arg => (isNaN(arg) ? arg.toUpperCase() : arg),
        xFormatter: arg => {
          let result = this.xFormatter(arg);
          return isNaN(result) ? result.toUpperCase() : result;
        },
        zonesFormatter: this.noDataText.toUpperCase()
      }
    };
    this.getOptions();
    this.init();
  }

  getOptions() {
    this.options = {
      calculable: true,
      animation: false,
      textStyle: {
        fontSize: 10
      },
      grid: {
        left: 60,
        top: 10,
        right: 10,
        bottom: 70
      },
      xAxis: {
        type: "category",
        silent: true,
        splitArea: { show: false },
        splitLine: { show: false },
        axisTick: {
          lineStyle: {
            color: "#929aba"
          },
          alignWithLabel: true
        },
        axisLabel: {
          fontSize: 10,
          formatter: this.xFormatter
        },
        axisLine: {
          lineStyle: {
            color: this.themeProps["light"].color
          }
        },
        boundaryGap: true,
        data: []
      },
      yAxis: {
        type: "value",
        splitArea: { show: true },
        axisLine: {
          show: true,
          lineStyle: {
            color: this.themeProps["light"].color
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        },
        axisLabel: {
          fontSize: 10,
          formatter: arg => arg,
          interval: "auto"
        },
        name: this._.units,
        nameLocation: "middle",
        nameGap: 50
      },
      tooltip: {
        show: true,
        trigger: "axis",
        padding: 0,
        axisPointer: {
          type: "shadow"
        },
        formatter: this._.tooltipFormatter
      },
      legend: {
        bottom: 0,
        type: "scroll",
        icon: "circle",
        pageIconColor: "#00000042",
        pageIconInactiveColor: "#ddd",
        formatter: arg => arg,
        pageTextStyle: {
          color: this.themeProps[this._.$store.state.theme].color
        },
        textStyle: {
          fontSize: 10
        },
        pageIcons: {
          horizontal: [
            `image://${require(`@/assets/themes/${process.env.VUE_APP_THEME}/chartPageLeft.png`)}`,
            `image://${require(`@/assets/themes/${process.env.VUE_APP_THEME}/chartPageRight.png`)}`
          ]
        },
        data: []
      },
      series: []
    };
    this.showZoom();
    this.setTheme();
    this.getChartTypeData();
  }

  setNoDataTheme(item, theme = null) {
    if (item && item.markArea) {
      theme = theme ? theme : this._.$store.state.theme;
      const obj = this.themeProps[theme];
      item.markArea.label.color = obj.color;
      item.markLine.label.color = obj.color;
      item.markLine.label.fontWeight = obj.fontWeight;
      item.markLine.label.formatter = obj.zonesFormatter;
      item.markArea.label.formatter = obj.zonesFormatter;
    }
  }

  setTheme(theme = null) {
    theme = theme ? theme : this._.$store.state.theme;
    const obj = this.themeProps[theme];
    this.options.textStyle = obj;
    this.options.legend.textStyle = obj;
    this.options.legend.formatter = obj.formatter;
    this.options.xAxis.axisLine.lineStyle.color = obj.color;
    this.options.xAxis.axisLabel.formatter = obj.xFormatter;
    this.options.yAxis.axisLine.lineStyle.color = obj.color;
    this.options.yAxis.axisLabel.formatter = obj.formatter;
    this.options.legend.pageTextStyle.color = obj.color;
    this.setNoDataTheme(
      this.options.series[this.options.series.length - 1],
      theme
    );
  }

  showZoom() {
    if (this._.data.x_axis.length <= 31) return;
    this.options.grid.bottom = 110;
    this.options.legend.bottom = 50;
    this.options.dataZoom = [
      {
        type: "slider",
        handleSize: "80%",
        brushSelect: false,
        throttle: 0,
        minValueSpan: 25,
        maxValueSpan: 25
      },
      {
        type: "inside",
        orient: "horizontal",
        throttle: 0,
        filterMode: "empty"
      }
    ];
  }

  getGradient(arg) {
    return {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        {
          offset: 0,
          color: this.colors[arg][0]
        },
        {
          offset: 0.5,
          color: this.colors[arg][1]
        },
        {
          offset: 1,
          color: this.colors[arg][0]
        }
      ],
      globalCoord: false
    };
  }

  prepareChartData(x, index) {
    let obj = {
      data: x.data,
      name: x.name
    };
    if (this._.type === "line") {
      obj.type = "line";
      obj.sampling = "average";
      obj.color = this.colors[index][1];
      obj.showSymbol = true;
      obj.symbolSize = 6;
      obj.symbol = (a, b) => {
        let start = b.dataIndex - 1 < 0 ? "-" : x.data[b.dataIndex - 1].val;
        let end =
          b.dataIndex + 1 >= x.data.length ? "-" : x.data[b.dataIndex + 1].val;
        return start === "-" && end === "-" ? "circle" : "none";
      };
      obj.lineStyle = {
        width: 2
      };
    } else {
      obj.type = "bar";
      obj.stack = "_";
      obj.sampling = "average";
      if (this._.data.x_axis.length > 400) {
        obj.color = this.colors[index][1];
        obj.large = true;
        obj.largeThreshold = 2;
        obj.progressive = 2;
        obj.progressiveThreshold = 0;
        obj.progressiveChunkMode = "sequential";
      } else {
        obj.color = this.getGradient(index);
      }
    }
    obj.smooth = true;
    obj.connectNulls = false;
    return obj;
  }

  getNoDataZones() {
    let params = {
      tmp: [],
      show: false,
      barArr: [],
      lineArr: [],
      noData: [],
      noBar: []
    };
    for (let i in this._.data.x_axis) {
      let acc = { err: true, sum: 0, values: [] };
      for (let j in this._.data.options) {
        let item = this._.data.options[j].data[i];
        if (item.err === false) acc.err = false;
        if (!isNaN(item.val)) {
          acc.sum = acc.sum + item.val;
          acc.values.push(item.val);
        }
        if (this._.data.options.length - 1 === +j) {
          params.barArr.push(acc.sum);
          params.lineArr.push(...acc.values);
          if (params.show != acc.err) {
            params.show = acc.err;
            if (params.show) {
              params.tmp.push({
                xAxis: this._.data.x_axis[i]
              });
            } else {
              params.tmp.push({
                xAxis: this._.data.x_axis[i - 1]
              });
              params.tmp[0].xAxis === params.tmp[1].xAxis
                ? params.noBar.push({ xAxis: params.tmp[1].xAxis })
                : params.noData.push(params.tmp);
              params.tmp = [];
            }
          }
          if (
            this._.data.x_axis[i] ===
              this._.data.x_axis[this._.data.x_axis.length - 1] &&
            acc.err
          ) {
            params.tmp.push({
              xAxis: this._.data.x_axis[i]
            });
            params.tmp[0].xAxis === params.tmp[1].xAxis
              ? params.noBar.push({ xAxis: params.tmp[1].xAxis })
              : params.noData.push(params.tmp);
            params.tmp = [];
          }
          acc = { err: true, sum: 0, values: [] };
        }
      }
    }
    let obj = {
      connectNulls: false,
      data: [],
      showSymbol: false,
      smooth: true,
      symbol: "none",
      type: "line",
      sampling: "average",
      markLine: {
        silent: true,
        symbol: "none",
        label: {
          show: true,
          position: "middle",
          opacity: 1,
          distance: -6,
          rotate: 90,
          color: this.themeProps["light"].color,
          formatter: this.noDataText
        },
        lineStyle: {
          color: "#cf5b45",
          opacity: 0.5,
          width: 20,
          type: "solid"
        },
        data: params.noBar
      },
      markArea: {
        silent: true,
        label: {
          show: true,
          position: "inside",
          opacity: 1,
          rotate: 90,
          color: this.themeProps["light"].color,
          formatter: this.noDataText
        },
        itemStyle: {
          color: "#cf5b45",
          opacity: 0.5
        },
        data: params.noData
      }
    };
    this.setNoDataTheme(obj);
    return obj;
  }

  getChartTypeData() {
    this.options.xAxis.data = this._.data.x_axis;
    let legendData = [];
    let data = [];
    this._.data.options.forEach((x, index) => {
      let obj = this.prepareChartData(x, index);
      if (obj.name) {
        obj.name = this._.$t(obj.name);
        legendData.push({
          name: obj.name,
          itemStyle: {
            color: this.colors[index][1]
          }
        });
      }
      obj.data = obj.data.map(y => (y.val = y.cut || y.err ? "-" : y.val));
      data.push(obj);
    });
    this.options.legend.data = legendData;
    data[data.length] = this.getNoDataZones();
    this.options.series = data;
  }

  fixYLabel() {
    let step = 6;
    let length = 0;
    let obj = this._.chart.getModel().getComponent("yAxis").axis.scale;
    for (let i = obj._extent[1]; i >= obj._extent[0]; i = i - obj._interval) {
      const val = parseFloat(i.toFixed(obj._intervalPrecision - 2)).toString()
        .length;
      if (val > length) length = val;
    }
    this.options.grid.left = (length + 4) * step;
    this.options.yAxis.nameGap = (length + 2) * step;
    this._.chart.setOption(this.options);
  }

  init() {
    this.options && this._.chart.setOption(this.options);
    this._.chart
      .getZr()
      .on("mouseout", () => this.parent.style.removeProperty("z-index"));
    this.fixYLabel();
  }

  updateUnits(arg) {
    this.options.yAxis.name = arg;
    this._.chart.setOption(this.options);
  }

  updateTheme(arg = null) {
    arg ? this.setTheme(arg) : this.setTheme();
    this._.chart.setOption(this.options);
  }

  updateData() {
    this.showZoom();
    this.getChartTypeData();
    this._.chart.setOption(this.options);
    this.fixYLabel();
  }

  updateType() {
    this.getChartTypeData();
    this._.chart.setOption(this.options);
    this.fixYLabel();
  }

  exportChart() {
    this.options.backgroundColor = "#fff";
    this.updateTheme("light");
    this._.chart.resize({
      width: 990,
      height: 320,
      silent: true
    });
    const png = this._.chart.getDataURL();
    this.options.backgroundColor = "transparent";
    this._.chart.resize({
      width: "auto",
      height: "auto",
      silent: true
    });
    this.updateTheme();
    return png;
  }
}

Vue.prototype.$initEChart = _ => {
  return new __Chart({ _ });
};

export default {};
