<template>
  <div :class="$style.root" v-click-outside="removeAllTooltips">
    <div :class="$style.headerWrap">
      <div ref="header" class="mirtTableHead">
        <div
          v-for="item in header"
          :key="item"
          :class="$style.th"
          :style="`min-width: ${cellWidth}px`"
          v-text="item === 'date' ? $t('tableViewDate') : $t(item)"
        ></div>
      </div>
    </div>
    <v-virtual-scroll :bench="2" :items="value" item-height="29" ref="root">
      <template v-slot:default="{ item }">
        <div class="mirtTableRow" :class="$style.row">
          <div
            v-for="(val, index) in Object.values(item)"
            :key="`${item}${index}`"
            :class="$style.td"
            :style="`min-width: ${cellWidth}px`"
          >
            <v-tooltip :open-on-click="true" bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  @click="handleClick(on, $event)"
                  :class="$style.longText"
                  v-text="$t(val)"
                ></span>
              </template>
              <span :class="$style.tooTipContent" v-text="$t(val)"></span>
            </v-tooltip>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    header() {
      if (!this.value.length) return [];
      return Object.keys(this.value[0]);
    }
  },
  data() {
    return {
      cellWidth: 150
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

    handleScroll(arg) {
      this.$refs.header.style.left = `-${arg.target.scrollLeft}px`;
    }
  },
  mounted() {
    this.$refs.root.$el.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    this.$refs.root.$el.removeEventListener("scroll", this.handleScroll);
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
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.root > *:last-child {
  flex: 1;
}

.headerWrap {
  position: relative;
  height: 30px;
  overflow: hidden;
}

.headerWrap > * {
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
}

.row {
  display: flex;
  width: 100%;
}

.headerWrap > * > *,
.row > * {
  display: inline-flex;
  align-items: center;
}

.headerWrap > * > *:last-child,
.row > *:last-child {
  flex: 1;
}

.root .th,
.root .td {
  border: 1px solid #cecece;
  border-left: none;
  white-space: nowrap;
  padding: 5px 15px;
}

.root .td {
  height: 29px;
  position: relative;
  border-top: none;
}

.root .th:first-child,
.root .td:first-child {
  border-left: 1px solid #cecece;
}

.longText {
  display: inline-block;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  /*left: 15px;
  right: 15px;*/
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
