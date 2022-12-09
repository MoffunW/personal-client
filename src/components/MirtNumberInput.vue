<template>
  <v-text-field
    :class="`numberInput${inputClass}`"
    v-model="val"
    :label="label"
    :error-messages="error"
    append-outer-icon="mdi-plus-box-outline"
    prepend-icon="mdi-minus-box-outline"
    @click:append-outer="increment"
    @click:prepend="decrement"
    @input="check"
    @blur="fixValue"
    hide-details="auto"
    :key="key"
/></template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    },
    label: {
      type: String,
      default: ""
    }
  },
  computed: {
    disableMinus() {
      return this.val === this.min || this.min === this.max;
    },
    disablePlus() {
      return this.val === this.max || this.min === this.max;
    },
    inputClass() {
      let _ = "";
      if (this.disablePlus) _ = " disablePlus";
      if (this.disableMinus) _ = " disableMinus";
      if (this.disableMinus && this.disablePlus)
        _ = " disableMinus disablePlus";
      return _;
    },
    error() {
      return this.val > this.max
        ? `${this.$t("trans__errorMaxValue")}: ${this.max}`
        : "";
    }
  },
  watch: {
    value: {
      handler(arg) {
        this.val = arg;
      },
      immediate: true
    }
  },
  data() {
    return {
      val: 0,
      key: 0
    };
  },
  methods: {
    increment() {
      this.val = +this.val + this.step;
      this.val = this.val > this.max ? this.max : this.val;
      this.$emit("input", Number(this.val));
    },

    decrement() {
      this.val = this.val - this.step;
      this.val = this.val < this.min ? this.min : this.val;
      this.$emit("input", Number(this.val));
    },

    check() {
      if (isNaN(this.val)) {
        this.val = this.value;
        this.key = new Date().getTime();
      }
    },

    fixValue() {
      let val = this.val;
      val = val > this.max ? this.value : val;
      val = val < this.min ? this.value : val;
      val = isNaN(val) ? this.value : val;
      this.val = val;
      this.$emit("input", Number(this.val));
    }
  }
};
</script>
