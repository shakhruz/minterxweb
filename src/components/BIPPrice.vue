<template>
  <div>
    <div v-if="type == 'buy'" class="dashboard__price-title">ЦЕНА ПРОДАЖИ BIP</div>
    <div v-if="type == 'sell'" class="dashboard__price-title">ЦЕНА ПОКУПКИ BIP</div>
    <div class="dashboard__price">
      <span class="dashboard__price-value">${{ usdPrices.bip_usd | myFormat("longUSD") }}</span>
    </div>
    <div class="dashboard__period-title">
      1 BTC = ${{ usdPrices.btc_usd }}
      <br />
      1000 satoshi = ~${{ (usdPrices.btc_usd / 100000) | myFormat("fullUSD") }}
      <br />
      1 ETH = ~${{ (usdPrices.eth_usd) | myFormat("fullUSD") }}
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import utils from "../utils.js";

export default {
  props: ["type"],
  computed: {
    ...mapState("store", ["bipPrices", "usdPrices"])
  },
  filters: {
    myFormat(amount, type) {
      return utils.myFormat(amount, type);
    },
    formatWithCoin(amount, coin) {
      return utils.formatWithCoin(amount, coin);
    }
  }
};
</script>

<style>
</style>
