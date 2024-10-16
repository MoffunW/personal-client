<template>
  <button
    @click="$emit('click')"
    v-ripple
    class="button"
    :class="{ accent: accent }"
  >
    {{ text }}
  </button>
</template>

<script>
export default {
  props: {
    text: String,
    accent: {
      default: false,
      type: Boolean
    }
  }
};
</script>

<style lang="scss" scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 29px;
  font-size: 15px;
  line-height: 17px !important;
  font-weight: 400 !important;
  &.accent {
    background: var(--mainColor);
    color: var(--textColorInversed);
    border-color: var(--mainColor);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>
