<template>
  <v-dialog class="search-modal" v-model="searchOpen">
    <div class="wrapper">
      <div class="search-modal__header">
        <div class="search-modal__title">ПОИСК</div>
        <button v-ripple class="search-modal__close round">
          <v-icon color="#fff">mdi-close</v-icon>
        </button>
      </div>
      <div class="search-modal__inputs">
        <div class="search">
          <div class="search__wrapper">
            <div class="search__text">Поиск:</div>
            <SearchAutocomplete />
          </div>

          <UIButton class="search-modal__search" accent text="Найти" />
        </div>
      </div>
      <div class="search-modal__body">test body</div>
      <div @click="handleSearch" class="search-modal__footer">
        <UIButton class="search-modal__cancel" text="Отменить" />
      </div>
    </div>
  </v-dialog>
</template>

<script>
import UIButton from "@/components/UI/UIButton.vue";
import SearchAutocomplete from "@/components/SearchAutocomplete.vue";
import { getQueryString } from "@/utils/network";
import axios from "axios";

export default {
  components: {
    UIButton,
    SearchAutocomplete
  },
  data() {
    return {
      searchOpen: true
    };
  },
  methods: {
    async handleSearch() {
      try {
        // await axios.post("v1/Search/TreeSearch", {
        //   findText: this.findText,
        //   page: this.currentPage,
        //   lines: this.linesPerPage
        // });

        const q = getQueryString({
          findText: "111",
          page: 0,
          lines: 10
        });
        await axios.get(`Search/TreeSearch?${q}`);
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  background: #fff;
}
.search-modal {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--mainColorDim);
    color: var(--textColorInversed);
    padding: 16px;
  }
  &__inputs {
    display: flex;
    align-items: center;
    padding: 10px 20px;
  }
  &__body {
    height: 600px;
    border-top: 1px solid #c7c7c7;
  }
  &__footer {
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
