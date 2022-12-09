<template>
  <div class="widget">
    <div>
      <div>
        <div v-text="name"></div>
        <div v-text="device.text"></div>
      </div>
      <template v-if="$store.state.editMode">
        <v-icon v-if="!showEditOverlay" @click="showEditOverlay = true">
          mdi-cog-outline
        </v-icon>
        <v-icon v-else @click="handleCancel">
          mdi-arrow-left
        </v-icon>
      </template>
    </div>
    <div :class="$style.editContent" v-if="showEditOverlay">
      <div>
        <slot name="settings"></slot>
        <div>
          <v-btn class="deleteBtn" depressed tile @click="handleDelete"
            ><v-icon>
              mdi-trash-can-outline
            </v-icon>
          </v-btn>
          <v-btn class="primaryBtn" depressed tile @click="handleSave">
            {{ $t("widgetOptionsSubmit") }}
          </v-btn>
        </div>
      </div>
    </div>
    <div :class="$style.content" v-else>
      <div :class="$style.settingsWrap" v-if="useOptions" ref="settings">
        <div class="innerComponents settings">
          <slot name="options"></slot>
        </div>
      </div>
      <div
        :class="
          fail ? [$style.contentWrap, $style.failMsg] : $style.contentWrap
        "
      >
        <span v-if="fail" v-text="$t(fail)"></span>
        <v-overlay v-else-if="loading"
          ><v-progress-circular indeterminate
        /></v-overlay>
        <slot v-if="!fail" name="content"></slot>

        <!--div :class="$style.result" v-if="loading || fail">
          <span v-if="fail" v-text="$t(fail)"></span>

          <v-overlay v-else><v-progress-circular indeterminate/></v-overlay>
        </div>
        <slot v-else name="content"></slot-->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    value: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: false
    },
    fail: {
      type: String,
      default: ""
    },
    useOptions: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    device() {
      return this.$store.state.selectedTreeNode;
    },
    name() {
      return this.value.name ? this.value.name : this.$t(this.params.name);
    }
  },
  watch: {
    "$store.state.editMode": {
      handler(arg) {
        if (!arg) this.showEditOverlay = false;
      }
    }
  },
  data() {
    return {
      showEditOverlay: false,
      tmpParams: {}
    };
  },
  methods: {
    handleCancel() {
      this.showEditOverlay = false;
      this.$emit("cancel", false);
    },

    handleSave() {
      this.showEditOverlay = false;
      const isSizeChanged =
        this.tmpParams.width != this.value.width ||
        this.tmpParams.height != this.value.height;
      this.$emit("save", isSizeChanged);
    },

    handleDelete() {
      this.showEditOverlay = false;
      this.$emit("delete", false);
    }
  },
  async mounted() {
    this.tmpParams = JSON.parse(JSON.stringify(this.value));
    if (this.useOptions) {
      await this.$nextTick();
      this.$setSettingsScroll(this.$refs.settings);
    }
  }
};
</script>

<style module>
.content > div:last-child {
  flex: 1;
}

.resultWrap {
  display: flex;
}

.result {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.editContent {
  display: block;
  overflow-y: auto;
}

.editContent > * {
  margin: 0 auto;
  width: 100%;
  max-width: 350px;
}

.editContent > * > * + * {
  margin-top: 20px;
}

.editContent > * > *:last-child {
  display: flex;
  margin: 30px auto 0;
  width: 100%;
  max-width: 286px;
  justify-content: space-between;
}

.settingsWrap {
  padding-right: 10px;
  overflow: auto;
}

.settingsWrap > * {
  min-width: 100%;
  justify-content: flex-end;
}

.contentWrap {
  position: relative;
}

.failMsg {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
