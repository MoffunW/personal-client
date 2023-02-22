<template>
  <div :class="$style.root">
    <div>
      <table>
        <thead>
          <tr class="mirtTableHead">
            <th v-for="item in head" :key="item" v-text="item"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="items in body" :key="items.id">
            <td v-for="item in items.val" :key="item.id" v-text="item.val"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    head() {
      return Object.keys(this.data.cur[0]).map(x => this.$t(`trans__Tfs_${x}`));
    },
    body() {
      return this.data.cur.map((x, index) => {
        return {
          id: index,
          val: Object.keys(x).map((y, i) => {
            return { id: i, val: x[y] };
          })
        };
      });
    }
  }
};
</script>

<style module>
.root {
  height: 100%;
  position: relative;
}

.root > * {
  position: absolute;
  top: 20px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  padding: 0 0 1px;
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
