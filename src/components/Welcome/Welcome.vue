<template>
  <div :class="$style.root">
    <div class="card" :class="$style.wrapper" v-click-outside="handleHide">
      <div>
        <v-carousel
          class="carousel"
          ref="carousel"
          height="100%"
          hide-delimiter-background
          :touch="{
            left: () => handleSetSlide(false),
            right: () => handleSetSlide(true)
          }"
        >
          <template v-slot:prev="{ on, attrs }">
            <v-btn :class="$style.prev" v-bind="attrs" v-on="on"></v-btn>
          </template>
          <template v-slot:next="{ on, attrs }">
            <v-btn :class="$style.next" v-bind="attrs" v-on="on"></v-btn>
          </template>
          <v-carousel-item v-for="item in items" :key="item.id" eager>
            <div :class="$style.item">
              <div :class="$style.itemText" v-text="item.text"></div>
              <div>
                <v-img :src="item.images[0]" alt="" eager />
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </div>
      <div :class="$style.buttonsWrap">
        <v-checkbox
          :class="$style.checkbox"
          :label="$t('trans__welcomeDontShow')"
          @change="handleShow"
        />
        <v-btn
          class="primaryBtn"
          :class="$style.field"
          depressed
          tile
          @click="handleHide"
        >
          {{ $t("trans__welcomeClose") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      items: [],
      offset: 0
    };
  },
  methods: {
    setListeners(arg) {
      arg.addEventListener("mousedown", this.handleDown);
      document.addEventListener("mouseup", this.handleUp);
    },

    handleDown(arg) {
      if (!arg.target.closest(`.${this.$style.item}`) || arg.button != 0)
        return;
      arg.preventDefault();
      arg.stopPropagation();
      this.offset = arg.x;
    },

    handleUp(arg) {
      if (!arg.target.closest(`.${this.$style.item}`) || arg.button != 0)
        return;
      arg.preventDefault();
      arg.stopPropagation();
      if (this.offset !== arg.x) this.handleSetSlide(this.offset < arg.x);
    },

    handleSetSlide(arg) {
      const _ = this.$refs.carousel.$el;
      if (
        !_.querySelector(`.${this.$style.prev}`) ||
        !_.querySelector(`.${this.$style.next}`)
      )
        return;
      arg
        ? _.querySelector(`.${this.$style.prev}`).click()
        : _.querySelector(`.${this.$style.next}`).click();
    },

    removeEvs(arg) {
      arg.removeEventListener("mousedown", this.handleDown);
      document.removeEventListener("mouseup", this.handleUp);
    },

    async handleShow(arg) {
      try {
        await axios.post("ServerSettings/SetShowWelcome", { Show: !arg });
      } catch (e) {
        this.$message.error("err_some_error");
      }
    },

    handleHide() {
      this.$store.commit("setShowWelcome", false);
    },

    setData() {
      const _ = [];
      _.push({
        id: 0,
        text: this.$t("trans__welcomeText01"),
        images: [require("@/assets/WelcomeImgs/01.png")]
      });
      _.push({
        id: 1,
        text: this.$t("trans__welcomeText02"),
        images: [require("@/assets/WelcomeImgs/02.png")]
      });
      _.push({
        id: 2,
        text: this.$t("trans__welcomeText03"),
        images: [require("@/assets/WelcomeImgs/03.png")]
      });
      _.push({
        id: 3,
        text: this.$t("trans__welcomeText04"),
        images: [require("@/assets/WelcomeImgs/04.png")]
      });
      _.push({
        id: 4,
        text: this.$t("trans__welcomeText05"),
        images: [require("@/assets/WelcomeImgs/05.png")]
      });
      _.push({
        id: 5,
        text: this.$t("trans__welcomeText06"),
        images: [require("@/assets/WelcomeImgs/06.png")]
      });
      _.push({
        id: 6,
        text: this.$t("trans__welcomeText07"),
        images: [require("@/assets/WelcomeImgs/07.png")]
      });
      _.push({
        id: 7,
        text: this.$t("trans__welcomeText08"),
        images: [require("@/assets/WelcomeImgs/08.png")]
      });
      _.push({
        id: 8,
        text: this.$t("trans__welcomeText09"),
        images: [require("@/assets/WelcomeImgs/09.png")]
      });
      _.push({
        id: 9,
        text: this.$t("trans__welcomeText10"),
        images: [require("@/assets/WelcomeImgs/10.png")]
      });
      _.push({
        id: 10,
        text: this.$t("trans__welcomeText11"),
        images: [require("@/assets/WelcomeImgs/11.png")]
      });

      /*_.push({
        id: 0,
        text: this.$t("trans__welcomeText1"),
        images: [require("@/assets/WelcomeImgs/01.gif")]
      });
      _.push({
        id: 1,
        text: this.$t("trans__welcomeText2"),
        images: [require("@/assets/WelcomeImgs/02.gif")]
      });
      _.push({
        id: 3,
        text: this.$t("trans__welcomeText3"),
        images: [require("@/assets/WelcomeImgs/03.gif")]
      });
      _.push({
        id: 4,
        text: this.$t("trans__welcomeText4"),
        images: [require("@/assets/WelcomeImgs/04.gif")]
      });*/
      this.items = _;
    }
  },
  mounted() {
    this.setData();
    this.setListeners(this.$refs.carousel.$el);
  },
  beforeDestroy() {
    this.removeEvs(this.$refs.carousel.$el);
  }
};
</script>

<style module>
.root {
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.wrapper {
  height: auto !important;
  max-width: 800px !important;
}

.wrapper > *:first-child {
  border: none !important;
  padding: 0 !important;
}

.wrapper > *:first-child > * > *:last-child {
  position: static;
  height: auto !important;
}

.wrapper > *:first-child > * > *:last-child > * {
  width: 100%;
  padding: 10px 0;
  text-align: center;
}

.wrapper > *:first-child > * > *:last-child > * > * {
  display: inline;
  margin: 0;
}

.item > *:first-child {
  padding: 0 20px;
  text-align: justify;
}

.item > *:last-child {
  margin: 10px 0 0;
}

.item > *:last-child img {
  width: 100%;
}

.itemText {
  display: flex;
  align-items: center;
  height: 50px;
}

.prev {
  display: none !important;
}

.next {
  display: none !important;
}

.buttonsWrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.buttonsWrap > *:last-child {
  margin: 0 !important;
}
</style>
