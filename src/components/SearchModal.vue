<template>
  <v-dialog
    height="100vh"
    style="height: 100vh; padding-left: 400px"
    class="search-modal"
    content-class="search-modal"
    v-model="$store.state.searchOpen"
  >
    <div class="wrapper">
      <div class="search-modal__header">
        <div class="search-modal__title">
          {{ $t("search_search") }}
        </div>
        <button @click="closeModal" v-ripple class="search-modal__close round">
          <v-icon color="#fff">mdi-close</v-icon>
        </button>
      </div>
      <div class="search-modal__inputs">
        <div class="search">
          <div class="search__wrapper">
            <div class="search__text">{{ $t("search_search") }}:</div>
            <SearchAutocomplete
              v-model="searchText"
              @search="handleSearch"
              @input="handleTimeoutSearch"
            />
          </div>

          <UIButton
            @click="handleSearch"
            class="search-modal__search"
            accent
            :text="$t('search_find')"
            :disabled="searchText.length < 3 || lastSearch === searchText"
          />
        </div>
      </div>
      <div class="search-modal__body">
        <div class="search-modal__body-header">{{ $t("search_result") }}</div>

        <ResultTable
          class="search-modal__table"
          ref="resultTable"
          :getItems="getSearchResults"
        />
      </div>
      <div class="search-modal__footer">
        <UIButton
          @click="closeModal"
          class="search-modal__cancel"
          :text="$t('search_cancel')"
        />
      </div>
    </div>
  </v-dialog>
</template>

<script>
import UIButton from "@/components/UI/UIButton.vue";
import SearchAutocomplete from "@/components/SearchAutocomplete.vue";
import ResultTable from "@/components/ResultTable.vue";

import { getQueryString } from "@/utils/network";
import axios from "axios";

const LAST_SEARCHES = "lastSearches";
const MIN_LENGTH = "lastSearches";

export default {
  components: {
    UIButton,
    ResultTable,
    SearchAutocomplete
  },
  data() {
    return {
      searchText: "",
      lastSearch: "",
      searchTimer: null
    };
  },
  computed: {
    sameSearch() {
      if (!this.lastSearch) return false;
      return this.searchText === this.lastSearch;
    }
  },
  watch: {
    "$store.state.searchOpen"(newVal) {
      if (newVal) this.searchText = this.lastSearch;
      else clearTimeout(this.searchTimer);
    }
  },
  methods: {
    setLastSearches(search) {
      this.lastSearch = search;
      const localValue = localStorage.getItem(LAST_SEARCHES);
      const savedItems = localValue ? JSON.parse(localValue) : [];
      const newValue = savedItems.includes(search)
        ? savedItems
        : [...savedItems, search];

      localStorage.setItem(LAST_SEARCHES, JSON.stringify(newValue));
    },
    getSearchResults(page, lines) {
      const q = getQueryString({
        findText: this.searchText,
        page: page,
        lines: lines
      });
      this.setLastSearches(this.searchText);
      this.handleTimeoutSearch();

      return axios.get(`Search/TreeSearch?${q}`);
    },

    handleSearch(selectedOption = null) {
      if (this.sameSearch) return;
      if (!selectedOption && this.searchText.length < MIN_LENGTH) return;
      if (selectedOption) this.searchText = selectedOption;
      this.setLastSearches(this.searchText);

      this.$refs.resultTable.refresh();
    },
    closeModal() {
      this.$store.commit("setSearchOpen", false);
    },
    handleTimeoutSearch() {
      clearTimeout(this.searchTimer);
      if (this.sameSearch || this.searchText.length < MIN_LENGTH) return;

      this.searchTimer = setTimeout(() => this.handleSearch(), 3000);
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  background: #fff;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
}
@media all and (max-width: 1100px) {
  .wrapper {
    height: 100vh;
  }
}
.search-modal {
  background: red;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--mainColorDim);
    color: var(--textColorInversed);
    padding: 16px;
  }
  &__title {
    text-transform: uppercase;
  }
  &__inputs {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    background: var(--bgColor);
  }
  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-top: 1px solid #c7c7c7;
    padding: 15px 20px;
    overflow-y: hidden;
    background: var(--bgColor);
  }
  &__table {
    margin-top: 13px;
    border-radius: 1px;
  }
  &__footer {
    position: relative;
    padding: 12px 20px;
    border-top: 1px solid #c7c7c7;
    background: var(--bgColor);
  }
  &__search {
    height: 26px;
    padding: 5px 25px;
    font-size: 14px;
    margin-left: 20px;
  }
  &__cancel {
    background: var(--bgColorInversed);
    color: #000 !important;
  }
}
.search {
  display: flex;
  align-items: center;
  &__wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
<style lang="scss">
// NOTE: this makes dialog be on side of sidebar
// and right under header

.search-modal.v-dialog {
  position: absolute;
  top: 80px;
  overflow-y: unset !important;
  left: 340px;
  box-shadow: none !important;
  transform-origin: unset;
  max-height: 100% !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  width: calc(100% - 360px) !important;

  &__content {
    position: absolute;
  }
}
@media all and (max-width: 1100px) {
  .search-modal.v-dialog {
    width: calc(100% - 0px) !important;
    left: 0px;
    top: 0;
    bottom: 0;
  }
}
</style>
