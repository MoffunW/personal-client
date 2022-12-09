import Vue from "vue";
import { COLORS } from "@/config";

class __Chart {
  constructor({ _ }) {
    this._ = _;
    this.activeLegendId = null;
    this.legendObj = null;
    this.noDataText = _.$t("chartDataLost");
    this.opacity = 0.5;
    this.fontSize = 5;
    this.colors = COLORS;
    this.parent = _.$el.closest(".vue-grid-item");
    this.altColors = [
      [
        `rgba(110, 198, 255, ${this.opacity})`,
        `rgba(33, 150, 243, ${this.opacity})`
      ],
      [
        `rgba(255, 121, 97, ${this.opacity})`,
        `rgba(244, 67, 54, ${this.opacity})`
      ],
      [
        `rgba(255, 243, 80, ${this.opacity})`,
        `rgba(255, 193, 7, ${this.opacity})`
      ],
      [
        `rgba(190, 246, 122, ${this.opacity})`,
        `rgba(139, 195, 74, ${this.opacity})`
      ],
      [
        `rgba(0, 178, 214, ${this.opacity})`,
        `rgba(0, 129, 155, ${this.opacity})`
      ],
      [
        `rgba(255, 125, 1, ${this.opacity})`,
        `rgba(210, 103, 0, ${this.opacity})`
      ],
      [
        `rgba(2, 134, 129, ${this.opacity})`,
        `rgba(0, 86, 83, ${this.opacity})`
      ],
      [
        `rgba(150, 18, 182, ${this.opacity})`,
        `rgba(89, 11, 108, ${this.opacity})`
      ]
    ];
    this.xFormatter = this._.xFormatter ? this._.xFormatter : arg => arg;
    this.themeProps = {
      light: {
        color: "#5f5f5f",
        fontWeight: "normal",
        formatter: arg => arg,
        xFormatter: this.xFormatter,
        legendTitleFormatter: arg => arg
      },
      dark: {
        color: "#cecece",
        fontWeight: "normal",
        formatter: arg => arg,
        xFormatter: this.xFormatter,
        legendTitleFormatter: arg => arg
      },
      contrast: {
        color: "#000",
        fontWeight: 600,
        formatter: arg => (isNaN(arg) ? arg.toUpperCase() : arg),
        xFormatter: arg =>
          this.xFormatter(arg)
            .toString()
            .toUpperCase(),
        legendTitleFormatter: arg =>
          arg.includes("|")
            ? `{a|${arg.split("|")[1].toUpperCase()}`
            : arg.toUpperCase()
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
        formatter: arg => this.tooltipFormatter(arg, this._)
      },
      legend: [
        {
          id: 1,
          bottom: 20,
          type: "scroll",
          icon: "circle",
          pageIconColor: "#00000042",
          pageIconInactiveColor: "#ddd",
          formatter: arg => arg,
          data: [],
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            fontSize: 10,
            padding: [0, 0, 0, 0],
            fontWeight: "bold"
          },
          pageTextStyle: {
            color: this.themeProps[this._.$store.state.theme].color
          },
          pageIcons: {
            horizontal: [
              `image://${require(`@/assets/themes/${process.env.VUE_APP_THEME}/chartPageLeft.png`)}`,
              `image://${require(`@/assets/themes/${process.env.VUE_APP_THEME}/chartPageRight.png`)}`
            ]
          }
        },
        {
          id: 2,
          bottom: 0,
          type: "scroll",
          icon: "circle",
          pageIconColor: "transparent",
          pageIconInactiveColor: "transparent",
          pageTextStyle: {
            color: "transparent"
          },
          formatter: arg => arg,
          data: [],
          itemWidth: 12,
          itemHeight: 12
        }
      ],
      series: []
    };
    this.showZoom();
    this.setTheme();
    this.getChartTypeData();
  }

  setTheme(theme = null) {
    theme = theme ? theme : this._.$store.state.theme;
    const obj = this.themeProps[theme];
    this.options.textStyle = obj;
    this.options.legend[0].textStyle = obj;
    this.options.legend[0].formatter = obj.legendTitleFormatter;
    this.options.legend[0].pageTextStyle.color = obj.color;
    this.options.legend[1].textStyle = obj;
    this.options.legend[1].formatter = obj.legendTitleFormatter;
    this.options.xAxis.axisLine.lineStyle.color = obj.color;
    this.options.xAxis.axisLabel.formatter = obj.xFormatter;
    this.options.yAxis.axisLine.lineStyle.color = obj.color;
    this.options.yAxis.axisLabel.formatter = obj.formatter;
  }

  showZoom() {
    if (this._.dataBefore.x_axis.length <= 31) return;
    this.options.grid.bottom = 110;
    this.options.legend[0].bottom = 40;
    this.options.legend[1].bottom = 60;
    this.options.dataZoom = [
      {
        type: "slider",
        handleSize: "80%",
        brushSelect: false,
        minValueSpan: 25,
        maxValueSpan: 25,
        start: this._.start,
        end: this._.end
      },
      {
        type: "inside",
        orient: "horizontal",
        throttle: 50,
        filterMode: "empty"
      },
      {
        type: "slider",
        show: false,
        yAxisIndex: 0,
        filterMode: "empty",
        showDataShadow: false
      }
    ];
  }

  getGradient(arg, color) {
    return {
      type: "linear",
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        {
          offset: 0,
          color: color[arg][0]
        },
        {
          offset: 0.5,
          color: color[arg][1]
        },
        {
          offset: 1,
          color: color[arg][0]
        }
      ],
      globalCoord: false
    };
  }

  prepareChartData(x, index, useAltColor = false) {
    let obj = {
      data: x.data,
      name: x.name
    };
    if (this._.type === "line") {
      obj.type = "line";
      obj.sampling = "lttb";
      obj.color = useAltColor
        ? this.altColors[index][1]
        : this.colors[index][1];
      obj.showSymbol = true;
      obj.symbolSize = 6;
      obj.symbol = (a, b) => {
        let start = b.dataIndex - 1 < 0 ? "-" : x.data[b.dataIndex - 1].val;
        let end =
          b.dataIndex + 1 >= x.data.length ? "-" : x.data[b.dataIndex + 1].val;
        return start === "-" && end === "-" ? "circle" : "none";
      };
      obj.lineStyle = {
        width: useAltColor ? 2 : 3
      };
    } else {
      obj.type = "bar";
      obj.color = useAltColor
        ? this.getGradient(index, this.altColors)
        : this.getGradient(index, this.colors);
      obj.showSymbol = false;
      obj.symbol = "none";
    }
    if (useAltColor) obj.itemStyle = { borderColor: "transparent" };
    obj.smooth = true;
    obj.connectNulls = false;
    return obj;
  }

  legendTitleFormatter(arg) {
    if (this._.isDailyChart) {
      let monthStart = arg.dateStart.toLocaleString(this._.$store.state.lang, {
        month: "long"
      });
      monthStart = monthStart.charAt(0).toUpperCase() + monthStart.slice(1);
      let monthEnd = arg.dateEnd.toLocaleString(this._.$store.state.lang, {
        month: "long"
      });
      monthEnd = monthEnd.charAt(0).toUpperCase() + monthEnd.slice(1);
      return [
        [
          {
            name: `{a|${monthStart} ${arg.dateStart.getFullYear()}:}`,
            trueName: `${monthStart} ${arg.dateStart.getFullYear()}:`,
            textStyle: {
              overflow: "truncate",
              rich: {
                a: {
                  //fontSize: 10,
                  align: "right",
                  padding: 0,
                  width: 90
                }
              }
            },
            itemStyle: {
              opacity: 0
            },
            type: "line"
          }
        ],
        [
          {
            name: `{a|${monthEnd} ${arg.dateEnd.getFullYear()}:}`,
            trueName: `${monthEnd} ${arg.dateEnd.getFullYear()}:`,
            textStyle: {
              overflow: "truncate",
              rich: {
                a: {
                  align: "right",
                  padding: 0,
                  width: 90
                }
              }
            },
            itemStyle: {
              opacity: 0
            },
            type: "line"
          }
        ]
      ];
    } else {
      return [
        [
          {
            name: `${arg.dateStart.getFullYear()}:`,
            trueName: `${arg.dateStart.getFullYear()}:`,
            itemStyle: {
              opacity: 0
            },
            type: "line"
          }
        ],
        [
          {
            name: `${arg.dateEnd.getFullYear()}:`,
            trueName: `${arg.dateEnd.getFullYear()}:`,
            itemStyle: {
              opacity: 0
            },
            type: "line"
          }
        ]
      ];
    }
  }

  getChartTypeData() {
    this.options.xAxis.data = this._.dataBefore.x_axis;
    let data = [];
    let legendObj = {
      dataStart: this._.dataBefore.options,
      dataEnd: this._.dataAfter.options,
      dateStart: new Date(this._.dataBefore.x_axis[0]),
      dateEnd: new Date(this._.dataAfter.x_axis[0]),
      addData: [{}, {}]
    };
    if (legendObj.dateStart > legendObj.dateEnd) {
      legendObj.dataStart = this._.dataAfter.options;
      legendObj.dataEnd = this._.dataBefore.options;
      legendObj.dateStart = new Date(this._.dataAfter.x_axis[0]);
      legendObj.dateEnd = new Date(this._.dataBefore.x_axis[0]);
    }
    let legendData = this.legendTitleFormatter(legendObj);
    legendObj.addData[0] = legendData[0][0];
    legendObj.addData[1] = legendData[1][0];
    legendObj.dataStart.forEach((x, index) => {
      let obj = this.prepareChartData(x, index, true);
      if (obj.name) {
        obj.name = this._.$t(obj.name);
        legendData[0].push({
          name: obj.name,
          itemStyle: {
            color: this.altColors[index][1]
          }
        });
      }
      obj.data = obj.data.map(y => (y.val = y.cut || y.err ? "-" : y.val));
      data.push(obj);
    });
    legendObj.dataEnd.forEach((x, index) => {
      let obj = this.prepareChartData(x, index);
      if (obj.name) {
        obj.name = this._.$t(obj.name);
        legendData[1].push({
          name: obj.name,
          itemStyle: {
            color: this.colors[index][1]
          }
        });
      }
      obj.data = obj.data.map(y => (y.val = y.cut || y.err ? "-" : y.val));
      data.push(obj);
    });
    this.options.legend[0].data = legendData[0];
    this.options.legend[1].data = legendData[1];
    this.options.series = [...legendObj.addData, ...data];
    this.legendObj = legendObj;
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

  formatCompareValue(arg, _) {
    arg = parseFloat(arg.toFixed(2));
    if (arg === 0) return arg;
    arg =
      arg < 0
        ? `<span class="${_.$style.valueGreen}">↑ ${Math.abs(arg)}</span>`
        : `<span class="${_.$style.valueRed}">↓ ${Math.abs(arg)}</span>`;
    return arg;
  }

  fixColor(arg) {
    const arr = /rgba?\((\d+), (\d+), (\d+)/.exec(arg);
    return arr ? `rgb(${arr[1]}, ${arr[2]}, ${arr[3]})` : arg;
  }

  tooltipFormatter(arg, _) {
    this.parent.style.zIndex = 1;
    let obj = {};
    let summs = [0, 0];
    let dayBefore = "";
    let dayAfter = "";
    if (_.isDailyChart) {
      const before = this.legendObj.dateStart
        .toISOString()
        .split("T")[0]
        .split("-");
      const after = this.legendObj.dateEnd
        .toISOString()
        .split("T")[0]
        .split("-");
      dayBefore = new Date(
        `${before[0]}-${before[1]}-${arg[0].axisValue.split("-")[2]}`
      ).getDate();
      dayAfter = new Date(
        `${after[0]}-${after[1]}-${arg[0].axisValue.split("-")[2]}`
      ).getDate();
      dayBefore = isNaN(dayBefore) ? "-" : _.$pad(dayBefore);
      dayAfter = isNaN(dayAfter) ? "-" : _.$pad(dayAfter);
    }
    let month = new Date(arg[0].axisValue).toLocaleString(_.$store.state.lang, {
      month: "long"
    });
    month = _.isDailyChart
      ? ""
      : month.charAt(0).toUpperCase() + month.slice(1);
    arg.forEach(x => {
      if (!obj[x.seriesName])
        obj[x.seriesName] = {
          color: "",
          name: "",
          valueStart: null,
          valueEnd: null
        };
      let color =
        typeof x.color === "object" ? x.color.colorStops[1].color : x.color;
      obj[x.seriesName].color = this.fixColor(color);
      obj[x.seriesName].name = x.seriesName;
      !x.borderColor
        ? (obj[x.seriesName].valueEnd = x.value)
        : (obj[x.seriesName].valueStart = x.value);
    });
    let str = "";
    const nulls = [[], []];
    for (let i in obj) {
      let start = !isNaN(obj[i].valueStart) ? obj[i].valueStart : 0;
      let end = !isNaN(obj[i].valueEnd) ? obj[i].valueEnd : 0;
      nulls[0].push(start);
      nulls[1].push(end);
      summs[0] += start;
      summs[1] += end;
      let result = this.formatCompareValue(start - end, _);
      let marker = `<span class="${_.$style.marker}" style="background-color:${obj[i].color}!important;"></span>`;
      str += `<tr><td>${marker}${obj[i].name}:</td><td>${
        obj[i].valueStart === null ? "-" : obj[i].valueStart
      }</td><td>${
        obj[i].valueEnd === null ? "-" : obj[i].valueEnd
      }</td><td>${result}</td></tr>`;
    }
    let isStart = nulls[0].some(x => x !== null);
    let isEnd = nulls[1].some(x => x !== null);
    const titleStart = isStart
      ? `${dayBefore}${month} ${_.chartInstance.options.legend[0].data[0].trueName.replace(
          ":",
          ""
        )}`
      : "-";
    const titleEnd = isEnd
      ? `${dayAfter}${month} ${_.chartInstance.options.legend[1].data[0].trueName.replace(
          ":",
          ""
        )}`
      : "-";
    let header = `<table class="compareTooltipTable"><tr><td></td><td>${titleStart}</td><td>${titleEnd}</td><td></td></tr>`;
    str += `<tr><td>${_.$t("chartTooltipTotal")}:</td><td>${parseFloat(
      summs[0].toFixed(2)
    )}</td><td>${parseFloat(
      summs[1].toFixed(2)
    )}</td><td>${this.formatCompareValue(summs[0] - summs[1], _)}</td></tr>`;
    str += "</table>";
    return header + str;
  }

  init() {
    this.options && this._.chart.setOption(this.options);
    this._.chart
      .getZr()
      .on("mouseout", () => this.parent.style.removeProperty("z-index"));
    this._.chart.on("legendselectchanged", params => {
      alert();
      if (!params.name.includes(":")) return;
      this._.chart.dispatchAction({
        type: "legendSelect",
        name: params.name
      });
    });
    this._.chart.on("legendscroll", params => {
      if (!this.activeLegendId) this.activeLegendId = params.legendId;
      if (params.legendId === "1") {
        this._.chart.dispatchAction({
          type: "legendScroll",
          scrollDataIndex: params.scrollDataIndex,
          legendId: "2"
        });
      } else if (this.activeLegendId === "2") {
        let scrollDataIndex = this._.chart.getOption("legend").legend[0]
          .scrollDataIndex;
        if (params.scrollDataIndex != scrollDataIndex) {
          this._.chart.dispatchAction({
            type: "legendScroll",
            scrollDataIndex: scrollDataIndex,
            legendId: "2"
          });
        }
        this.activeLegendId = null;
      }
      if (this.activeLegendId === "1" && params.legendId === "2")
        this.activeLegendId = null;
    });
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
    this.updateTheme("light");
    const png = this._.$refs.chart.querySelector("canvas").toDataURL();
    this.updateTheme();
    return png;
  }
}

Vue.prototype.$initCompareChart = _ => {
  return new __Chart({ _ });
};

export default {};
