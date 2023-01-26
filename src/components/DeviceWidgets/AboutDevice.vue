<template>
  <div>
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
        <div :class="$style.contentWrap">
          <h4 v-text="data.modelVersion"></h4>
          <div :class="$style.imgWrap">
            <img
              :src="`data:image/png;base64,${data.img}`"
              :alt="data.modelVersion"
            />
          </div>
          <div>
            <v-slide-group
              v-if="Object.keys(toolTips).length"
              v-click-outside="handleTooltipAction"
              :class="$style.carousel"
              show-arrows
            >
              <v-slide-item v-for="(item, index) in seals" :key="item.type">
                <div>
                  <div
                    :class="`icons ${item.img} ${$style.seal}`"
                    @click="handleTooltipAction(index)"
                    @mouseover="handleTooltipAction(index)"
                    @mouseleave="handleTooltipAction"
                  ></div>
                  <v-tooltip v-model="toolTips[index]" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on"></span>
                    </template>
                    <span v-html="getTooltipContent(item)"></span>
                  </v-tooltip>
                </div>
              </v-slide-item>
            </v-slide-group>
          </div>
          <div :class="$style.tableWrap">
            <div class="tableWrap">
              <div :class="$style.table">
                <div><div v-text="$t('Chart_SerialNumber')"></div></div>
                <div><div v-text="data.serialNumber"></div></div>
              </div>
              <div :class="$style.table">
                <div><div v-text="$t('Chart_DateCreate')"></div></div>
                <div><div v-text="data.manufacturedDate"></div></div>
              </div>
              <div :class="$style.table">
                <div><div v-text="$t('Chart_Manufacturer')"></div></div>
                <div><div v-text="data.manufacturer"></div></div>
              </div>
              <div :class="$style.table">
                <div><div v-text="$t('Chart_DeviceID')"></div></div>
                <div>
                  <div v-text="data.mRID"></div>
                </div>
              </div>
              <div :class="$style.table">
                <div><div v-text="$t('trans__DivergenceTime')"></div></div>
                <div>
                  <div v-text="data.divergenceTime"></div>
                </div>
              </div>
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
        name: this.params.settings.name ? this.params.settings.name : null
      },
      origWidgetParams: {},
      data: null,
      seals: [],
      toolTips: {},
      loading: false,
      fail: null,
      showEditOverlay: false
    };
  },
  methods: {
    handleTooltipAction(arg = null) {
      for (let i in this.toolTips) this.toolTips[i] = false;
      if (arg || arg === 0) this.toolTips[arg] = true;
    },

    getTooltipContent(arg) {
      return `<div style="text-align: center">${arg.name}<br />${this.$t(
        arg.action
      )}<br />${arg.dateAction}</div>`;
    },

    async getData() {
      this.loading = true;
      try {
        let { data } = await axios.get("Chart/AboutDevice", {
          params: {
            DeviceID: this.device.id
          }
        });
        if (Object.values(data).every(x => x === null)) {
          this.fail = "err_no_data";
          return;
        }
        for (let i = 0; i < data.seals.length; i++)
          this.$set(this.toolTips, i, false);
        this.seals = data.seals;
        this.data = data;
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
  mounted() {
    if (!this.auth) return;
    this.getData();
  }
};
</script>

<style module>
.root {
  overflow: auto;
}

.contentWrap {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.imgWrap {
  margin: 10px 0;
}

.imgWrap > * {
  display: block;
  height: 154px;
  margin: 0 auto;
  object-fit: contain;
}

.carousel {
  margin: 0 0 20px;
}

.seal {
  margin: 0 10px;
  height: 24px;
  width: 24px;
}

.tableWrap {
  flex: 1;
  position: relative;
}

.tableWrap > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.table {
  display: flex;
  align-items: center;
}

.table > * > * {
  padding: 10px;
}

.table > * {
  flex: 1;
}

.table > *:first-child {
  max-width: 40%;
}

.table > *:last-child {
  max-width: 60%;
}

.table > *:last-child {
  white-space: normal;
  hyphens: auto;
  word-wrap: break-word;
  text-align: right;
}
</style>
