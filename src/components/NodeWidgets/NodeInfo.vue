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
        <div :class="$style.contentWrap">
          <div :class="$style.wrapper">
            <table>
              <thead>
                <tr class="mirtTableHead">
                  <th v-text="$t('trans__nodeParam')"></th>
                  <th v-text="$t('trans__nodeValue')"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in Object.keys(data)" :key="item">
                  <td>
                    <v-tooltip :open-on-click="true" bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                          @click="handleClick(on, $event)"
                          :class="$style.longText"
                          v-text="item"
                        ></span>
                      </template>
                      <span :class="$style.tooTipContent" v-text="item"></span>
                    </v-tooltip>
                  </td>
                  <td>
                    <v-tooltip :open-on-click="true" bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <span
                          v-bind="attrs"
                          v-on="on"
                          @click="handleClick(on, $event)"
                          :class="$style.longText"
                          v-text="data[item]"
                        ></span>
                      </template>
                      <span
                        :class="$style.tooTipContent"
                        v-text="data[item]"
                      ></span>
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
            </table>
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
    "device.id": {
      handler() {
        if (this.device.isFolder && !this.loading) this.getData();
      },
      immediate: true
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
      data: {},
      loading: false,
      fail: null
    };
  },
  methods: {
    removeAllTooltips() {
      const obj = document.querySelectorAll(`.${this.$style.tooTipContent}`);
      if (obj.length > 0)
        for (let i = 0; i < obj.length; i++) obj[i].parentNode.remove();
    },

    async handleClick({ mouseenter }, e) {
      if (e.type === "click") {
        this.removeAllTooltips();
        await this.$nextTick();
        setTimeout(() => mouseenter(e), 250);
      }
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get(`Chart/NodeInfo?ID=${this.device.id}`);
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
  }
};
</script>

<style module>
.root {
  overflow: auto;
}

.contentWrap {
  position: relative;
  height: 100%;
}

.wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.root table {
  width: 99.9%;
  border-spacing: 1px;
}

.root th {
  z-index: 2;
}

.root th,
.root td {
  position: relative;
  height: 39px;
  outline: 1px solid #cecece;
  white-space: nowrap;
  padding: 5px 15px;
}

.root thead tr:first-child th {
  position: sticky;
  top: 1px;
}

.longText {
  display: inline-block;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 0;
  margin-top: -7px;
  max-width: 100%;
  padding-left: 15px;
  padding-right: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooTipContent {
  display: block;
}
</style>
