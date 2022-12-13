<template>
  <div :class="$style.root">
    <widget-wrapper
      v-model="widgetParams"
      :params="params"
      :loading="loading"
      :fail="fail"
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
      <template slot="content" v-if="data">
        <!-- Content -->
        <div :class="$style.content">
          <div>
            <div v-text="fixDate(data.date)">Date</div>
            <div>
              <span v-text="$t('widgetChartView')"></span
              ><v-switch v-model="widgetParams.showChart" />
            </div>
          </div>
          <div>
            <div v-if="showTable" :class="$style.tableWrap">
              <div>
                <table v-if="tableData && Object.keys(tableData).length">
                  <thead v-if="data.numberOfPhases === 3">
                    <tr class="mirtTableHead">
                      <th></th>
                      <th v-text="$t('trans__PhaseA')"></th>
                      <th v-text="$t('trans__PhaseB')"></th>
                      <th v-text="$t('trans__PhaseC')"></th>
                      <th v-text="$t('trans__3PhLine')"></th>
                    </tr>
                  </thead>
                  <tbody v-if="data.numberOfPhases === 3">
                    <tr
                      class="mirtTableRow"
                      v-for="key in Object.keys(tableData)"
                      :key="key"
                    >
                      <template v-if="tableData[key].values.length === 3">
                        <td v-text="getRowTitle(key)"></td>
                        <td v-text="tableData[key].values[0]"></td>
                        <td v-text="tableData[key].values[1]"></td>
                        <td v-text="tableData[key].values[2]"></td>
                        <td></td>
                      </template>
                      <template v-else>
                        <td v-text="getRowTitle(key)"></td>
                        <td colspan="3"></td>
                        <td v-text="tableData[key].values[0]"></td>
                      </template>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr
                      class="mirtTableRow"
                      v-for="key in Object.keys(tableData)"
                      :key="key"
                    >
                      <td v-text="getRowTitle(key)"></td>
                      <td v-text="tableData[key].values[0]"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="widgetParams.showChart" :class="$style.chartWrap">
              <mirt-vector-diagram
                v-if="data.values"
                :data="data"
                :date="fixDate(data.date)"
              />
            </div>
          </div>
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
    MirtVectorDiagram: () => import("@/components/Charts/MirtVectorDiagram")
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
    showTable() {
      if (!this.minWidthReached) return !this.minWidthReached;
      return !this.widgetParams.showChart;
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
        showChart: true
      },
      origWidgetParams: {},
      data: {
        numberOfPhases: 3
      },
      tableData: null,
      observer: null,
      minWidthReached: false,
      loading: false,
      fail: null
    };
  },
  methods: {
    fixDate(arg) {
      if (!arg) return;
      const _ = arg.split("T");
      _[0] = _[0] ? _[0] : null;
      return _[1] ? `${_[0]} ${_[1].split(".")[0]}` : _[0];
    },

    getRowTitle(arg) {
      const _ = this.tableData[arg];
      return _.units
        ? `${this.$t(`trans__${arg}`)}, ${this.$t(_.units)}`
        : this.$t(`trans__${arg}`);
    },

    handleResize() {
      const _ = document.querySelector(`.${this.$style.root}`);
      if (!_) return;
      this.minWidthReached = _.clientWidth <= 890;
    },

    async getData() {
      this.loading = true;
      try {
        let { data } = await axios.get("Chart/InstantValues", {
          params: {
            DeviceID: this.device.id
          }
        });
        if (!data.date) throw "err_no_data";
        this.data = data;
        const obj = {};
        Object.keys(data.values).forEach(x => {
          if (!data.values[x].values.every(y => y === null))
            obj[x] = data.values[x];
        });
        this.tableData = obj;
      } catch (e) {
        console.log(e);
        this.fail = e === "err_no_data" ? e : "err_bad_request_api";
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.widgetParams = this.$getWidgetParams(this);
    this.origWidgetParams = JSON.parse(JSON.stringify(this.widgetParams));
  },
  mounted() {
    if (!this.auth) return;
    this.observer = new ResizeObserver(this.handleResize).observe(this.$el);
    this.getData();
  },
  beforeDestroy() {
    if (this.observer) this.observer.unobserve(this.$el);
  }
};
</script>

<style module>
.root {
  display: block;
}

.content {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.content > div {
  display: flex;
  justify-content: space-between;
}

.content > div:first-child {
  align-items: center;
}

.content > div:first-child > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.content > div:first-child > div > *:first-child {
  margin-right: 10px;
}

.content > div:last-child {
  flex: 1;
  align-items: flex-start;
  justify-content: center;
}

.tableWrap {
  flex: 1;
  height: 100%;
  position: relative;
}

.tableWrap > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.tableWrap table {
  width: 100%;
  border-spacing: 1px;
  text-align: center;
}

.tableWrap th,
.tableWrap td {
  outline: 1px solid #cecece;
  white-space: nowrap;
  padding: 5px 15px;
}

.tableWrap td:first-child {
  text-align: left;
}

.tableWrap th {
  position: sticky;
  top: 1px;
}

.chartWrap {
  margin-left: 20px;
}
</style>
