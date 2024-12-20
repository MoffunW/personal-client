<template>
  <DataTable
    ref="dataTable"
    class="table"
    :value="items"
    :loading="loading"
    :rowsPerPageOptions="linesPerPageOptions"
    :rows="linesPerPage"
    :totalRecords="countNodes"
    @page="onChange"
    lazy
    scrollable
    stripedRows
    scrollHeight="flex"
    size="small"
    paginator
    paginatorTemplate="PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown"
    :currentPageReportTemplate="`${currentPage + 1}/${totalPages}`"
    @row-click="onRowClick"
    :selection="selectedRow"
    selectionMode="single"
  >
    <!-- TODO: provide uniqiue dataKey -->
    <template #empty>
      <div v-if="!loading && items.length === 0" class="table--empty">
        {{ $t("search_empty") }}
      </div>
    </template>

    <!-- DATA -->
    <Column
      v-for="(item, index) in shownHeaders"
      :key="index"
      :field="item"
      :title="item"
    >
      <template #header>
        <span :title="item">{{ `${$t(item)}` }}</span>
      </template>

      <template #body="{ data }">
        <template v-if="data === null || data === undefined">
          -
        </template>
        <template v-else>
          <div
            :title="data.name"
            class="centered"
            v-if="item === 'search_node'"
          >
            <img :src="getImage(data.image)" alt="" />
            <div class="overflow">
              {{ data.name }}
            </div>
          </div>
          <span v-else>{{ data[item.replace("search_", "")] }}</span>
        </template>
      </template>
    </Column>
  </DataTable>
</template>

<script>
import axios from "axios";
import { getQueryString } from "@/utils/network";

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
      selectedRow: null,

      shownHeaders: ["search_node", "search_type", "search_value"],
      linesPerPageOptions: [10, 50, 100, 150],
      defaultImage: require("@/assets/defaultTreeImg.png")
    };
  },
  methods: {
    async onRowClick(e) {
      const _ = e.data;
      const q = getQueryString({
        mRID: _.mRIDd,
        Image: _.image,
        ParentId: _.parentID
      });
      try {
        const res = await axios.get(`Search/TreeSearchNodePath?${q}`);
        this.$store.commit("setSearchOpen", false);
        this.$store.commit("setNewPathSearch", res.data);
      } catch (error) {
        console.error(error);
      }
    },
    getHeader(field) {
      return field;
    },
    getImage(imageName) {
      let img = this.$store.state.devicesImgs[imageName]
        ? this.$store.state.devicesImgs[imageName]
        : this.defaultImage;

      return img;
    },
    async refresh() {
      this.loading = true;
      try {
        const res = await this.getItems(this.currentPage, this.linesPerPage);
        const data = res.data;
        const nodes = data.nodes;

        this.items = nodes ? nodes : [];

        this.countNodes = data.countNodes;
        const pages = Math.ceil(data.countNodes / this.linesPerPage);
        this.totalPages = pages < 1 ? 1 : pages;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    onChange(e) {
      if (typeof e.page === "number") this.currentPage = e.page;
      if (typeof e.rows === "number") {
        this.currentPage = (this.currentPage * this.linesPerPage) / e.rows;
        this.linesPerPage = e.rows;
      }
    }
  },
  watch: {
    linesPerPage() {
      this.refresh();
    },
    currentPage() {
      this.refresh();
    }
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
  & td {
    overflow: hidden;
  }
}
.centered {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
