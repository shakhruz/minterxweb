<template>
  <q-layout view="lHh Lpr lFf">
    <div>
      <header>
        <div>
          <!-- <a href="/#/" class="header__logo no-link is-active center">
            <img
              src="/statics/minterx-long-logo.png"
              alt="MinterX"
              height="36"
              class="header__logo-image"
            />
          </a>-->
          {{ title }}
        </div>
      </header>
      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "IndexLayout",
  computed: {
    ...mapState("store", ["contracts", "bipPrices", "usdPrices"]),
    title() {
      let currentPath = this.$route.fullPath;
      if (currentPath == "/") return "MinterX Change";
      // else if (currentPath.includes('/chat')) return this.otherUserDetails.name
      // else if (currentPath == '/auth') return 'Login'
    }
  },
  methods: {}
};
</script>

<style>
</style>