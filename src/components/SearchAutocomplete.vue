<template>
  <div class="search">
    <input class="search__input" />
    <button class="search__close">
      <v-icon size="16" color="#000">mdi-close</v-icon>
    </button>
  </div>
</template>

<script>
export default {
  name: "SearchAutocomplete"
};
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  align-items: center;
  height: 26px;
  border-radius: 4px;
  box-sizing: border-box;
  flex: 1 1 auto;
  border: 0.5px solid var(--mainColor);
  padding-right: 10px;
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
}
</style>
