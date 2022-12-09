<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <div class="dialogWrap">
        <v-toolbar class="dialogHeader" flat dark>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div>
          <users-table :contract="contract" :dialog="dialog" />
        </div>
      </div>
    </v-dialog>
    <div :class="$style.tableWrap">
      <div :class="$style.headerWrap">
        <div ref="header" class="mirtTableHead">
          <div :class="$style.th">#</div>
          <div :class="$style.th" v-text="$t('trans__Contract')"></div>
          <div :class="$style.th" v-text="$t('trans__UsersCount')"></div>
          <div :class="$style.th"></div>
        </div>
      </div>
      <v-virtual-scroll
        :class="$style.table"
        :bench="2"
        :items="$options.value ? $options.value : []"
        item-height="29"
        ref="root"
      >
        <template v-slot:default="{ item }">
          <div class="mirtTableRow" :class="$style.row">
            <div :class="$style.td" v-text="item.number"></div>
            <div :class="$style.td" v-text="item.contract"></div>
            <div :class="$style.td" v-text="item.count"></div>
            <div :class="$style.td">
              <v-btn
                class="primaryBtnOutline"
                :class="$style.button"
                depressed
                tile
                @click="handleShowUsers(item)"
              >
                <span v-text="$t('trans__ViewUsers')"></span>
              </v-btn>
            </div>
          </div>
        </template>
      </v-virtual-scroll>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  components: {
    UsersTable: () => import("@/pages/Admin/users/UsersTable")
  },
  props: {
    index: {
      type: Number,
      default: 0
    }
  },
  watch: {
    index(arg) {
      if (arg === 0) this.getData();
    },
    dialog(arg) {
      if (arg === false) this.getData();
    }
  },
  data() {
    return {
      value: null,
      dialog: false,
      loading: false,
      contract: null
    };
  },
  methods: {
    handleShowUsers(arg) {
      this.contract = arg.contract;
      this.dialog = true;
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get("AdminSection/GetContracts");
        data.map((x, index) => {
          x.number = index + 1;
          return x;
        });
        this.$options.value = data;
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    handleScroll(arg) {
      this.$refs.header.style.left = `-${arg.target.scrollLeft}px`;
    }
  },
  mounted() {
    this.getData();
    this.$refs.root.$el.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    this.$refs.root.$el.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style module>
.root {
  position: relative;
  height: 100%;
}

.tableWrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.tableWrap .table {
  flex: 1;
}

.headerWrap {
  position: relative;
  height: 36px;
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

.tableWrap .th,
.tableWrap .td {
  border: 1px solid #cecece;
  border-left: none;
  white-space: nowrap;
  padding: 5px 15px;
  min-width: 25vw;
}

.tableWrap .th:first-child,
.tableWrap .td:first-child {
  min-width: 100px;
}

.tableWrap .th:last-child,
.tableWrap .td:last-child {
  min-width: 0;
}

.tableWrap .td {
  height: 29px;
  position: relative;
  border-top: none;
}

.tableWrap .th:first-child,
.tableWrap .td:first-child {
  border-left: 1px solid #cecece;
}

.button {
  margin: 0 !important;
}

@media all and (max-width: 1014px) {
  .tableWrap .th:first-child,
  .tableWrap .td:first-child {
    min-width: 100px;
  }

  .tableWrap .th:nth-child(2),
  .tableWrap .td:nth-child(2) {
    min-width: 335px;
  }

  .tableWrap .th:nth-child(3),
  .tableWrap .td:nth-child(3) {
    min-width: 170px;
  }

  .tableWrap .th:last-child,
  .tableWrap .td:last-child {
    min-width: 185px;
  }
}
</style>
