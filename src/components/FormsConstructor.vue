<script>
import r from "vue/dist/vue.esm";
export default {
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    types: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dict: {
        "frxDCtrl.TfrxComboBoxControl": "select",
        "frxDCtrl.TfrxRadioButtonControl": "radio",
        "frxDCtrl.TfrxDateEditControl": "calendar",
        "frxDCtrl.TfrxCheckBoxControl": "checkbox",
        "frxDCtrl.TfrxEditControl": "inputText",
        "frxDCtrl.TfrxCheckListBoxControl": "multiSelect",
        "frxDCtrl.TfrxListBoxControl": "select",
        "frxDCtrl.TfrxLabelControl": "label"
      },
      elements: {},
      rbs: {},
      menus: {},
      obj: null,
      html: "",
      template: undefined,
      selectedType: null
    };
  },
  watch: {
    value: {
      handler(arg) {
        if (arg) {
          this.obj = JSON.parse(JSON.stringify(this.value));
          this.init();
        } else {
          this.obj = null;
        }
      },
      immediate: true
    },
    html() {
      this.render();
    }
  },
  methods: {
    handleSave() {
      if (!this.obj.DialogControls || !this.obj.DialogControls.length) return;
      const params = { ...this.elements, ...this.rbs };
      this.obj.DialogControls.forEach(x => {
        if (this.dict[x.ControlType]) {
          if (x.ControlValue === "True") x.ControlValue = "False";
          let val =
            Object.values(params).find(
              y => y[0] && y[0].name === x.ControlName
            ) || Object.values(params).includes(x.ControlName);
          if (Array.isArray(val)) val = val[0].value;
          val = val === false || val === true ? (val ? "True" : "False") : val;
          const valInArray =
            Array.isArray(x.DefaultKeys) && !!x.DefaultKeys.length;
          x.ControlValue = val;
          if (x.ControlType === "frxDCtrl.TfrxDateEditControl") {
            const d = val.split("-");
            x.ControlValue = `${d[2]}.${d[1]}.${d[0]}`;
          }
          if (valInArray) {
            let arr = [];
            if (Array.isArray(val)) {
              val.forEach(y => {
                let result = x.DefaultKeys.findIndex(z => z === y);
                if (result != -1) arr.push(result);
              });
            } else {
              let result = x.DefaultKeys.findIndex(y => y === val);
              if (result != -1) arr.push(result);
            }
            x.ControlValue = arr.join();
            x.DefaultValues = arr;
          }
        }
      });
      this.$emit("input", { formData: this.obj, fileType: this.selectedType });
    },

    render() {
      const compiled = r.compile(this.html);
      this.template = compiled.render;
      this.$options.staticRenderFns = [];
      for (const x of compiled.staticRenderFns)
        this.$options.staticRenderFns.push(x);
    },

    findElProps(arg) {
      let obj = {};
      let r = null;
      Object.keys(this.elements).forEach(x => {
        r = this.elements[x].find(y => y.name == arg);
        if (r)
          obj = {
            key: x,
            val: r
          };
      });
      return obj ? obj : null;
    },

    getHTMLcomponents(arg) {
      let str = "";
      if (!arg.childs || !arg.childs.length) return str;
      const isRadio =
        arg.childs[0].ControlType &&
        arg.childs[0].ControlType === "frxDCtrl.TfrxRadioButtonControl";
      const hasRadio = arg.childs.find(
        x => x.ControlType === "frxDCtrl.TfrxRadioButtonControl"
      );
      if (isRadio || hasRadio)
        str = hasRadio
          ? `<v-radio-group v-model="rbs['form']">`
          : `<v-radio-group v-model="rbs['${arg.childs[0].Parent}']">`;
      arg.childs.forEach(x => {
        const obj = this.findElProps(x.ControlName);
        if (obj) {
          switch (obj.val.type) {
            case "select":
              str += `<v-select v-model="elements['${obj.val.name}'][0].value" :items="elements['${obj.val.name}'][0].values" label="${obj.val.label}" />`;
              break;
            case "checkbox":
              str += `<v-checkbox v-model="elements['${obj.val.name}'][0].value" label="${obj.val.label}" />`;
              break;
            case "inputText":
              str += `<v-text-field v-model="elements['${obj.val.name}'][0].value" label="${obj.val.label}" hide-details="auto" />`;
              break;
            case "multiSelect":
              str += `<v-select v-model="elements['${obj.val.name}'][0].value" :items="elements['${obj.val.name}'][0].values" label="${obj.val.label}" multiple>
                        <template v-slot:selection="{ item, index }">
                          <v-chip v-if="index === 0">
                            <span>{{ item }}</span>
                          </v-chip>
                          <span
                            v-if="index === 1"
                            
                          >
                            (+{{ elements['${obj.val.name}'][0].value.length - 1 }})
                          </span>
                        </template>
                      </v-select>`;
              break;
            case "calendar":
              if (!this.menus[obj.val.name])
                this.$set(this.menus, obj.val.name, false);
              str += `<v-menu :ref="'${obj.val.name}'" v-model="menus['${obj.val.name}']" :close-on-content-click="false" :return-value.sync="elements['${obj.val.name}'][0].value" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="elements['${obj.val.name}'][0].value"
                            label="${obj.val.label}"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          />
                        </template>
                        <v-date-picker
                          v-model="elements['${obj.val.name}'][0].value"
                          no-title
                          scrollable
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            class="primaryBtn"
                            depressed
                            tile
                            @click="$refs['${obj.val.name}'].save(elements['${obj.val.name}'][0].value)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-menu>`;
              break;
            case "label":
              str += `<label v-text="'${obj.val.label}'" />`;
              break;
            case "radio":
              str += `<v-radio key="${obj.key}${obj.val.name}" label="${obj.val.label}" value="${obj.val.name}" />`;
              break;
          }
        }
      });
      if (isRadio || hasRadio) str += `</v-radio-group>`;
      return str;
    },

    fixCaption(arg) {
      return arg.replace(/"/g, "&quot;");
    },

    init() {
      if (
        !this.obj ||
        !this.obj.DialogControls ||
        !this.obj.DialogControls.length
      )
        return;
      if (this.types.length) this.$set(this, "selectedType", this.types[0]);
      let objList = JSON.parse(JSON.stringify(this.obj.DialogControls));
      let tmp = {};
      let els = {};
      let str = `<div :class="$style.root">
        <div>
          <span v-text="$t('trans__configureReport')"></span>
          <v-icon @click="$emit('cancel')">
            mdi-arrow-left
          </v-icon>
        </div>
        <div><div>`;
      objList.forEach(x => {
        if (this.dict[x.ControlType]) {
          if (!x.Parent) x.Parent = "form";
          if (!tmp[x.Parent]) tmp[x.Parent] = [];
          let p = objList.find(y => y.ControlName === x.Parent);
          if (!els[x.Parent]) els[x.Parent] = p ? p : {};
          tmp[x.Parent].push(x);
          els[x.Parent].childs = tmp[x.Parent];
        }
      });
      Object.keys(els).forEach(x => {
        const obj = els[x];
        let value = null;
        if (obj.childs && obj.childs.length) {
          obj.childs.forEach(y => {
            const isArray =
              Array.isArray(y.DefaultKeys) && y.DefaultKeys.length > 1;
            value =
              y.ControlValue === "True" || y.ControlValue === "False"
                ? y.ControlValue === "True"
                : y.ControlValue;
            if (isArray) {
              const arr = [];
              y.DefaultValues.forEach(z => arr.push(y.DefaultKeys[z]));
              value = arr.length > 1 ? arr : arr[0];
            }
            if (y.ControlType === "frxDCtrl.TfrxDateEditControl") {
              const d = value.split(".");
              value = `${d[2]}-${d[1]}-${d[0]}`;
            }
            let obj = {
              name: y.ControlName,
              label: this.fixCaption(y.Caption),
              value,
              values: y.DefaultKeys,
              type: this.dict[y.ControlType]
            };
            if (y.ControlType === "frxDCtrl.TfrxRadioButtonControl") {
              if (!this.elements[y.Parent])
                this.$set(this.elements, y.Parent, []);
              this.elements[y.Parent].push(obj);
              if (!this.rbs[y.Parent] && y.ControlValue === "True")
                this.$set(this.rbs, y.Parent, y.ControlName);
            } else {
              if (!this.elements[y.ControlName])
                this.$set(this.elements, y.ControlName, []);
              this.elements[y.ControlName].push(obj);
            }
          });
        }
        if (x != "form") {
          str += `<v-card :class="$style.blockWrap" elevation="2" tile>`;
          if (obj.Caption)
            str += `<v-card-subtitle :class="$style.cardTitle">${this.fixCaption(
              obj.Caption
            )}</v-card-subtitle>`;
          str += this.getHTMLcomponents(obj);
          str += `</v-card>`;
        } else {
          str += this.getHTMLcomponents(obj);
        }
      });
      this.html = `${str}
      <div :class="$style.buttonsWrap">
        <v-select
          :class="$style.typeSelector"
          :items="types"
          item-text="type"
          return-object
          :label="$t('trans__reportFileType')"
          v-model="selectedType"
        />
        <v-btn class="primaryBtn" depressed tile @click="handleSave">
          {{ $t("widgetOptionsSubmit") }}
        </v-btn>
      </div>
      </div></div></div>`;
      this.render();
    }
  },
  render() {
    if (!this.template) return null;
    return this.template();
  }
};
</script>

<style module lang="scss">
.root {
  height: 100%;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
}

.root > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.root > div:first-child > *:first-child {
  margin-right: 15px;
}

.root > div:last-child {
  flex: 1;
  position: relative;
  font-size: 14px !important;
}

.root > div:last-child :global(.v-select.v-select--is-multi) {
  font-size: 14px !important;
}

.root > div:last-child > * {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  overflow: auto;
}

.blockWrap {
  margin: 0 0 10px;
  padding: 20px;
  font-size: 14px;
}

.blockWrap :global(.v-text-field__details) {
  display: none;
}

.cardTitle {
  padding: 0;
}

.buttonsWrap {
  margin: 20px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.buttonsWrap > *:last-child * {
  text-transform: uppercase;
}

.typeSelector {
  max-width: 70px !important;
}
</style>
