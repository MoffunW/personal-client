<template>
  <div :class="$style.root">
    <v-overlay v-if="!showTree">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
    <div v-else :class="$style.tree">
      <div
        :class="$style.wrapper"
        ref="wrapper"
        @click="handleClick"
        @dblclick="handlerDoubleClick"
      >
        <div ref="viewport"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    width: {
      type: String,
      default: () => "200px"
    },
    renderItem: {
      type: Function,
      default: (arg, index) => {
        const el = document.createElement("div");
        el.setAttribute("data-index", index);
        el.innerHTML = arg.text;
        return el;
      }
    }
  },
  data() {
    return {
      data: null,
      items: null,
      itemHeight: 0,
      contentHeight: 0,
      capacity: 0,
      maxHeight: 6000000,
      mode: "simple",
      viewport: null,
      wrapper: null,
      el: null,
      observer: null,
      showTree: false,
      childsCache: null,
      scalableStart: 0,
      numClick: 0,
      filterValue: null
    };
  },
  computed: {
    auth() {
      return this.$store.state.auth;
    }
  },
  watch: {
    "$store.state.filterValue": {
      async handler(newVal) {
        const rootNode = this.$options.items[0];

        //this.collapseNode(rootNode.id);

        if (!newVal) {
          this.filterValue = null;

          this.$options.items = [rootNode];
          this.$options.childsCache = { [rootNode.id]: [] };

          let el = document.createElement("span");
          el.dataset.index = rootNode.id;
          this.getChilds(el);
          el.remove();

          const localPath = localStorage.getItem("path");
          let path = localPath ? JSON.parse(localPath) : [];
          const selected = localStorage.getItem("selected");

          path = [...path, selected];
          this.openByFullPath(path);

          return;
        }
        localStorage.setItem("filter_value", newVal);
        this.filterValue = newVal;

        await this.handleFilter();
        setTimeout(() => {
          if (
            this.viewport.querySelectorAll(".treeItem.treeSelected").length ===
            0
          ) {
            this.$emit("clear");
          } else {
            const selectedId = localStorage.getItem("selected");
            if (!selectedId) return;

            const selectedItem = this.getItemById(selectedId);
            if (!selectedItem) return;
            if (this.$store.state.selectedTreeNode?.id !== selectedId) {
              this.$emit("change", selectedItem);
            }
            this.setScroll(
              document.querySelector(`[data-index="${selectedId}"]`)
            );
          }
        }, 50);
      }
    },
    "$store.state.newPathSearch": {
      handler(newVal) {
        if (!newVal) return;

        const path = newVal.map(node => node.mRID);
        const pathWithoutSelected = path.slice(0, path.length - 1);

        localStorage.setItem("path", JSON.stringify(pathWithoutSelected));

        const localPath = JSON.parse(localStorage.getItem("path"));
        const localSelected = localStorage.getItem("selected");
        const temp = [...localPath, localSelected];
        if (JSON.stringify(path) === JSON.stringify(temp)) {
          const treeId = path[0];
          const selectedItemId = path[path.length - 1];
          this.openByFullPath([treeId, selectedItemId]);
          return;
        }
        this.openByFullPath(path);

        this.$store.commit("setNewPathSearch", null);
      }
    },
    "$store.state.auth": {
      handler(arg) {
        if (arg) this.start();
      },
      immediate: true
    }
  },
  methods: {
    setPath(nodeId) {
      localStorage.setItem("selected", nodeId);
      const arr = [];
      const cache = this.$options.childsCache;
      let _ = "🔔";
      while (_) {
        _ = Object.keys(cache).find(id =>
          cache[id].find(child => child.id == (nodeId ? nodeId : _)) ? id : null
        );
        nodeId = null;
        if (_) arr.push(_);
      }
      localStorage.setItem("path", JSON.stringify(arr.reverse()));
    },

    async handleFilter() {
      const rootNode = this.$options.items[0];
      this.collapseNode(rootNode.id);
      this.$options.items[0].expanded = false;
      this.$options.items[0].lastChild = true;

      let el = document.createElement("span");
      el.dataset.index = rootNode.id;

      await this.getChildsFiltered(el);
    },

    async getChildsFiltered(el, collapseOpened = true) {
      if (el.classList.contains("treeLoading")) return;

      try {
        const index = this.$options.items.findIndex(
          x => x.id === el.dataset.index
        );
        let obj = this.$options.items[index];
        if (!obj) return;
        let lastParents = obj?.lastParents ? [...obj.lastParents] : [];
        if (obj.level) lastParents.push(!!obj.lastChild);
        if (!obj.expanded) {
          setTimeout(() => el.classList.add("treeLoading"), 50);
          obj.expanded = true;
          //if (!this.$options.childsCache[obj.id]) {
          const { data } = await axios.get(
            `Device/DeviceListFilter?node=${obj.id}&filter_text=${this.filterValue}`
          );
          const key = data.parent ? data.parent : el.dataset.index;
          data.values.map(x => {
            x.level = obj.level ? obj.level + 1 : 1;
            x.lastParents = lastParents;
          });
          this.$options.childsCache[key] = data.values;
          //}
          this.expandNode(obj.id);
          this.refreshSelected();
        } else {
          if (collapseOpened) {
            obj.expanded = false;
            this.collapseNode(obj.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
      el.remove();
    },
    refreshSelected() {
      //setTimeout(() => {
      this.$options.items.forEach(item => (item.selected = false));

      const allSelected = this.viewport.querySelectorAll(
        ".treeItem.treeSelected"
      );
      if (allSelected)
        allSelected.forEach(el => el.classList.remove("treeSelected"));

      const selectedId = localStorage.getItem("selected");
      const index = this.$options.items.findIndex(
        item => item.id === selectedId
      );

      if (index !== -1) this.$options.items[index].selected = true;

      const selectedElement = this.getElementById(selectedId);
      if (selectedElement) selectedElement.classList.add("treeSelected");
      //}, 0);
    },

    getElementById(id) {
      const node = this.viewport.querySelector(`[data-index="${id}"]`);
      return node ?? null;
    },
    getItemById(id) {
      return this.$options.items.find(item => item.id === id) ?? null;
    },
    clearSelected() {
      const selected = this.viewport.querySelector(".treeItem.treeSelected");
      if (selected) selected.classList.remove("treeSelected");

      localStorage.setItem("selected", null);

      const selectedItem = this.$options.items.find(item => item.selected);

      if (selectedItem) selectedItem.selected = false;
    },

    async openByFullPath(path) {
      //const lastSavedSelected = localStorage.getItem("selected");
      const pathWithoutSelected = path.slice(0, path.length - 1);
      const lastItemId = path[path.length - 1];

      const el = document.createElement("span");
      el.dataset.index = lastItemId;

      if (this.filterValue?.length) {
        await this.restoreTree([path[0]], false);
      } else {
        await this.restoreTree(pathWithoutSelected);
        localStorage.setItem("path", JSON.stringify(pathWithoutSelected));
      }

      setTimeout(() => {
        this.$options.items.forEach(item => (item.selected = false));
        const index = this.$options.items.findIndex(
          item => item.id === lastItemId
        );
        if (index !== -1) this.$options.items[index].selected = true;
        const newSelectedEl = this.getElementById(lastItemId);
        this.restoreItem(newSelectedEl, lastItemId);

        localStorage.setItem("selected", lastItemId);
        this.refreshSelected();

        if (newSelectedEl) {
          newSelectedEl.classList.add("treeSelected");
          localStorage.setItem("selected", lastItemId);
        }

        const selectedItem = this.getItemById(lastItemId);

        if (
          selectedItem &&
          this.$store.state.selectedTreeNode?.id !== lastItemId
        ) {
          this.$emit("change", selectedItem);
        } else if (!selectedItem) {
          this.$options.items = this.$options.items.map(item => {
            item.selected = false;
            return item;
          });
          this.refreshSelected();
          this.$message.error("search_nodeNotFoundCauseFilterError");
          this.$emit("clear");
        }
      }, 250);
    },

    async restoreTree(arg, selectTree = true) {
      if (!arg) {
        const firstNode = this.viewport.querySelector(".treeItem");
        if (firstNode) this.handleClick({ target: firstNode }, selectTree);
        return;
      }
      for (let x of arg) {
        try {
          let el = document.createElement("span");
          el.dataset.index = x;
          await this.getChilds(el, false);
          el.remove();
        } catch (e) {
          console.error(e);
        }
      }

      const selected = localStorage.getItem("selected");
      if (!selected) return;
      const item = this.$options.items.find(x => x.id == selected);
      if (!item) return;

      const element = this.getElementById(selected);
      this.restoreItem(element, selected);
      if (this.$store.state.selectedTreeNode)
        this.$emit("restored", this.$store.state.selectedTreeNode);
    },

    setScroll(element) {
      if (!element) return;
      let scrollTop = 0;
      switch (this.mode) {
        case "scalable":
          scrollTop =
            element * (this.itemHeight / (this.contentHeight / this.maxHeight));
          break;
        default:
          scrollTop = element.offsetTop;
      }
      this.el.scrollTop = scrollTop;
    },

    restoreItem(element, id) {
      const node = this.viewport.querySelector(`[data-index="${id}"]`);
      this.$store.state.selectedTreeNode && node
        ? node.classList.add("treeSelected")
        : this.handleClick({ target: node });

      this.setScroll(element);
    },

    setRowSelected(arg) {
      if (arg.closest(".treeSelected")) return;
      const el = this.el.querySelector(".treeItem.treeSelected");
      if (el) el.classList.remove("treeSelected");
      arg.classList.add("treeSelected");
      if (!arg && !arg.dataset.index) return;
      if (!this.filterValue?.length) this.setPath(arg.dataset.index);
      arg.classList.add("treeSelected");
      this.$emit(
        "change",
        this.$options.items.find(x => x.id === arg.dataset.index)
      );
    },

    expandNode(id) {
      const index = this.$options.items.findIndex(x => x.id === id);

      if (index === -1) return;

      const cachedItem = this.$options.childsCache[id];
      if (this.filterValue?.length && !cachedItem.length) {
        this.$options.items.splice(index + 1, 0, {
          id: "empty_unique_id",
          text: this.$t("filter_empty"),
          level: 1,
          hasChilds: false,
          lastChild: true,
          lastParents: [id]
        });
        this.refreshTree();
        return;
      }

      cachedItem[cachedItem.length - 1].lastChild = true;
      this.$options.items.splice(index + 1, 0, ...cachedItem);
      this.refreshTree();
    },

    collapseNode(id) {
      const index = this.$options.items.findIndex(x => x.id === id);
      const level = this.$options.items[index].level
        ? +this.$options.items[index].level
        : 0;

      let i = index + 1;
      let counter = 0;
      while (
        (this.$options.items[i]?.level ? +this.$options.items[i].level : 0) >
        level
      ) {
        this.$options.items[i].expanded = false;
        i++;
        counter++;
      }
      this.$options.items.splice(index + 1, counter);
      this.refreshTree();
    },

    async getChilds(el, collapseOpened = true) {
      if (this.filterValue) {
        this.getChildsFiltered(el, collapseOpened);
        return;
      }
      if (el.classList.contains("treeLoading")) return;
      try {
        const index = this.$options.items.findIndex(
          x => x.id === el.dataset.index
        );
        let obj = this.$options.items[index];
        if (!obj) return;
        let lastParents = obj?.lastParents ? [...obj?.lastParents] : [];
        if (obj.level) lastParents.push(!!obj.lastChild);
        if (!obj.expanded) {
          setTimeout(() => el.classList.add("treeLoading"), 500);
          obj.expanded = true;
          if (!this.$options.childsCache[obj.id]?.length) {
            const { data } = await axios.get(
              `Device/DeviceList?node=${obj.id}`
            );

            const key = data.parent;
            data.values.map(x => {
              x.level = obj.level ? obj.level + 1 : 1;
              x.lastParents = lastParents;
            });
            this.$options.childsCache[key] = data.values;
          }

          if (this.$options.childsCache[obj.id]?.length)
            this.expandNode(obj.id);
          //this.refreshSelected();
        } else {
          if (collapseOpened) {
            obj.expanded = false;
            this.collapseNode(obj.id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    },

    handlerDoubleClick(e) {
      const el = e.target.closest(".treeItem");
      const node = this.$options.items.find(x => x.id === el.dataset.index);

      if (!node || !node.hasChilds || !node.isFolder) return;
      if (!el) return;
      if (el.classList.contains("emptyMessage")) return;
      this.getChilds(el);
    },
    handleClick(e, selectItem = true) {
      if (!e.target) return;
      this.numClick = e.detail;
      if (this.numClick > 1) return;

      this.scalableStart =
        (this.el.scrollTop / (this.el.scrollHeight - this.el.clientHeight)) *
        (this.$options.items.length - this.capacity);
      const el = e.target.closest(".treeItem");
      if (!el) return;
      if (el.classList.contains("emptyMessage")) return;

      const expand = e.target?.closest(".treeExpand");
      if (expand) {
        this.getChilds(el);
        return;
      }

      setTimeout(() => {
        if (this.numClick > 1) return;
        if (selectItem) {
          this.setRowSelected(el);
          const index = this.$options.items.findIndex(
            x => x.id === el.dataset.index
          );
          let obj = this.$options.items[index];
          if (obj.selected) return;
          this.$options.items.forEach(x => (x.selected = false));
          obj.selected = true;
          this.refreshTree();
        }
      }, 200);
    },

    destroy() {
      if (this.mode === "scalable")
        this.el.removeEventListener("scroll", this.renderScalableTree);
      if (this.mode === "virtual")
        this.el.removeEventListener("scroll", this.renderTree);
      if (this.viewport) {
        while (this.viewport.firstChild) {
          this.viewport.removeChild(this.viewport.firstChild);
        }
      }
      if (this.observer)
        this.observer.unobserve(this.$el.querySelector(`.${this.$style.tree}`));
    },

    /*
    const offset =
        (this.el.scrollTop / (this.el.scrollHeight - this.el.clientHeight)) *
        (this.$options.items.length - this.capacity);
      const start = Math.floor(offset);
      const end = Math.ceil(offset + this.capacity);
      this.viewport.style.top = firstRow * this.itemHeight + "px";
      this.redrawViewport(this.$options.items.slice(start, end), start);
    */

    refreshTree() {
      if (!this.el) return;
      const scrollOffset = this.el.scrollTop;
      let scrollTop = 0;
      let start = 0;
      let end = 0;
      if (this.mode === "scalable") {
        const itemsDiff =
          Math.floor(
            (this.el.scrollTop /
              (this.el.scrollHeight - this.el.clientHeight)) *
              (this.$options.items.length - this.capacity)
          ) - Math.floor(this.scalableStart);
        scrollTop =
          Math.round(itemsDiff / (this.contentHeight / this.maxHeight)) *
          this.itemHeight;
        start = Math.floor(this.scalableStart);
        end = Math.ceil(this.scalableStart + this.capacity);

        this.destroy();
        this.init();
        this.el.scrollTop = scrollOffset - scrollTop;
        setTimeout(
          () =>
            this.redrawViewport(this.$options.items.slice(start, end), start),
          0
        );
      } else {
        this.destroy();
        this.init();
        this.el.scrollTop = scrollOffset - scrollTop;
      }
    },

    handleResize() {
      this.capacity = this.el.clientHeight / this.itemHeight;
      if (this.mode === "scalable") this.renderScalableTree();
      if (this.mode === "virtual") this.renderTree();
    },

    setItemHeight() {
      if (!this.viewport) return;
      const el = this.renderItem(this.$options.items[0], 0);
      this.viewport.appendChild(el);
      this.itemHeight = el.clientHeight;
      el.remove();
    },

    getMode() {
      if (
        this.$options.items.length <= 500 &&
        this.contentHeight <= this.maxHeight
      ) {
        return "simple";
      }
      if (this.contentHeight <= this.maxHeight) {
        return "virtual";
      }
      return "scalable";
    },

    renderTree() {
      const offset = this.el.scrollTop / this.itemHeight;
      const start = Math.floor(offset);
      const end = Math.ceil(offset + this.capacity);
      this.viewport.style.top = start * this.itemHeight + "px";
      this.redrawViewport(this.$options.items.slice(start, end), start);
    },

    renderScalableTree() {
      const rowsOffset = this.el.scrollTop / this.itemHeight;
      const firstRow = Math.floor(rowsOffset);
      const offset =
        (this.el.scrollTop / (this.el.scrollHeight - this.el.clientHeight)) *
        (this.$options.items.length - this.capacity);
      const start = Math.floor(offset);
      const end = Math.ceil(offset + this.capacity);
      this.viewport.style.top = firstRow * this.itemHeight + "px";
      this.redrawViewport(this.$options.items.slice(start, end), start);
    },

    redrawViewport(items) {
      while (this.viewport.firstChild) {
        this.viewport.removeChild(this.viewport.firstChild);
      }
      items.forEach(item => {
        const row = this.renderItem(item);
        this.viewport.appendChild(row);
      });
    },

    init() {
      this.$el.style.width = `${this.width}`;
      this.el = this.$el.querySelector(`.${this.$style.tree}`);
      if (!this.el) return;
      this.viewport = this.$refs.viewport;
      this.wrapper = this.$refs.wrapper;
      this.setItemHeight();
      this.capacity = this.el.clientHeight / this.itemHeight;
      this.contentHeight = this.itemHeight * this.$options.items.length;
      this.mode = this.getMode();
      switch (this.mode) {
        case "scalable":
          this.wrapper.style.height = `${this.maxHeight}px`;
          this.renderScalableTree();
          this.el.addEventListener("scroll", this.renderScalableTree);
          break;
        case "virtual":
          this.wrapper.style.height = `${this.contentHeight}px`;
          this.renderTree();
          this.el.addEventListener("scroll", this.renderTree);
          break;
        default:
          this.$options.items.forEach(item => {
            const row = this.renderItem(item);
            this.viewport.appendChild(row);
          });
      }
    },

    async start() {
      if (!this.auth) {
        this.showTree = true;
        this.$message.error(`Error: Unauthorized`);
        return;
      }
      let result = null;
      try {
        result = await axios.get("Device/GetAllTreeImageNode");
        if (!result || !result.data) return;
        if (result.data) {
          const obj = {};
          result.data.forEach(x => (obj[x.typeName] = x.ico));
          this.$store.commit("setdevicesImgs", obj);
        }
      } catch (e) {
        this.$store.commit("setdevicesImgs", {});
        this.$message.error(`API Error: Can't get tree images`);
      }
      try {
        result = await axios.get("Device/DeviceList?node");
        if (!result || !result.data || !result.data.values.length) return;
        this.showTree = true;
        await this.$nextTick();
        const el = this.$el.querySelector(`.${this.$style.tree}`);
        if (el)
          this.observer = new ResizeObserver(this.handleResize).observe(el);
        this.$options.items = result.data.values;
        this.$options.childsCache = {};
        this.init();
        await this.$nextTick();
        if (!this.viewport) return;
        const arr = JSON.parse(localStorage.getItem("path"));
        !arr ? localStorage.setItem("selected", null) : this.restoreTree(arr);
      } catch (e) {
        this.showTree = true;
        this.$message.error(`API Error: Can't get first tree node`);
      }
    }
  },
  beforeDestroy() {
    this.destroy();
  }
};
</script>

<style module>
.root {
  height: calc(100% - 44px);
  position: relative;
}

.tree {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding-right: 8px;
  padding-left: 1px;
}

.wrapper {
  position: relative;
}

.wrapper > div {
  position: absolute;
  width: 100%;
}
</style>
