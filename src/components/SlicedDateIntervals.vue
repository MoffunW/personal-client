<template>
  <!--
  <sliced-date-intervals v-model="date" sliced :range="date.range" />
  sliced mode="time" :range="date.range"
-->

  <div :class="$style.root" class="innerComponents">
    <v-switch
      v-if="sliced"
      v-model="useRange"
      prepend-icon="mdi-arrow-expand-horizontal"
      :disabled="menu"
      @change="reset"
    />
    <v-select
      v-if="sliced"
      :class="$style.sliceSelector"
      :items="slices"
      item-text="key"
      item-value="value"
      :label="$t('trans__timeStep')"
      v-model="selectedSlice"
      :disabled="menu"
      @change="reset"
    />
    <v-menu
      class="menuWrap"
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      absolute
      left
      max-width="280px"
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          :class="$style.dateSelectorWide"
          v-model="displayedDate"
          :label="$t('trans__dateSelect')"
          readonly
          v-bind="attrs"
          v-on="on"
          :style="`width: ${width}px`"
        />
      </template>
      <div v-if="pickerType === 'time'">
        <div :class="$style.timeTitle" v-text="$t('trans__timeFrom')"></div>
        <div :class="$style.timeWrap">
          <v-select v-model="startHour" :items="componentsData.hours" />
          <div>:</div>
          <v-select v-model="startMinute" :items="componentsData.minutes" />
        </div>
        <div v-if="useRange">
          <div :class="$style.timeTitle" v-text="$t('trans__timeTo')"></div>
          <div :class="$style.timeWrap">
            <v-select v-model="endHour" :items="componentsData.hours" />
            <div>:</div>
            <v-select v-model="endMinute" :items="componentsData.minutes" />
          </div>
        </div>
      </div>
      <div v-if="menu">
        <template v-if="pickerType !== 'year'">
          <v-date-picker
            v-if="useRange || multiple"
            v-model="rangedDate"
            :type="pickerType !== 'month' ? 'date' : pickerType"
            no-title
            scrollable
            :range="multiple ? false : useRange"
            :multiple="multiple"
          >
            <v-spacer></v-spacer>
            <v-btn
              class="primaryBtn"
              depressed
              tile
              @click="handleSaveDate(rangedDate, 'ranged')"
            >
              OK
            </v-btn>
          </v-date-picker>
          <v-date-picker
            v-else
            v-model="date"
            :type="pickerType !== 'month' ? 'date' : pickerType"
            no-title
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn
              class="primaryBtn"
              depressed
              tile
              @click="handleSaveDate(date, 'regular')"
            >
              OK
            </v-btn>
          </v-date-picker>
        </template>
        <div v-else>
          <div :class="$style.timeTitle" v-text="$t('trans__selectYear')"></div>
          <div :class="$style.timeWrap">
            <v-select v-model="startYear" :items="componentsData.years" />
            <div v-if="useRange">-</div>
            <v-select
              v-if="useRange"
              v-model="endYear"
              :items="componentsData.years"
            />
          </div>
          <div :class="$style.buttonsWrap">
            <v-btn class="primaryBtn" depressed tile @click="handleSaveDate">
              OK
            </v-btn>
          </div>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script>
export default {
  props: {
    sliced: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: null
    },
    range: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    }
  },
  computed: {
    displayedDate() {
      if (!this.modelDate) return "--:--:--";
      let arr = [];
      let start = null;
      let end = null;
      let endDate = null;
      let endTime = null;
      start = this.modelDate[0].split("T");
      let startDate = start[0].split("-");
      let startTime = start[1].split(":");
      if (this.useRange || this.multiple) {
        end = this.modelDate[1].split("T");
        endDate = end[0].split("-");
        endTime = end[1].split(":");
      }
      if (this.pickerType === "year") {
        arr =
          this.useRange || this.multiple
            ? [startDate[0], endDate[0]]
            : [startDate[0], null];
      } else if (this.pickerType === "month") {
        arr =
          this.useRange || this.multiple
            ? [`${startDate[0]}-${startDate[1]}`, `${endDate[0]}-${endDate[1]}`]
            : [`${startDate[0]}-${startDate[1]}`, null];
      } else if (this.pickerType === "day") {
        arr =
          this.useRange || this.multiple
            ? [
                `${startDate[0]}-${startDate[1]}-${startDate[2]}`,
                `${endDate[0]}-${endDate[1]}-${endDate[2]}`
              ]
            : [`${startDate[0]}-${startDate[1]}-${startDate[2]}`, null];
      } else if (this.pickerType === "time") {
        arr =
          this.useRange || this.multiple
            ? [
                `${startDate[0]}-${startDate[1]}-${startDate[2]} ${startTime[0]}:${startTime[1]}`,
                `${endDate[0]}-${endDate[1]}-${endDate[2]} ${endTime[0]}:${endTime[1]}`
              ]
            : [
                `${startDate[0]}-${startDate[1]}-${startDate[2]} ${startTime[0]}:${startTime[1]}`,
                null
              ];
      }
      return this.useRange || this.multiple ? `${arr[0]} - ${arr[1]}` : arr[0];
    },
    pickerType() {
      if (this.mode) return this.mode;
      let type = "";
      switch (this.selectedSlice) {
        case "day":
          type = "day";
          break;
        case "month":
          type = "month";
          break;
        case "year":
          type = "year";
          break;
        default:
          type = "time";
      }
      return type;
    },
    width() {
      let width = this.elWidth;
      if (this.sliced) return width;
      if (this.range || this.multiple) {
        if (this.pickerType === "year") width = 80;
        if (this.pickerType === "month") width = 130;
        if (this.pickerType === "day") width = 170;
        if (this.pickerType === "time") width = 250;
      } else {
        if (this.pickerType === "year") width = 40;
        if (this.pickerType === "month") width = 60;
        if (this.pickerType === "day") width = 80;
        if (this.pickerType === "time") width = 120;
      }
      return width;
    },
    slices() {
      let arr = this.$store.state.serverSettings.slices;
      if (!arr || !arr.length) return [];
      arr.map(x => (x.key = this.$t(x.key)));
      return arr;
    }
  },
  watch: {
    rangedDate: {
      handler(arg) {
        if (arg && arg.length > 2) this.rangedDate = null;
      },
      immediate: true
    }
  },
  data() {
    return {
      componentsData: {
        currYear: String(new Date().getFullYear()),
        years: [],
        hours: [],
        minutes: []
      },
      elWidth: 250,
      selectedSlice: this.value ? this.value.slice : null,
      useRange: this.range,
      menu: false,
      date: null,
      rangedDate: null,
      startYear: String(new Date().getFullYear()),
      endYear: String(new Date().getFullYear()),
      startHour: "00",
      startMinute: "00",
      endHour: "00",
      endMinute: "00",
      modelDate: this.value ? this.value.date : null
    };
  },
  methods: {
    reset() {
      this.date = null;
      this.rangedDate = null;
      this.startYear = String(new Date().getFullYear());
      this.endYear = String(new Date().getFullYear());
      this.startHour = "00";
      this.startMinute = "00";
      this.endHour = "00";
      this.endMinute = "00";
      this.modelDate = null;
    },

    set() {
      if (!this.value.date) {
        this.reset();
        return;
      }
      this.selectedSlice = this.value.slice
        ? this.value.slice
        : this.slices[0].value;
      let start = this.value.date[0];
      let end = this.value.date[1];
      start = start ? start.split("T") : start;
      end = end ? end.split("T") : end;
      this.startYear = start
        ? start[0].split("-")[0]
        : String(new Date().getFullYear());
      this.endYear = end
        ? end[0].split("-")[0]
        : String(new Date().getFullYear());
      this.startHour = start ? start[1].split(":")[0] : "00";
      this.startMinute = start ? start[1].split(":")[1] : "00";
      this.endHour = end ? end[1].split(":")[0] : "00";
      this.endMinute = end ? end[1].split(":")[1] : "00";
      this.modelDate = this.value.date;
      if (this.pickerType === "month") {
        this.date = start
          ? `${start[0].split("-")[0]}-${start[0].split("-")[1]}`
          : null;
        this.rangedDate = end
          ? [this.date, `${end[0].split("-")[0]}-${end[0].split("-")[1]}`]
          : null;
      } else if (this.pickerType === "day" || this.pickerType === "time") {
        this.date = start
          ? `${start[0].split("-")[0]}-${start[0].split("-")[1]}-${
              start[0].split("-")[2]
            }`
          : null;
        this.rangedDate = end
          ? [
              this.date,
              `${end[0].split("-")[0]}-${end[0].split("-")[1]}-${
                end[0].split("-")[2]
              }`
            ]
          : null;
      }
    },

    handleSaveDate(arg, type = null) {
      let d = new Date().toISOString().split("T")[0];
      if (type === "ranged" && arg) arg[1] = arg[1] ? arg[1] : d;
      arg = arg ? arg : type === "ranged" ? [d, d] : d;
      this.menu = false;
      let startDate = null;
      let endDate = null;
      if (type) {
        startDate = type === "ranged" ? arg[0] : arg;
        endDate = type === "ranged" ? arg[1] : arg;
        startDate = startDate.split("-");
        endDate = endDate.split("-");
        if (this.pickerType === "time") {
          startDate = `${startDate[0]}-${startDate[1]}-${startDate[2]}T${this.startHour}:${this.startMinute}:00`;
          endDate = `${endDate[0]}-${endDate[1]}-${endDate[2]}T${this.endHour}:${this.endMinute}:00`;
        } else if (this.pickerType === "month") {
          startDate = `${startDate[0]}-${startDate[1]}-01T00:00:00`;
          endDate = `${endDate[0]}-${endDate[1]}-01T00:00:00`;
        } else {
          startDate = `${startDate[0]}-${startDate[1]}-${startDate[2]}T00:00:00`;
          endDate = `${endDate[0]}-${endDate[1]}-${endDate[2]}T00:00:00`;
        }
      } else {
        startDate = `${this.startYear}-01-01T00:00:00`;
        endDate = `${this.endYear}-01-01T00:00:00`;
      }
      this.modelDate = [startDate, endDate];
      this.$emit("input", {
        date: this.modelDate,
        slice: this.selectedSlice ? this.selectedSlice : null,
        range: this.useRange
      });
    }
  },
  created() {
    this.set();
  },
  mounted() {
    for (let i = 0; i <= 23; i++) {
      this.componentsData.hours.push(this.$pad(i));
    }
    for (let i = 0; i <= 59; i++) {
      this.componentsData.minutes.push(this.$pad(i));
    }
    for (
      let i = Number(this.componentsData.currYear) - 10;
      i <= Number(this.componentsData.currYear) + 10;
      i++
    ) {
      this.componentsData.years.push(String(i));
    }
  }
};
</script>

<style module>
.root {
  display: inline-flex;
  align-items: center;
}

.root > * + * {
  margin-left: 15px;
}

.timeTitle {
  padding: 0 20px;
  font-size: 0.7em;
}

.timeTitle:first-child {
  margin-top: 10px;
}

.timeWrap {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.timeWrap > * {
  padding: 0;
  margin: 0;
}

.timeWrap > * + * {
  margin-left: 10px;
}

.sliceSelector {
  width: 80px;
}

.dateSelectorWide {
  width: 250px;
}

.buttonsWrap {
  padding: 10px;
  text-align: right;
}

.buttonsWrap > * + * {
  margin-left: 10px;
}
</style>
