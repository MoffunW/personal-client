<template>
  <div :class="$style.root">
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <v-dialog v-model="confirm" persistent max-width="320">
      <v-card>
        <v-card-title class="text-h5"></v-card-title>
        <v-card-text v-text="$t('trans__confirmDeleteUser')"></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="cancelBtn" depressed tile @click="confirm = false">
            {{ $t("widgetDisableEditMode") }}
          </v-btn>
          <v-btn class="primaryBtn" depressed tile @click="handleDeleteUser">
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div :class="$style.headerWrap">
      <div ref="header" class="mirtTableHead">
        <div :class="$style.th">#</div>
        <div :class="$style.th" v-text="$t('FIO')"></div>
        <div :class="$style.th" v-text="$t('password')"></div>
        <div :class="$style.th" v-text="$t('email')"></div>
        <div :class="$style.th" v-text="$t('trans__registerDate')"></div>
        <div :class="$style.th" v-text="$t('trans__blockedUser')"></div>
        <div :class="$style.th" v-text="$t('trans__trustedUser')"></div>
        <div :class="$style.th" v-text="$t('trans__userRole')"></div>
        <div :class="$style.th"></div>
        <div :class="$style.th"></div>
      </div>
    </div>
    <v-virtual-scroll
      v-if="showTable"
      :class="$style.table"
      :bench="2"
      :items="$options.value"
      :key="key"
      item-height="39"
      ref="root"
    >
      <template v-slot:default="{ item }">
        <div class="mirtTableRow" :class="$style.row">
          <div :class="$style.td" v-text="item.number"></div>
          <div :class="$style.td">
            <v-text-field v-model="item.fio" />
          </div>
          <div :class="$style.td">
            <v-text-field
              v-model="item.password"
              :rules="rules"
              :type="showPasswords[item.id] ? 'text' : 'password'"
              prepend-icon="mdi mdi-lock"
              :append-icon="showPasswords[item.id] ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPasswords[item.id] = !showPasswords[item.id]"
            />
          </div>
          <div :class="$style.td">
            <v-tooltip :open-on-click="true" bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  @click="handleClick(on, $event)"
                  :class="$style.longText"
                  v-text="item.email"
                ></span>
              </template>
              <span :class="$style.tooTipContent" v-text="item.email"></span>
            </v-tooltip>
          </div>
          <div :class="$style.td">
            <v-tooltip :open-on-click="true" bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  @click="handleClick(on, $event)"
                  :class="$style.longText"
                  v-text="item.registerDate"
                ></span>
              </template>
              <span
                :class="$style.tooTipContent"
                v-text="item.registerDate"
              ></span>
            </v-tooltip>
          </div>
          <div :class="[$style.td, $style.center]">
            <v-checkbox :class="$style.checkbox" v-model="item.blocked" />
          </div>
          <div :class="[$style.td, $style.center]">
            <v-checkbox
              :class="$style.checkbox"
              v-model="item.trusted"
              disabled
            />
          </div>
          <div :class="$style.td">
            <v-select
              :class="$style.select"
              :items="roles"
              item-text="roleName"
              item-value="id"
              v-model="item.roleId"
            />
          </div>
          <div :class="[$style.td, $style.center]">
            <v-btn
              class="primaryBtnOutline"
              :class="$style.button"
              depressed
              tile
              @click="handleSaveUser(item)"
            >
              <span v-text="$t('widgetOptionsSubmit')"></span>
            </v-btn>
          </div>
          <div :class="$style.td">
            <v-btn
              class="deleteBtnOutline"
              :class="$style.button"
              depressed
              tile
              @click="handleShowDialog(item)"
            >
              <span v-text="$t('trans__DeleteUser')"></span>
            </v-btn>
          </div>
        </div>
      </template>
    </v-virtual-scroll>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    contract: {
      type: [Number, String],
      default: 0
    },
    dialog: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rules: [
        arg => {
          if (arg) {
            if (arg.length > 40) return this.$t("trans__max40Chars");
            if (arg.length < 6) return this.$t("trans__min6Chars");
            return true;
          } else return true;
        }
      ],
      showTable: false,
      showPasswords: {},
      value: null,
      loading: false,
      key: 0,
      roles: [],
      confirm: false,
      selectedId: null
    };
  },
  watch: {
    dialog(arg) {
      arg === true ? this.getData() : (this.showTable = false);
    }
  },
  methods: {
    removeAllTooltips() {
      const obj = document.querySelectorAll(`.${this.$style.tooTipContent}`);
      if (obj.length > 0)
        for (let i = 0; i < obj.length; i++) obj[i].parentNode.remove();
    },

    handleClick({ mouseenter }, e) {
      if (e.type === "click") {
        this.removeAllTooltips();
        setTimeout(() => mouseenter(e), 250);
      }
    },

    handleShowDialog(arg) {
      this.confirm = true;
      this.selectedId = arg.id;
    },

    async getRoles() {
      this.loading = true;
      try {
        const { data } = await axios.get("AdminSection/GetRoles");
        this.roles = data;
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async getData() {
      this.loading = true;
      try {
        const { data } = await axios.get(
          `AdminSection/GetContractUsers?Contract=${this.contract}`
        );
        const obj = {};
        data.map((x, index) => {
          obj[x.id] = false;
          x.number = index + 1;
          x.password = null;
          x.showPass = false;
          return x;
        });
        this.$options.value = data;
        this.showPasswords = obj;
        this.showTable = true;
        setTimeout(
          () =>
            this.$refs.root.$el.addEventListener("scroll", this.handleScroll),
          100
        );
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async handleSaveUser(arg) {
      this.loading = true;
      try {
        await axios.get(
          arg.password
            ? `AdminSection/EditUser?RoleId=${arg.roleId}&FIO=${arg.fio}&Password=${arg.password}&Blocked=${arg.blocked}&UserID=${arg.id}`
            : `AdminSection/EditUser?RoleId=${arg.roleId}&FIO=${arg.fio}&Blocked=${arg.blocked}&UserID=${arg.id}`
        );
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
    },

    async handleDeleteUser() {
      this.loading = true;
      try {
        await axios.get(`AdminSection/DropUser?UserID=${this.selectedId}`);
        let obj = JSON.parse(JSON.stringify(this.$options.value));
        const index = obj.findIndex(x => x.id === this.selectedId);
        const scroll = this.$refs.root.$el.scrollTop;
        obj.splice(index, 1);
        obj.map((x, index) => {
          x.number = index + 1;
        });
        this.$options.value = obj;
        this.key = new Date().getTime();
        await this.$nextTick();
        this.$refs.root.$el.scrollTop = scroll;
      } catch (e) {
        this.$message.error("err_some_error");
        return;
      } finally {
        this.loading = false;
      }
      this.confirm = false;
    },

    handleScroll(arg) {
      this.$refs.header.style.left = `-${arg.target.scrollLeft}px`;
    }
  },
  mounted() {
    this.getRoles();
    this.getData();
  },
  beforeDestroy() {
    if (this.$refs.root)
      this.$refs.root.$el.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style module>
.root {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.root .table {
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

.center > * {
  margin: auto;
}

.root .th,
.root .td {
  border: 1px solid #cecece;
  border-left: none;
  white-space: nowrap;
  padding: 5px 15px;
  min-width: 15vw;
}

.root .th:first-child,
.root .td:first-child {
  min-width: 100px;
}

.root .th:nth-child(5),
.root .td:nth-child(5) {
  min-width: 180px;
}

.root .th:nth-child(6),
.root .td:nth-child(6),
.root .th:nth-child(7),
.root .td:nth-child(7) {
  min-width: 140px;
}

.root .th:nth-child(8),
.root .td:nth-child(8) {
  min-width: 140px;
}

.root .th:nth-child(9),
.root .td:nth-child(9) {
  min-width: 160px;
}

.root .th:last-child,
.root .td:last-child {
  min-width: 0;
}

.root .td {
  height: 39px;
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

.select {
  width: 100px;
}

.checkbox {
  height: 32px !important;
  margin: 0 auto !important;
}

@media all and (max-width: 1760px) {
  .root .th,
  .root .td {
    width: 180px;
    min-width: 180px;
  }

  .root .th:first-child,
  .root .td:first-child {
    width: 100px;
  }

  .root .th:last-child,
  .root .td:last-child {
    min-width: 140px;
  }
}

@media all and (max-width: 960px) {
  .root {
    top: 56px;
  }
}
</style>
