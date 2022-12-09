<template>
  <div :class="$style.root">
    <table>
      <thead>
        <tr class="mirtTableHead">
          <th
            colspan="2"
            v-for="(item, index) in header"
            :key="item"
            v-text="item === 'date' ? $t('tableViewDate') : $t(item)"
            :rowspan="index === 0 || index === header.length - 1 ? 2 : 1"
          ></th>
        </tr>
        <tr class="mirtTableHead">
          <template v-for="item in subHeader">
            <th v-text="item.before" :key="item.keyA"></th>
            <th v-text="item.after" :key="item.keyB"></th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in body" :key="item[0].val">
          <template v-for="(i, index) in item">
            <template v-if="i.colspan === 2">
              <td
                :key="`${item[0].val} ${index}`"
                :colspan="i.colspan"
                v-text="i.val"
              ></td>
            </template>
            <template v-else>
              <td
                :key="`${item[0].val} ${index} a`"
                :colspan="i.colspan"
                v-text="i.val.before"
              ></td>
              <td
                :key="`${item[0].val} ${index} b`"
                :colspan="i.colspan"
                v-text="i.val.after"
              ></td>
            </template>
          </template>
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
    },
    before: {
      type: String,
      default: ""
    },
    after: {
      type: String,
      default: ""
    }
  },
  computed: {
    header() {
      if (!this.value.length) return [];
      return Object.keys(this.value[0]);
    },
    subHeader() {
      if (!this.value.length) return [];
      const arr = [];
      const steps = Object.keys(this.value[0]).filter(
        x => x != "date" && x != "trans__EnergyUnits"
      ).length;
      for (let i = 0; i < steps; i++) {
        arr.push({
          before: this.before,
          after: this.after,
          keyA: `a${i}`,
          keyB: `b${i}`
        });
      }
      return arr;
    },
    body() {
      const arr = [];
      this.value.forEach(x => {
        let res = [];
        for (let i in x) {
          if (i === "date") {
            res.push({ val: x[i], colspan: 2 });
          } else if (i === "trans__EnergyUnits") {
            res.push({ val: x[i].before, colspan: 2 });
          } else {
            res.push({ val: x[i], colspan: 1 });
          }
        }
        arr.push(res);
      });
      return arr;
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
  width: 99.9%;
  border-spacing: 1px;
}

.root th,
.root td {
  outline: 1px solid #cecece;
  white-space: nowrap;
  padding: 5px 15px;
}

.root thead tr:first-child th {
  position: sticky;
  top: 1px;
}

.root thead tr:last-child th {
  position: sticky;
  top: 30px;
}
</style>
