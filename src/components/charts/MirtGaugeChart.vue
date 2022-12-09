<template>
  <div :class="$style.root">
    <canvas :class="$style.canvas" :height="`${size}px`" :width="`${size}px`" />
    <div :class="$style.start">
      0
    </div>
    <div :class="$style.end" v-text="limit.toLocaleString()"></div>
    <div :class="$style.info">
      <div v-text="disp"></div>
      <div v-text="units"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      required: true
    },
    limit: {
      type: Number,
      default: 0
    },
    units: {
      type: String,
      required: true
    },
    getColor: {
      type: Function,
      required: true
    },
    defaultColor: {
      type: String,
      required: true
    }
  },
  computed: {
    percent() {
      if (!this.value) return 0;
      const p = (100 * this.value) / this.limit;
      return p > 100 ? 100 : p;
    },
    disp() {
      let d =
        this.value - (this.value * (this.percent - this.percentVal)) / 100;
      d =
        d > 0
          ? parseFloat(d.toFixed(2))
          : parseFloat(this.percentVal.toFixed(2));
      return isNaN(d) ? 0 : d;
    },
    color() {
      return {
        chartColor: this.getColor(this.percentVal),
        marker: this.getColor(this.percent)
      };
    }
  },
  watch: {
    percent: {
      handler() {
        this.percentVal = this.percent;
        this.animate();
      },
      immediate: true
    }
  },
  data() {
    return {
      ctx: null,
      pi: Math.PI,
      size: 240,
      radius: 110,
      min: 0,
      max: 0,
      percentVal: 0
    };
  },
  methods: {
    animate() {
      this.percentVal = 0;
      setTimeout(() => {
        let step = 2;
        let val = 0;
        let interval = setInterval(() => {
          val = val + step;
          if (val >= this.percent) clearInterval(interval);
          this.percentVal = val > this.percent ? this.percent : val;
          let offset = (this.percent - this.percentVal) / 10;
          step = offset <= 0.01 ? 1 : offset;
          this.drawChart();
        }, 0);
      }, 0);
    },

    drawArc(color = this.defaultColor, max = 0) {
      this.ctx.beginPath();
      this.ctx.arc(
        this.radius + 10,
        this.radius + 10,
        this.radius,
        this.pi * 0.7,
        max
      );
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 15;
      this.ctx.stroke();
    },

    drawChart() {
      this.ctx.clearRect(0, 0, this.size, this.size);
      this.drawArc(this.defaultColor, this.max);
      this.drawArc(
        this.color.chartColor,
        this.min + ((this.max - this.min) * this.percentVal) / 100
      );
    },

    init() {
      this.ctx = document
        .querySelector(`.${this.$style.canvas}`)
        .getContext("2d");
      this.min = this.pi * 0.7;
      this.max = this.pi * 2 + this.pi * 0.3;
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style module>
.root {
  position: relative;
  height: 240px;
  width: 240px;
  margin: 0 auto 0;
}

.canvas {
  display: block;
}

.root > div {
  position: absolute;
  z-index: 1;
}

.info {
  top: 33%;
  left: 0;
  right: 0;
  text-align: center;
}

.info > div:first-child {
  font-weight: 700 !important;
  font-size: 28px;
  line-height: 42px;
}

.info > div:last-child {
  font-weight: 700 !important;
  font-size: 14px;
  line-height: 16px;
}

.start,
.end {
  top: 216px;
  font-size: 16px;
}

.start {
  left: 62px;
}

.end {
  width: 130px;
  text-align: center;
  right: 0;
}
</style>
