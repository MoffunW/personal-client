<template>
  <div :class="$style.root">
    <div
      v-for="item in widgets"
      :style="`${getWidgetSizes(item)}`"
      :key="item.id"
    >
      <div class="widgetPrevTile">
        <span v-text="item.trueName"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
      required: true
    },
    getItems: {
      type: Function,
      default: () => {},
      required: true
    }
  },
  watch: {
    items() {
      this.widgets = this.getItems();
    }
  },
  data() {
    return {
      height: 150,
      widgets: []
    };
  },
  methods: {
    getWidgetSizes(arg) {
      let _ = "33.3%";
      switch (arg.minWidth) {
        case 2:
          _ = "66.6%";
          break;
        case 3:
          _ = "99.9%";
          break;
        default:
          _ = "33.3%";
      }
      return `width: ${_}; height: ${arg.minHeight * this.height}px`;
    }
  }
};
</script>
<style module>
.root {
  min-height: 300px;
  border: transparent 3px dashed;
  transition: border-color 0.2s ease-in-out 0s;
  border: #dcdfe6 1px solid;
  overflow: auto;
}

.root > * {
  display: inline-flex;
  vertical-align: top;
}

.root > * > * {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
}
</style>
