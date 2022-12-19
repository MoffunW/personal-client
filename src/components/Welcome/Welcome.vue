<template>
  <div :class="$style.root">
    <div class="card" :class="$style.wrapper">
      <div>
        <v-carousel
          class="carousel"
          v-if="items.length"
          height="auto"
          hide-delimiter-background
          :touch="{
            left: () => activeSlide--,
            right: () => activeSlide++
          }"
        >
          <v-carousel-item v-for="item in items" :key="item.id">
            <div :class="$style.item">
              <div v-text="item.text"></div>
              <div>
                <img :src="item.images[0]" alt="" />
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </div>
      <div>CBX</div>
    </div>
  </div>
</template>

<script>
//import axios from "axios";

export default {
  data() {
    return {
      items: []
    };
  },
  methods: {
    setData() {
      const _ = [];
      _.push({
        id: 0,
        text: "123",
        images: [require("@/assets/WelcomeImgs/01.jpg")]
      });
      _.push({
        id: 1,
        text: "555",
        images: [require("@/assets/WelcomeImgs/01.jpg")]
      });
      _.push({
        id: 3,
        text: "123",
        images: [require("@/assets/WelcomeImgs/01.jpg")]
      });
      /*_.push({
        id: 4,
        text: "555",
        images: []
      });
      _.push({
        id: 5,
        text: "123",
        images: []
      });
      _.push({
        id: 6,
        text: "555",
        images: []
      });
      _.push({
        id: 7,
        text: "123",
        images: []
      });
      _.push({
        id: 8,
        text: "555",
        images: []
      });
      _.push({
        id: 9,
        text: "123",
        images: []
      });
      _.push({
        id: 10,
        text: "555",
        images: []
      });
      _.push({
        id: 11,
        text: "123",
        images: []
      });
      _.push({
        id: 12,
        text: "555",
        images: []
      });
      _.push({
        id: 13,
        text: "123",
        images: []
      });
      _.push({
        id: 14,
        text: "555",
        images: []
      });
      _.push({
        id: 15,
        text: "123",
        images: []
      });
      _.push({
        id: 16,
        text: "555",
        images: []
      });*/
      this.items = _;
    }
  },
  mounted() {
    this.setData();
    //https://codepen.io/tomis03/pen/dyMOVqb
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
  margin: 20px 0 0;
}

.item > *:last-child img {
  width: 100%;
}
</style>
