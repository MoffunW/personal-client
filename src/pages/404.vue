<template>
  <div :class="$style.root">
    <div :class="$style.wrapper">
      <div class="text404">404</div>
      <div class="text404" v-text="$t('trans__404Text')">
        Страница не найдена
      </div>
      <div class="bg404"></div>
      <div class="bg404"></div>
      <img src="@/assets/404.svg" alt="" />
    </div>
  </div>
</template>

<style module>
.root {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.wrapper {
  position: relative;
}

.wrapper > img {
  position: relative;
  height: 22.5em;
  width: auto;
  z-index: 1;
}

.wrapper > div {
  position: absolute;
}

.wrapper > div:first-child,
.wrapper > div:nth-child(2) {
  top: 200px;
  width: 100%;
  text-align: center;
  z-index: 2;
}

.wrapper > div:first-child {
  top: 0.85em;
  font-weight: 700;
  font-size: 8em;
}

.wrapper > div:nth-child(2) {
  top: 8.2em;
  font-weight: 700;
  font-size: 2em;
}

.wrapper > div:nth-child(3) {
  left: 11.8em;
  top: 0.3em;
  width: 2.5em;
  height: 2.5em;
  border-radius: 50%;
}

.wrapper > div:nth-child(4) {
  left: 0;
  top: 8em;
  width: 100%;
  height: 13.5em;
  border-radius: 2em;
}

@media all and (max-width: 450px) {
  .wrapper {
    font-size: 3vw;
  }
}
</style>
