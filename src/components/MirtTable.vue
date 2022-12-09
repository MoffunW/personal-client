<template>
  <div :class="$style.root">
    <table>
      <thead>
        <tr class="mirtTableHead">
          <th
            v-for="item in header"
            :key="item"
            v-text="item === 'date' ? $t('tableViewDate') : $t(item)"
          ></th>
        </tr>
      </thead>
      <tbody>
        <tr class="mirtTableRow" v-for="item in value" :key="item.date">
          <td
            v-for="i in Object.keys(item)"
            :key="`${item.date} ${i}`"
            v-text="item[i]"
          ></td>
        </tr>
      </tbody>
    </table>
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
  overflow: auto;
}

.root table {
  width: 100%;
  border-spacing: 1px;
}

.root th,
.root td {
  outline: 1px solid #cecece;
  white-space: nowrap;
  padding: 5px 15px;
}

.root th {
  position: sticky;
  top: 1px;
}
</style>
