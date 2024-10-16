<template>
  <v-dialog
    height="100vh"
    style="height: 100vh; padding-left: 400px"
    class="search-modal"
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
            <SearchAutocomplete v-model="searchText" @search="handleSearch" />
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
        <div class="search-modal__body-header">{{ $t("search_results") }}</div>

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

export default {
  components: {
    UIButton,
    ResultTable,
    SearchAutocomplete
  },
  data() {
    return {
      searchText: "",
      lastSearch: ""
    };
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

      return axios.get(`Search/TreeSearch?${q}`);
    },
    handleSearch(selectedOption = null) {
      if (selectedOption) this.searchText = selectedOption;
      this.$refs.resultTable.refresh();
    },
    closeModal() {
      this.$store.commit("setSearchOpen", false);
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
  }
  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-top: 1px solid #c7c7c7;
    padding: 15px 20px;
    overflow-y: hidden;
  }
  &__table {
    margin-top: 13px;
    border-radius: 1px;
  }
  &__footer {
    position: relative;
    padding: 12px 20px;
    border-top: 1px solid #c7c7c7;
  }
  &__search {
    height: 26px;
    padding: 5px 25px;
    font-size: 14px;
    margin-left: 20px;
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
.v-dialog {
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
  .v-dialog {
    width: calc(100% - 0px) !important;
    left: 0px;
    top: 0;
    bottom: 0;
  }
}
</style>
