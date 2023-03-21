<template>
  <v-dialog v-model="dialog" width="auto">
    <v-card>
      <v-card-text v-text="$t('trans__authWrongDialog')" />
      <v-card-actions>
        <v-btn
          class="primaryBtn"
          :class="$style.button"
          depressed
          tile
          @click="dialog = false"
        >
          {{ $t("trans__welcomeClose") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { TOKEN_KEY } from "@/config";

export default {
  data() {
    return {
      dialog: false
    };
  },
  watch: {
    dialog(arg, _) {
      if (!arg && _) this.$user.logout();
    }
  },
  methods: {
    async getData() {
      const user = this.$user;
      if (!localStorage.getItem(TOKEN_KEY)) {
        const token = window.location.hash.split("/")[3];
        let _ = null;
        if (token) {
          _ = await axios.get("ServerSettings/Info");
          try {
            if (_.data && _.data.registrationbyToken) {
              this.$store.commit("setServerSettings", _.data);
              try {
                _ = await axios.post("Integration/IntegratedUser", {
                  Token: token ? token : null
                });
                if (_.data && _.data.token) {
                  user.setToken(_.data.token);
                  this.$store.commit("setUser", _.data.role);
                  user.go("dashboard");
                }
              } catch (e) {
                e.response && e.response.status && e.response.status === 418
                  ? (this.dialog = true)
                  : user.logout();
              }
            }
          } catch (e) {
            user.logout();
            return;
          }
        }
      } else {
        user.go("dashboard");
      }
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style module>
.button {
  margin: 0 0 0 auto;
}
</style>
