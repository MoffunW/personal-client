<template>
  <div class="card" :class="$style.root">
    <v-tabs
      class="tabsWrap"
      v-model="tab"
      align-with-title
      show-arrows
      :centered="false"
    >
      <v-tab v-for="item in items" :key="item.name">
        {{ item.name }}
      </v-tab>
    </v-tabs>

    <v-tabs-items class="tabsItems" v-model="tab" touchless>
      <v-tab-item :class="$style.item" v-for="item in items" :key="item.name">
        <component v-bind:is="item.component" :index="tab" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
export default {
  components: {
    UsersSettings: () => import("@/pages/Admin/UsersSettings"),
    MailSettings: () => import("@/pages/Admin/MailSettings"),
    LicenseSettings: () => import("@/pages/Admin/LicenseSettings"),
    Integration: () => import("@/pages/Admin/Integration"),
    Widgets: () => import("@/pages/Admin/Widgets")
  },
  watch: {
    "$store.state.role": {
      handler() {
        if (this.$store.state.role !== "Admin") this.$user.go("404");
      }
    }
  },
  data() {
    return {
      tab: null,
      items: [
        {
          name: this.$t("trans__UsersSettings"),
          component: "UsersSettings"
        },
        {
          name: this.$t("trans__MailSettings"),
          component: "MailSettings"
        },
        {
          name: this.$t("trans__LicenseSettings"),
          component: "LicenseSettings"
        },
        {
          name: this.$t("trans__LicenseIntegration"),
          component: "Integration"
        },
        {
          name: this.$t("trans__defaultWidgets"),
          component: "Widgets"
        }
      ]
    };
  }
};
</script>

<style module>
.root {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100vh - 90px);
  margin: 10px 0;
  max-width: none !important;
}

.root > *:first-child {
  flex: 0;
}

.root > *:last-child {
  display: flex;
  flex: 1;
}

.root > *:last-child > * {
  flex: 1;
  margin: 15px 0;
}

.item {
  margin: 15px 0 0;
  height: 100%;
}
</style>
