<template>
  <DataTable
    ref="dataTable"
    class="table"
    :value="items"
    :loading="loading"
    :highlightOnSelect="true"
    :rowsPerPageOptions="linesPerPageOptions"
    :rows="linesPerPage"
    :totalRecords="countNodes"
    lazy
    scrollable
    stripedRows
    scrollHeight="flex"
    size="small"
    paginator
    paginatorTemplate="PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown"
    :currentPageReportTemplate="`${currentPage + 1}/${totalPages}`"
  >
    <!-- TODO: provide uniqiue dataKey -->
    <template #empty>
      <div v-if="!loading && items.length === 0" class="table--empty">
        Empty
      </div>
    </template>

    <template #loading>
      <div class="loading">
        <v-progress-circular color="primary" indeterminate />
        <div class="loading__text">Загрузка</div>
      </div>
    </template>

    <!-- DATA -->
    <Column
      v-for="item in shownHeaders"
      :key="item"
      :field="item"
      :title="item"
    >
      <!--TODO: Refactor this mess to be universal-->
      <template #header>
        <span :title="item">{{ item }}</span>
      </template>

      <template #body="{ data }">
        <template v-if="data === null || data === undefined">
          -
        </template>
        <template v-else>
          <div class="centered" v-if="item === 'imageAndName'">
            <img :src="getImage(data.image)" alt="" />
            {{ data.name }}
          </div>
          <span v-else>{{ data[item] }}</span>
        </template>
      </template>
    </Column>
  </DataTable>
</template>

<script>
export default {
  name: "ResultTable",
  props: {
    getItems: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      items: [],
      loading: false,
      currentPage: 0,
      totalPages: 1,
      linesPerPage: 50,
      countNodes: 0,

      shownHeaders: ["imageAndName", "type", "value"],
      linesPerPageOptions: [10, 50, 100, 150],
      defaultImage: require("@/assets/defaultTreeImg.png")
    };
  },
  methods: {
    handleClick(e) {
      console.log(e);
    },
    getHeader(field) {
      return field;
    },
    getImage(imageName) {
      console.log(imageName);
      let img = this.$store.state.devicesImgs["D_1"]
        ? this.$store.state.devicesImgs["D_1"]
        : this.defaultImage;
      console.log(img, "img");

      return img;
    },
    async refresh() {
      this.loading = true;
      try {
        const res = await this.getItems();
        const data = res.data;
        this.items = data.nodes;

        this.countNodes = data.countNodes;
        const pages = Math.ceil(data.countNodes / this.linesPerPage);
        this.totalPages = pages;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // this.init();
  }
};
</script>

<style lang="scss" scoped>
.table {
  &--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
}
.centered {
  display: flex;
  align-items: center;
}
</style>
