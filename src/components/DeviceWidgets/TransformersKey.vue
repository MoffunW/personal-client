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
      <template slot="content">
        <!-- Content -->
        <div
          :class="$style.contentWrap"
          v-if="
            data && data.cur && data.cur.length && data.pot && data.pot.length
          "
        >
          <div :class="$style.content">
            <v-tabs
              class="tabsWrap"
              v-model="tab"
              align-with-title
              show-arrows
              :centered="false"
            >
              <v-tab v-for="item in items" :key="item.name">
                {{ item.name }}
              </v-tab>
            </v-tabs>

            <v-tabs-items class="tabsItems" v-model="tab" touchless>
              <v-tab-item
                :class="$style.item"
                v-for="item in items"
                :key="item.name"
              >
                <component
                  v-bind:is="item.component"
                  :index="tab"
                  :data="data"
                />
              </v-tab-item>
            </v-tabs-items>
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
    numberInput: () => import("@/components/MirtNumberInput"),
    CurrencyTransformers: () =>
      import(
        "@/components/DeviceWidgets/TransformersTables/CurrencyTransformers"
      ),
    VoltageTransformers: () =>
      import(
        "@/components/DeviceWidgets/TransformersTables/VoltageTransformers"
      )
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
          : this.params.minHeight
      },
      origWidgetParams: {},
      data: null,
      tab: null,
      items: [
        {
          name: this.$t("trans__CurrencyTransformers"),
          component: "CurrencyTransformers"
        },
        {
          name: this.$t("trans__VoltageTransformers"),
          component: "VoltageTransformers"
        }
      ],
      loading: false,
      fail: null,
      showEditOverlay: false
    };
  },
  methods: {
    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get(
          `Chart/GetMeasuringTransformers?DeviceID=${this.device.id}`
        );
        this.data = data;
      } catch (e) {
        this.fail = "err_no_data";
        return;
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
.contentWrap {
  height: 100%;
  position: relative;
}

.content {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
}

.content > *:first-child {
  flex: 0;
}

.content > *:last-child {
  flex: 1;
}

.content > *:last-child > *,
.content > *:last-child > * > * {
  height: 100%;
}
</style>
