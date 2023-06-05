<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <v-tabs
      class="tabsWrap"
      v-model="tab"
      align-with-title
      show-arrows
      :centered="false"
    >
      <v-tab v-for="item in tabs" :key="item.title">
        {{ item.title }}
      </v-tab>
    </v-tabs>
    <div :class="$style.wrapper">
      <v-tabs-items class="tabsItems" v-model="tab" touchless>
        <v-tab-item :class="$style.item" v-for="item in tabs" :key="item.title">
          <div>
            <v-select
              :class="$style.widgetSelect"
              v-model="selectedWidgets[tab]"
              multiple
              item-text="trueName"
              item-value="id"
              :items="widgetsList"
              :label="$t('addWidget')"
              persistent-hint
            >
              <template v-slot:selection="{ item, index }">
                <span
                  :class="$style.overflowed"
                  v-if="index < 1"
                  v-text="item.trueName"
                ></span>
                <span
                  v-if="index === 1"
                  v-html="`&nbsp;(+${selectedWidgets[tab].length - 1})`"
                ></span>
              </template>
            </v-select>
            <v-checkbox
              :class="$style.checkbox"
              v-model="enableWidgetList[tab]"
              :label="$t('trans_useWidgets')"
            />
          </div>
          <div>
            <previews :items="selectedWidgets[tab]" :getItems="getItems" />
          </div>
          <div :class="$style.lastBlock">
            <v-btn
              class="primaryBtn"
              :class="$style.button"
              depressed
              tile
              @click="saveData"
            >
              {{ $t("widgetOptionsSubmit") }}
            </v-btn>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div></template
>

<script>
import axios from "axios";

export default {
  components: {
    Previews: () => import("@/pages/Admin/previews/Previews")
  },
  watch: {
    tab() {
      this.getTypes();
    }
  },
  data() {
    return {
      widgetsList: [],
      selectedWidgets: [[], []],
      enableWidgetList: [false, false],
      tabs: [
        { title: this.$t("trans__nodeWidgets") },
        { title: this.$t("trans__deviceWidgets") }
      ],
      tab: 0,
      layout: [],
      loading: false
    };
  },
  methods: {
    getItems() {
      const _ = [];
      this.selectedWidgets[this.tab].forEach(x => {
        const el = this.widgetsList.find(y => y.id === x);
        if (el) _.push(el);
      });
      return _;
    },

    setLayout(arg) {
      const arr = [];
      arg.forEach((x, index) => {
        let obj = JSON.parse(x.widgetParams);
        obj.id = x.id;
        obj.i = index;
        obj.fail = false;
        arr.push(obj);
      });
      this.layout = arr;
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

    async saveData() {
      this.layout = [];
      const items = this.getItems();
      items.forEach(x => {
        const _ = this.getItemProps(x);
        let el = {
          id: x.id,
          widgetParams: {
            type: x.id,
            name: x.name,
            maxHeight: x.maxHeight,
            maxWidth: x.maxWidth,
            minHeight: x.minHeight,
            minWidth: x.minWidth,
            settings: {}
          },
          x: _.x,
          y: _.y,
          w: x.minWidth,
          h: x.minHeight,
          i: this.layout.length,
          preserveAspectRatio: true
        };
        this.layout.push(el);
      });
      let obj = {
        isFolder: !this.tab,
        isUsed: this.enableWidgetList[this.tab],
        arrWidgetTemplateDTO: []
      };
      this.layout.forEach(x =>
        obj.arrWidgetTemplateDTO.push({
          widgetType: x.id,
          widgetParams: JSON.stringify(x)
        })
      );
      try {
        this.loading = true;
        await axios.post("WidgetTemplate/DefaultTemplate", obj, {
          headers: {
            "Content-Type": "application/json"
          }
        });
      } catch (e) {
        return;
      } finally {
        this.loading = false;
      }
    },

    async getTypes() {
      this.loading = true;
      try {
        let { data } = await axios.get(
          `Device/GetWidgetTypes?isFolder=${!this.tab}`
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
        data.map((x, index) => {
          if (x.name) x.trueName = `#${index + 1} ${this.$t(x.name)}`;
          if (x.isGroup && x.childrens.length) {
            x.childrens.map(y => (y.trueName = this.$t(y.name)));
          }
          return x;
        });
        this.widgetsList = data;
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.loading = false;
        this.getData();
      }
    },

    async getData() {
      this.selectedWidgets = [[], []];
      this.loading = true;
      try {
        let { data } = await axios.get(
          `WidgetTemplate/DefaultTemplate?isFolder=${!this.tab}`
        );
        if (
          data &&
          data.parameters &&
          data.parameters.parameter &&
          data.parameters.parameter.length
        ) {
          const _ = [];
          data.parameters.parameter.forEach(x => _.push(x.widgetType));
          this.setLayout(data.parameters.parameter);
          this.selectedWidgets[!this.tab ? 0 : 1] = _;
          this.enableWidgetList[!this.tab ? 0 : 1] = data.isUsed;
        }
      } catch (e) {
        if (e.response) this.$message.error(this.$t(e.response.data));
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.getTypes();
  }
};
</script>

<style module>
.root {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.wrapper {
  height: 100%;
  max-width: 700px;
  padding: 10px;
  margin: 0 auto;
  overflow: auto;
}

.item {
  margin: 15px 0 0;
  height: 100%;
}

.widgetSelect {
  width: 200px;
}

.overflowed {
  display: inline-block;
  max-width: 136px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checkbox {
  width: 200px;
}

.lastBlock {
  padding: 20px 0;
  margin: 0 0 20px;
}
</style>
