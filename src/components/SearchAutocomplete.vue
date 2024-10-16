<template>
  <div class="search">
    <input
      class="search__input"
      :value="value"
      @input="updateValue($event.target.value)"
      @keydown.enter="$emit('search')"
      :maxlength="30"
    />

    <button class="search__close" @click="closeSearch">
      <v-icon size="16" color="#000">mdi-close</v-icon>
    </button>
    <div class="search-options" v-if="filteredSearches.length">
      <div
        v-for="(query, index) in filteredSearches"
        class="search-options__item"
        :key="index"
      >
        <button @click="selectOption(query)">
          <div class="search-options__item-text">
            {{ query }}
          </div>
        </button>
        <button @click="deleteOption(query)">
          <v-icon size="16" color="#000">mdi-close</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const LAST_SEARCHES = "lastSearches";

export default {
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      lastSearches: []
    };
  },
  computed: {
    filteredSearches() {
      return this.lastSearches
        .filter(search => search.includes(this.value))
        .reverse();
    }
  },
  methods: {
    setLastSearches() {
      const localValue = localStorage.getItem("lastSearches");
      const lastSavedSearches = localValue ? JSON.parse(localValue) : [];

      this.lastSearches = lastSavedSearches ?? [];
    },

    updateValue(value) {
      this.$emit("input", value);
      this.setLastSearches();
    },
    closeSearch() {
      this.$emit("input", "");
      this.updateValue(""); // Optionally clear the input when closing
    },
    emitSearch(val = "") {
      this.$emit("search", val);
    },
    selectOption(option) {
      this.emitSearch(option);
    },
    deleteOption(search) {
      const localValue = localStorage.getItem(LAST_SEARCHES);
      let savedItems = localValue ? JSON.parse(localValue) : [];

      savedItems = savedItems.filter(item => item !== search);
      localStorage.setItem(LAST_SEARCHES, JSON.stringify(savedItems));
      this.setLastSearches();
    }
  },
  mounted() {
    this.setLastSearches();
  }
};
</script>
<style lang="scss" scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  height: 26px;
  border-radius: 4px;
  box-sizing: border-box;
  flex: 1 1 auto;
  border: 0.5px solid var(--mainColor);
  padding-right: 10px;
  &:has(:focus-within) {
    .search-options {
      display: block;
    }
  }

  &__input {
    outline: none;
    flex: 1 1 auto;
    width: 100%;
    padding: 10px 6px;
    font-family: "Roboto", sans-serif;
    font-weight: 300 !important;
    line-height: 14px;
    &::placeholder {
      font-family: "Roboto", sans-serif;
      font-weight: 300 !important;
      font-size: 12px;
      line-height: 12px !important;
      font-style: italic;
    }
  }
  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 7px;
    width: 7px;
  }

  &-options {
    display: none;
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    max-height: 160px;
    overflow-y: auto;
    background: var(--bgColor);
    border: 1px solid var(--mainColor);
    border-radius: 3px;
    padding: 13px 10px;
    z-index: 9990999;
    gap: 5px;
    &:hover {
      display: block;
    }
    &__item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 300 !important;
      font-size: 14px !important;
      width: 100%;
      &-text {
        flex: 1;
        cursor: pointer;
      }
    }
  }
}
</style>
