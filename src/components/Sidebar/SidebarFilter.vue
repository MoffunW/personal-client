<template>
  <div
    class="filter"
    :class="{
      invalid: filterText.length < minLength && filterText.length !== 0
    }"
  >
    <input
      v-model="filterText"
      class="filter__input"
      :placeholder="$t('search_filterByName')"
      :maxlength="30"
      title="Must be at least 3 symbols"
      @keydown.enter="handleFilter"
    />
    <button v-ripple class="filter__close" @click="clearInput">
      <v-icon size="16" color="#000">mdi-close</v-icon>
    </button>

    <button
      :disabled="
        filterText.length < minLength &&
          filterText.length !== 0 &&
          this.filterText === this.lastFilter
      "
      @click="handleFilter"
      class="filter__button"
      v-ripple
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.99999 11.2533C8.02665 11.4533 7.95999 11.6667 7.80665 11.8067C7.54665 12.0667 7.12665 12.0667 6.86665 11.8067L4.19332 9.13333C4.03999 8.98 3.97332 8.77333 3.99999 8.58V5.16667L0.806653 1.08C0.579986 0.793333 0.63332 0.373333 0.919987 0.146667C1.04665 0.0533334 1.18665 0 1.33332 0H10.6667C10.8133 0 10.9533 0.0533334 11.08 0.146667C11.3667 0.373333 11.42 0.793333 11.1933 1.08L7.99999 5.16667V11.2533ZM2.69332 1.33333L5.33332 4.70667V8.38667L6.66665 9.72V4.7L9.30665 1.33333H2.69332Z"
          fill="var(--mainColor)"
          class="filter__icon"
        />
      </svg>
    </button>
  </div>
</template>

<script>
const MIN_LENGTH = 3;

export default {
  data() {
    return {
      filterText: "",
      lastFilter: "",
      minLength: MIN_LENGTH
    };
  },
  computed: {
    sameFilter() {
      if (!this.lastFilter) return false;
      return this.filterText === this.lastSearch;
    }
  },
  methods: {
    setLastFilter(filter) {
      this.lastFilter = filter;
      localStorage.setItem("filter_value", filter);
    },
    handleFilter() {
      if (this.filterText.length === 0) {
        this.setLastFilter("");
        this.$store.commit("setFilterValue", "");
        return;
      }
      if (this.sameFilter || this.filterText.length < MIN_LENGTH) return;

      this.setLastFilter();
      this.$store.commit("setFilterValue", this.filterText);
    },
    clearInput() {
      this.filterText = "";
      this.setLastFilter("");
      this.$store.commit("setFilterValue", "");
    }
  }
};
</script>

<style lang="scss" scoped>
.filter {
  display: flex;
  align-items: center;
  height: 26px;
  border: 0.5px solid var(--mainColor);
  border-radius: 4px;
  box-sizing: border-box;
  flex: 1 1 auto;

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    margin-right: 3px;
    transition: 0.1s linear;
    border-radius: 100%;
    &:hover {
      opacity: 1;
    }
  }

  &__icon {
    fill: var(--mainColor);
  }

  &:focus-within {
    &.invalid {
      border: 0.5px solid #ff0000;
      box-shadow: 0px 0px 0px 1px #ff0000;
      .filter__button {
        box-shadow: 0px 0px 1px 1px #ff0000;
        border-left: 1px solid #ff0000;
      }
      .filter__icon {
        fill: #ff0000;
      }
    }
    //border: 2px solid var(--mainColor);
    box-shadow: 0px 0px 0px 1px var(--mainColor);
    .filter__button {
      box-shadow: 0px 0px 1px 1px var(--mainColor);
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
  &__button {
    height: 100%;
    width: 26px;
    border-left: 1px solid var(--mainColor);
    flex: 1 0 26px;
    transition: 0.1s linear background;
    &.active {
      background: var(--mainColorHigherOpacity);
    }
    &:not(:disabled):hover {
      background: var(--mainColorHigherOpacity);
    }
  }
}
</style>
