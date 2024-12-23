<template>
  <div :class="$style.root">
    <welcome v-if="$store.state.showWelcome" />
    <v-dialog
      transition="dialog-top-transition"
      max-width="500"
      v-model="showModal"
      @click:outside="handleModalClose"
    >
      <v-card>
        <v-card-title class="text-h5" v-text="$t('err_some_error')" />
        <v-card-text v-text="$t('trans__ErrorGridGUIDSText')" />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="primaryBtn" depressed tile @click="handleModalClose">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div
      class="treeWrap"
      :class="showTree ? [$style.tree, $style.treeActive] : $style.tree"
    >
      <SidebarHeader />
      <virtual-tree
        ref="tree"
        width="250"
        :renderItem="renderItem"
        @change="handleChange"
        @clear="handleClear"
        @restored="getTypes"
      />
    </div>
    <div :class="$style.widgetsWrapper">
      <div
        :class="
          `${
            hideBadge
              ? `badge ${$style.badge} ${$style.hideBadge}`
              : `badge ${$style.badge}`
          }`
        "
        @click="showTree = !showTree"
      >
        <span v-text="$t('trans_showHideTree')"></span
        ><v-icon> mdi-file-tree </v-icon>
      </div>
      <div ref="container">
        <v-overlay v-if="loading" :class="$style.overlay">
          <v-progress-circular indeterminate size="64" />
        </v-overlay>
        <div v-else class="gridWrap">
          <div
            v-if="$store.state.editMode"
            class="adjustmentsWrap"
            :class="
              `${
                hideBadge
                  ? 'adjustmentsWrap'
                  : `adjustmentsWrap ${$style.adjustmentsWrap}`
              }`
            "
          >
            <v-select
              :class="$style.widgetSelect"
              v-model="selectedWidget"
              item-text="trueName"
              item-value="id"
              :items="widgetsList"
              :label="$t('addWidget')"
              :loading="addingWidget"
              :disabled="addingWidget"
              @change="handleAddWidget"
            />
            <div v-if="canDrag">
              <v-switch v-model="edit" prepend-icon="mdi-pencil-outline" />
              <v-slider
                v-model="scale"
                prepend-icon="mdi-fullscreen-exit"
                max="1"
                min="0.5"
                step="0.01"
                :disabled="!edit"
              />
            </div>
          </div>
          <grid-layout
            v-if="layout && layout.length"
            ref="grid"
            :class="$style.gridWrap"
            :style="
              `transform: scale(${scale}); -webkit-transform: scale(${scale});`
            "
            :layout.sync="layout"
            :col-num="3"
            :row-height="rowHeight"
            :cols="breakPoints"
            :is-resizable="false"
            :is-draggable="edit"
            :responsive="!edit"
            :vertical-compact="false"
            :use-css-transforms="true"
            :transformScale="scale"
            :key="gridKey"
          >
            <grid-item
              :class="$style.gridItem"
              v-for="item in layout"
              :ref="`item-${item.id}`"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :key="item.i"
              @moved="arg => handleGridChanged(arg, false)"
            >
              <div v-if="edit" :class="$style.contentOverlay">
                <v-icon :style="`transform: scale(${scale}); zoom: ${scale};`">
                  mdi-cursor-move
                </v-icon>
              </div>
              <div :class="$style.contentWrap">
                <component
                  v-bind:is="item.widgetParams ? item.widgetParams.name : ''"
                  :params="item.widgetParams ? item.widgetParams : {}"
                  @change="
                    arg => {
                      handleWidgetChange(arg, item.i);
                    }
                  "
                  @delete="handleDelete(item)"
                />
              </div>
            </grid-item>
          </grid-layout>
          <div v-else-if="showNoData" :class="`noDataCanvas ${$style.noData}`">
            <div v-text="$t('widgetsEmptyNotificationNote')"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueGridLayout from "vue-grid-layout";

export default {
  components: {
    Welcome: () => import("@/components/Welcome/Welcome"),
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    VirtualTree: () => import("@/components/VirtualTree"),
    /* DeviceWidgets */
    SidebarHeader: () => import("@/components/Sidebar/SidebarHeader"),
    AboutDevice: () => import("@/components/DeviceWidgets/AboutDevice"),
    CurrentReadingsDay: () =>
      import("@/components/DeviceWidgets/CurrentReadingsDay"),
    CurrentReadingsMonth: () =>
      import("@/components/DeviceWidgets/CurrentReadingsMonth"),
    CurrentReadings: () => import("@/components/DeviceWidgets/CurrentReadings"),
    DiffCurrentReadingsMonth: () =>
      import("@/components/DeviceWidgets/DiffCurrentReadingsMonth"),
    DiffCurrentReadingsDay: () =>
      import("@/components/DeviceWidgets/DiffCurrentReadingsDay"),
    LimitConsumption: () =>
      import("@/components/DeviceWidgets/LimitConsumption"),
    ConsumptionSchedule: () =>
      import("@/components/DeviceWidgets/ConsumptionSchedule"),
    CalendarChart: () => import("@/components/DeviceWidgets/CalendarChart"),
    InstantValues: () => import("@/components/DeviceWidgets/InstantValues"),
    EventLog: () => import("@/components/DeviceWidgets/EventLog"),
    TransformersKey: () => import("@/components/DeviceWidgets/TransformersKey"),
    /* NodeWidgets */
    Report: () => import("@/components/NodeWidgets/Report"),
    NodeInfo: () => import("@/components/NodeWidgets/NodeInfo")
  },
  data() {
    return {
      widgetsList: [],
      selectedWidget: null,
      showTree: false,
      containerWidth: 0,
      observer: null,
      data: [],
      defaultImage: require("@/assets/defaultTreeImg.png"),
      rowHeight: 490,
      scale: 1,
      stateGUID: null,
      oldGUID: null,
      breakPoints: { lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 },
      gridKey: 0,
      layout: [],
      screenShots: {},
      edit: false,
      oldScroll: 0,
      hideBadge: false,
      addingWidget: false,
      loading: false,
      showModal: false,
      lyi: { old: [], new: [] },
      showNoData: false
    };
  },
  computed: {
    canDrag() {
      return this.containerWidth > 1200;
    }
  },
  watch: {
    edit: {
      async handler(arg) {
        if (!arg) {
          this.scale = 1;
          this.getGrid();
        }
      },
      immediate: true
    },
    "$store.state.editMode": {
      handler(arg) {
        if (!arg) this.edit = false;
      },
      immediate: true
    },
    canDrag: {
      async handler(arg) {
        if (!arg) this.edit = false;
      },
      immediate: true
    }
  },
  methods: {
    renderItem(arg) {
      let img = this.$store.state.devicesImgs[arg.type]
        ? this.$store.state.devicesImgs[arg.type]
        : this.defaultImage;

      const el = document.createElement("div");

      el.setAttribute("data-index", arg.id);
      el.setAttribute("title", arg.text);
      el.classList.add("treeItem");

      if (!arg.hasChilds) el.classList.add("withoutChild");

      if (arg.id === "empty_unique_id") {
        el.classList.add("emptyMessage");
        el.innerHTML += `<div class="treeText">${arg.text}</div>`;
        return el;
      }
      if (arg.selected) el.classList.add("treeSelected");
      if (arg.expanded) el.classList.add("treeExpanded");
      if (arg.level) {
        el.innerHTML += `<div class="treeMarker">`;
        for (let i of arg.lastParents) {
          el.innerHTML += i
            ? `<div class="treeLink treeLinkEmpty"></div>`
            : `<div class="treeLink treeLinkInner"></div>`;
        }
        el.innerHTML += arg.lastChild
          ? `<div class="treeLink treeLastChild"></div>`
          : `<div class="treeLink"></div>`;
        el.innerHTML += `</div>`;
      }

      if (arg.hasChilds)
        el.innerHTML += `<div class="treeExpand">
    <div></div>
  </div>`;

      el.innerHTML += `<img src="${img}" />
      <div class="treeText">${arg.text}</div>`;

      return el;
    },

    getContainerWidth() {
      let container = this.$refs.container;
      if (!container) {
        this.containerWidth = 0;
        return;
      }
      this.containerWidth = container.offsetWidth;
    },

    resize(arg) {
      const grid = this.$refs["grid"];
      const item = this.$refs[`item-${arg.id}`][0];
      const params = { ...arg };
      const width = params.widgetParams.settings.width
        ? params.widgetParams.settings.width
        : arg.w;
      const height = params.widgetParams.settings.height
        ? params.widgetParams.settings.height
        : arg.h;
      item.innerH = height;
      params.h = height;
      params.w = width;
      grid.resizeEvent(
        "resizeend",
        arg.i,
        params.x,
        params.y,
        params.h,
        params.w
      );
    },

    setGUID(arg) {
      this.stateGUID = arg;
      if (!this.oldGUID) {
        this.oldGUID = arg;
        return;
      }
      if (this.oldGUID != this.stateGUID) {
        this.showModal = true;
      }
    },

    handleModalClose() {
      this.showModal = false;
      this.getGrid();
    },

    async getGrid(arg = true) {
      this.showNoData = false;
      try {
        const q =
          this.$store.state.selectedTreeNode.isFolder ||
          this.$store.state.selectedTreeNode.isFolder === false
            ? `&isFolder=${this.$store.state.selectedTreeNode.isFolder}`
            : "";
        const { data } = await axios.get(
          `Device/GetUserWidgets?nodeId=${this.$store.state.selectedTreeNode.id}${q}`
        );
        this.setGUID(data.stateGUID);
        const arr = [];
        data.widgets.forEach((x, index) => {
          let obj = JSON.parse(x.widgetParams);
          obj.id = x.id;
          obj.i = index;
          obj.fail = false;
          arr.push(obj);
        });
        this.layout = arr;
        if (this.$refs.grid) await this.$nextTick();
        if (arg) {
          this.gridKey = Date.now();
          this.processScroll(true);
          this.processScroll();
          if (arg === "add") {
            const _ = document.querySelector(`.gridWrap`);
            if (_) _.scrollTop = _.scrollHeight;
          }
        }
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.showNoData = true;
      }
    },

    getItemProps(arg) {
      const cols = 3;
      let _ = {
        x: 0,
        y: 0
      };
      let maxH = [];
      if (this.layout.length) {
        let [...arr] = this.layout;
        let tmp = [];
        while (arr.length) tmp.push(arr.splice(0, cols));
        tmp
          .slice(-1)
          .pop()
          .forEach(x => {
            _.x = (x.x + x.w) % cols;
            _.y = x.y;
            maxH.push(x.h);
          });
      }
      if (_.x + arg.minWidth > cols) {
        _.x = 0;
        _.y = _.y + Math.max(...maxH);
      }
      return _;
    },

    async handleAddWidget(arg) {
      this.addingWidget = true;
      const obj = this.widgetsList.find(x => x.id === arg);
      if (!obj) return;
      const _ = this.getItemProps(obj);
      let el = {
        id: null,
        widgetParams: {
          type: obj.id,
          name: obj.name,
          maxHeight: obj.maxHeight,
          maxWidth: obj.maxWidth,
          minHeight: obj.minHeight,
          minWidth: obj.minWidth,
          settings: {}
        },
        x: _.x,
        y: _.y,
        w: obj.minWidth,
        h: obj.minHeight,
        i: this.layout.length,
        preserveAspectRatio: true
      };
      try {
        this.loading = true;
        const { data } = await axios.post("Device/EditUserWidget", {
          Id: null,
          WidgetType: el.widgetParams.type,
          NodeID: this.$store.state.selectedTreeNode.id,
          WidgetParams: JSON.stringify(el),
          StateGUID: this.stateGUID
        });
        this.setGUID(data.stateGUID);
        this.getGrid("add");
        this.selectedWidget = null;
      } catch (e) {
        return;
      } finally {
        this.loading = false;
        this.addingWidget = false;
      }
    },

    async handleGridChanged(arg, updateGrid = false) {
      const obj = this.layout.find(x => x.i === arg);
      if (!obj) return;
      if (obj.widgetParams.settings.height && obj.widgetParams.settings.width) {
        obj.h = obj.widgetParams.settings.height;
        obj.w = obj.widgetParams.settings.width;
      }
      try {
        if (updateGrid) this.loading = true;
        const { data } = await axios.post("Device/EditUserWidget", {
          Id: obj.id,
          WidgetType: obj.widgetParams.type,
          NodeID: this.$store.state.selectedTreeNode.id,
          WidgetParams: JSON.stringify(obj),
          StateGUID: this.stateGUID
        });
        this.setGUID(data.stateGUID);
      } catch (e) {
        return;
      } finally {
        if (updateGrid) this.loading = false;
      }
    },

    async handleWidgetChange({ widgetParams, updateGrid }, index) {
      const obj = this.layout.find(x => x.i === index);
      if (!obj) return;
      for (let i in widgetParams)
        obj.widgetParams.settings[i] = widgetParams[i];
      if (updateGrid) {
        this.resize(obj);
        await this.$nextTick();
        this.gridKey = Date.now();
        this.processScroll(true);
        this.processScroll();
      }
      this.handleGridChanged(index, updateGrid);
    },

    async handleDelete(arg) {
      const index = this.layout.findIndex(x => x.id === arg.id);
      if (!index && index != 0) return;
      try {
        this.loading = true;
        const { data } = await axios.delete("Device/DeleteUserWidgets", {
          data: { widgetID: arg.id }
        });
        this.setGUID(data.stateGUID);
        this.getGrid();
      } catch (e) {
        return;
      } finally {
        this.loading = false;
      }
    },

    async getTypes() {
      try {
        let { data } = await axios.get(
          `Device/GetWidgetTypes?isFolder=${this.$store.state.selectedTreeNode.isFolder}`
        );
        data = [
          {
            name: "group2",
            isGroup: false,
            childrens: data
          }
        ];
        const _ = data.findIndex(x => x.isGroup === false);
        if (_ || _ === 0) {
          const tmp = data[_].childrens;
          data.splice(_, 1);
          data = [...tmp, ...data];
        }
        data.map(x => {
          if (x.name) x.trueName = this.$t(x.name);
          if (x.isGroup && x.childrens.length) {
            x.childrens.map(y => (y.trueName = this.$t(y.name)));
          }
          return x;
        });
        this.widgetsList = data;
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      }
    },

    handleClear() {
      this.layout = [];
      this.$store.commit("setSelectedTreeNode", null);
    },

    async handleChange(arg) {
      this.showTree = false;
      this.layout = [];
      if (this.$store.state.selectedTreeNode?.id === arg.id) return;
      this.$store.commit("setSelectedTreeNode", arg);
      this.getTypes();
      this.getGrid();
    },

    handleScroll(e) {
      this.hideBadge =
        this.oldScroll < e.target.scrollTop && e.target.scrollTop > 550;
      this.oldScroll = e.target.scrollTop;
    },

    async processScroll(arg = false) {
      await this.$nextTick();
      const _ = document.querySelector(`.gridWrap`);
      if (_) {
        if (!arg) {
          _.addEventListener("scroll", this.handleScroll);
          this.observer = new ResizeObserver(this.getContainerWidth).observe(_);
        } else {
          _.removeEventListener("scroll", this.handleScroll);
          if (this.observer) this.observer.unobserve(_);
        }
      }
    }
  },
  async mounted() {
    try {
      const { data } = await axios.get("ServerSettings/GetShowWelcome");
      this.$store.commit("setShowWelcome", data);
      this.$store.commit("setShowWelcomeCBX", data);
    } catch (e) {
      this.$message.error("err_some_error");
    }
    this.processScroll();
  },
  beforeDestroy() {
    this.processScroll(true);
  }
};
</script>

<style module lang="scss">
.root {
  display: flex;
  height: 100%;
}

.tree {
  position: relative;
  width: 320px;
  padding-right: 10px;
}

.root > div:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.root > div:last-child > div:last-child {
  flex: 1;
  position: relative;
}

.root > div:last-child > div:last-child > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
  overflow-x: hidden;
}

.overlay {
  top: 10px !important;
  left: 10px !important;
  right: 10px !important;
  bottom: 10px !important;
}

.badge {
  display: none;
}

.badge > * + * {
  margin-left: 10px;
}

.widgetSelect {
  max-width: 150px;
}

.gridWrap {
  height: calc(100% + 2px);
  user-select: text;
  margin: 0 auto;
  transform-origin: center top;
}

.gridItem {
  background: #fff;
  height: 100%;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.contentWrap {
  position: relative;
  height: 100%;
  transform-origin: center top;
}

.contentOverlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.5) !important;
}

.contentOverlay > * {
  font-size: 80px !important;
  color: #fff !important;
  background-color: transparent !important;
}

.noData {
  position: relative;
  height: 100%;
}

.noData > * {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree {
  position: relative;
}
@media all and (max-width: 1100px) {
  .tree {
    position: absolute !important;
    /*top: 120px;*/
    top: 60px;
    bottom: 0;
    left: -350px;
    right: 100%;
    width: auto;
    overflow: hidden;
    z-index: 1;
    transition: all 0.3s ease-in-out 0s;
  }
  .treeActive {
    left: 10px;
    right: 10px;
    padding-right: 0;
    overflow: auto;
    z-index: 10;
  }

  .badge {
    display: flex !important;
    z-index: 2;
    height: 40px;
    padding: 0 20px;
    transition: all 0.3s linear 0s;
    margin-top: 5px;
  }
  .widgetsWrapper {
    position: relative;
  }

  .widgetsWrapper:has(.badge) {
    transition: all 0.3s linear 0s;
  }

  .hideBadge {
    height: 0;
    opacity: 0;
    z-index: -1;
  }

  .adjustmentsWrap {
    top: 64px !important;
  }
}
</style>
