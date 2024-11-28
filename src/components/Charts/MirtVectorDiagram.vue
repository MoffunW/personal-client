<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${size} ${size}`"
    height="270"
  >
    <g @mouseenter="showToolTip" @mouseleave="hideToolTip">
      <text
        :x="halfSize"
        y="26"
        font-size="13"
        text-anchor="middle"
        v-text="`${correctAngle(0 - startAngle)}°`"
        class="vectorColorText"
      ></text>
      <text
        :x="size - 27"
        :y="halfSize"
        dy="5"
        font-size="13"
        text-anchor="start"
        v-text="`${correctAngle(90 - startAngle)}°`"
        class="vectorColorText"
      ></text>
      <text
        :x="halfSize"
        :y="size - 16"
        font-size="13"
        text-anchor="middle"
        v-text="`${correctAngle(180 - startAngle)}°`"
        class="vectorColorText"
      ></text>
      <text
        x="27"
        :y="halfSize"
        dy="5"
        font-size="13"
        text-anchor="end"
        v-text="`${correctAngle(270 - startAngle)}°`"
        class="vectorColorText"
      ></text>
      <line
        stroke-width="1"
        stroke="#ccc"
        x1="30"
        :y1="halfSize"
        :x2="size - 30"
        :y2="halfSize"
      />
      <line
        stroke-width="1"
        stroke="#ccc"
        :x1="halfSize"
        y1="30"
        :x2="halfSize"
        :y2="size - 30"
      />
      <circle
        :r="radius"
        :cx="halfSize"
        :cy="halfSize"
        fill="transparent"
        class="vectorColor"
      />
      <path
        v-for="vector in vectors"
        stroke="transparent"
        :key="vector.label"
        :class="
          vector.active ? [$style.arrow, $style.arrowActive] : $style.arrow
        "
        :fill="vector.color"
        :d="vector.path"
        :transform="`rotate(${vector.angle}, ${halfSize}, ${halfSize})`"
        @mouseenter="vector.active = true"
        @mouseleave="vector.active = false"
      />
    </g>
    <g :transform="`scale(1)`" :class="$style.rectWrap">
      <g
        v-for="(vector, index) in vectors"
        :key="vector.label"
        :class="
          vector.active ? [$style.legend, $style.legendActive] : $style.legend
        "
        @mouseenter="vector.active = true"
        @mouseleave="vector.active = false"
      >
        <rect
          x="0"
          :y="index * 20"
          :width="20 + vector.label.length * 12"
          height="20"
          fill="transparent"
        ></rect>
        <text
          x="20"
          :y="index * 20"
          dy="13"
          font-size="16"
          v-text="vector.label"
          class="vectorColorText"
        ></text>
        <rect
          x="0"
          :y="index * 20"
          width="15"
          height="15"
          :fill="vector.color"
        ></rect>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    date: {
      type: String,
      required: true
    }
  },
  watch: {
    data: {
      handler(arg) {
        if (arg.values) {
          this.drawVectors();
          this.buildToolTip();
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      startAngle: 0,
      size: 300,
      halfSize: 150,
      radius: 120,
      vectors: [],
      toolTip: null,
      isToolTipActive: false
    };
  },
  methods: {
    radToDeg(arg) {
      return arg * (180 / Math.PI);
    },

    getPhiForTopStart(powerFactor, activePower, reactivePower) {
      if (activePower >= 0 && reactivePower >= 0)
        return this.radToDeg(-Math.acos(powerFactor));
      if (activePower < 0 && reactivePower >= 0)
        return this.radToDeg(-Math.acos(-powerFactor));
      if (activePower < 0 && reactivePower < 0)
        return this.radToDeg(Math.acos(-powerFactor));
      if (activePower >= 0 && reactivePower < 0)
        return this.radToDeg(Math.acos(powerFactor));
      return 0;
    },

    getPhiForRightStart(powerFactor, activePower, reactivePower) {
      if (activePower >= 0 && reactivePower >= 0)
        return this.radToDeg(Math.acos(powerFactor));
      if (activePower < 0 && reactivePower >= 0)
        return this.radToDeg(-Math.acos(-powerFactor));
      if (activePower < 0 && reactivePower < 0)
        return this.radToDeg(Math.acos(-powerFactor));
      if (activePower >= 0 && reactivePower < 0)
        return this.radToDeg(-Math.acos(powerFactor));
      return 0;
    },

    drawVectors() {
      function isNotNullOrUndefined(array) {
        return array.every(value => value !== undefined && value !== null);
      }

      this.vectors = [];
      switch (this.data.numberOfPhases) {
        case 1:
          this.addVector(0, "U", "#ff7961");
          if (
            isNotNullOrUndefined([
              this.data.values.chartCosPhi.values[0],
              this.data.values.totalActivePower.values[0],
              this.data.values.totalReactivePower.values[0]
            ])
          )
            this.addVector(
              this.getPhiForTopStart(
                Number(this.data.values.chartCosPhi.values[0]),
                Number(this.data.values.totalActivePower.values[0]),
                Number(this.data.values.totalReactivePower.values[0])
              ),
              "I",
              "#f44336",
              0.6
            );
          break;
        case 3:
          this.addVector(0, "Ua", "#fff350");
          if (
            isNotNullOrUndefined([
              this.data.values.cosPhi.values[0],
              this.data.values.activePower.values[0],
              this.data.values.reactivePower.values[0]
            ])
          )
            this.addVector(
              this.getPhiForRightStart(
                Number(this.data.values.cosPhi.values[0]),
                Number(this.data.values.activePower.values[0]),
                Number(this.data.values.reactivePower.values[0])
              ),
              "Ia",
              "#ffc107",
              0.6
            );

          if (isNotNullOrUndefined([this.data.values.phaseAngleAB.values[0]]))
            this.addVector(
              Number(this.data.values.phaseAngleAB.values[0]),
              "Ub",
              "#bef67a"
            );
          if (
            isNotNullOrUndefined([
              this.data.values.cosPhi.values[1],
              this.data.values.activePower.values[1],
              this.data.values.reactivePower.values[1],
              this.data.values.phaseAngleAB.values[0]
            ])
          )
            this.addVector(
              this.getPhiForRightStart(
                Number(this.data.values.cosPhi.values[1]),
                Number(this.data.values.activePower.values[1]),
                Number(this.data.values.reactivePower.values[1])
              ) + Number(this.data.values.phaseAngleAB.values[0]),
              "Ib",
              "#8bc34a",
              0.6
            );
          if (isNotNullOrUndefined([this.data.values.phaseAngleAC.values[0]]))
            this.addVector(
              Number(this.data.values.phaseAngleAC.values[0]),
              "Uc",
              "#ff7961"
            );

          if (
            isNotNullOrUndefined([
              this.data.values.cosPhi.values[2],
              this.data.values.activePower.values[2],
              this.data.values.reactivePower.values[2],
              this.data.values.phaseAngleAC.values[0]
            ])
          )
            this.addVector(
              this.getPhiForRightStart(
                Number(this.data.values.cosPhi.values[2]),
                Number(this.data.values.activePower.values[2]),
                this.data.values.reactivePower.values[2]
              ) + Number(this.data.values.phaseAngleAC.values[0]),
              "Ic",
              "#f44336",
              0.6
            );
          break;
      }
    },

    addVector(angle, label, color, ratio = 1) {
      angle = angle + this.startAngle;
      let length = this.radius * ratio;
      let arrowHeight = 20;
      if (arrowHeight > length) arrowHeight = length;
      let path = `M${this.halfSize} ${this.halfSize}h-1l-2 -${length -
        arrowHeight}h-5l8 -${arrowHeight}l8 ${arrowHeight}h-5l-2 ${length -
        arrowHeight}z`;
      this.vectors.push({
        label,
        color,
        path,
        angle,
        active: false
      });
    },

    getLegendCssClasses(vector) {
      let classes = [this.$style.legend];
      if (vector.active) classes.push(this.$style.legend_active);
      return classes;
    },

    correctAngle(angle) {
      while (angle < 0) {
        angle += 360;
      }
      return angle;
    },

    buildToolTip() {
      if (this.toolTip) return;
      const el = document.createElement("div");
      el.classList.add(this.$style.toolTipWrap);
      el.classList.add("vectorToolTip");
      let str = `<table>
        <thead>
          <tr>
            <th colspan="2">${this.date}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${this.$t("trans__chartCosPhi")}</td>
            <td>${this.data.values.chartCosPhi.values[0]}</td>
          </tr>`;
      if (this.data.numberOfPhases === 3)
        str += `  <tr>
                    <td>${this.$t("trans__cosPhiA")}</td>
                    <td>${this.data.values.cosPhi.values[0]}</td>
                  </tr>
                  <tr>
                    <td>${this.$t("trans__cosPhiB")}</td>
                    <td>${this.data.values.cosPhi.values[1]}</td>
                  </tr>
                  <tr>
                    <td>${this.$t("trans__cosPhiC")}</td>
                    <td>${this.data.values.cosPhi.values[2]}</td>
                  </tr>
                  <tr>
                    <td>${this.$t("trans__phaseAngleAB")}</td>
                    <td>${this.data.values.phaseAngleAB.values[0]}°</td>
                  </tr>
                  <tr>
                    <td>${this.$t("trans__phaseAngleAC")}</td>
                    <td>${this.data.values.phaseAngleAC.values[0]}°</td>
                  </tr>`;
      str += `</tbody></table>`;
      el.innerHTML = str;
      document.body.append(el);
      this.toolTip = el;
    },

    showToolTip() {
      this.isToolTipActive = true;
      this.toolTip.classList.add(this.$style.toolTipActive);
    },

    hideToolTip() {
      this.isToolTipActive = false;
      this.toolTip.classList.remove(this.$style.toolTipActive);
    },

    move(x, y) {
      const _ = document.querySelector(`.${this.$style.toolTipWrap}`);
      if (!_) return;
      _.style.left = `${x + 15}px`;
      _.style.top = `${y + 15}px`;
    },

    handleMoveEvent(e) {
      if (!this.isToolTipActive) return;
      this.move(e.pageX - window.scrollX, e.pageY - window.scrollY);
    }
  },
  mounted() {
    this.$el.addEventListener("mousemove", this.handleMoveEvent);
  },
  beforeDestroy() {
    const _ = document.querySelector(`.${this.$style.toolTipWrap}`);
    if (_) _.remove();
    this.toolTip = null;
    this.$el.removeEventListener("mousemove", this.handleMoveEvent);
  }
};
</script>

<style module>
.rectWrap {
  display: inline;
}

.toolTipWrap {
  position: fixed;
  opacity: 0;
  font-size: 12px;
  border-radius: 4px;
  z-index: -1;
  overflow: hidden;
  transition: all 0.2s ease-in-out 0s;
}

.toolTipActive {
  opacity: 1;
  z-index: 1000;
}

.toolTipWrap table {
  width: 100%;
  border-spacing: 1px;
  text-align: center;
}

.toolTipWrap th,
.toolTipWrap td {
  white-space: nowrap;
  padding: 5px 15px;
}

.toolTipWrap td:first-child {
  text-align: left;
}

.arrow,
.legend {
  cursor: pointer;
}

.arrow,
.legend text {
  transition: all 0.2s ease-in-out 0s;
}

.arrowActive {
  stroke: red;
}

.legendActive text {
  fill: red !important;
}
</style>
