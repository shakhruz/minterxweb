<template>
  <q-layout view="lHh Lpr lFf">
    <div class="main-wrap">
      <header class="header">
        <div class="header__container u-container u-container--large">
          <a href="/#/" class="header__logo no-link is-active">
            <img
              src="/statics/minterx-long-logo.png"
              alt="MinterX"
              height="36"
              class="header__logo-image"
            />
          </a>
          <nav class="header__menu">
            <a href="/#/" class="header__link is-active">Купить BIP</a>
            <a href="/#/sell" class="header__link link2">Продать BIP</a>
          </nav>
          <div class="header__controls u-hidden-small-down"></div>
        </div>
      </header>
      <q-page-container>
        <router-view />
      </q-page-container>
    </div>
  </q-layout>
</template>

<script>
export default {
  name: "BuyLayout",
  data() {
    return {
      leftDrawerOpen: false
    };
  },
  methods: {}
};
</script>

<style>
</style>
