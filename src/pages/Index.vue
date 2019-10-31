<template>
  <q-page class="flex">
    <div class="main-content">
      <main>
        <q-card-section>
          <div class="q-pa-md">
            <div class="q-gutter-md">
              <div>Заявка на обмен</div>
              <div class="row">
                <q-input
                  outlined
                  v-model.number="sell_amount"
                  @input="updateSellAmount"
                  :label="'Продаю ' + sell_coin"
                />
                <q-select
                  filled
                  borderless
                  v-model="sell_coin"
                  :options="sell_coins_options"
                  label
                  @input="changeSellToken"
                />
              </div>
              <q-btn outline color="primary" icon="compare_arrows" @click="reverseTokens" />
              <div class="row">
                <q-input
                  outlined
                  v-model.number="buy_amount"
                  @input="updateBuyAmount"
                  :label="'Получу в ' + buy_coin"
                />
                <q-select
                  outlined
                  filled
                  borderless
                  v-model="buy_coin"
                  :options="buy_coins_options"
                  label
                  @input="changeBuyToken"
                />
              </div>
              <q-input
                outlined
                v-model="dest_address"
                @input="validateAddress"
                :label="'адрес отправки ' + buy_coin"
              />
              <div v-if="showAddressError" class="error_message">Некорректный адрес BTC</div>
              <q-btn
                outline
                color="primary"
                label="Отправить"
                @click.native="createContract"
                :disable="disableSendButton || invalidAddress"
              />
            </div>
          </div>
        </q-card-section>
      </main>
    </div>
    <footer_links />
  </q-page>
</template>

<script>
import { Notify } from "quasar";
import utils from "../utils.js";
import data from "../data.js";

import { mapState, mapActions, mapMutations } from "vuex";

const copy = require("clipboard-copy");

export default {
  data() {
    return {
      // данные кулькулятора
      sell_amount: 0.001,
      buy_amount: 100,
      buy_amount_btc: 0,
      buy_amount_eth: 0,
      sell_coin: "BTC",
      buy_coin: "BIP",
      dest_address: "",

      allCoins: ["BIP", "BTC", "ETH"],
      sell_coins_options: ["BIP", "BTC", "ETH"],
      buy_coins_options: ["BIP", "BTC", "ETH"],

      disableSendButton: false,
      showAddressError: false,

      invalidAddress: true,
      disableSendBtcButton: false,
      disableSendEthButton: false,
      showAddressErrorMessage: false,

      // данные шага 2, состояние текущей сделки
      showStep1: true,
      showStep2: false,
      contract: null,

      showSendToAddress: false,
      showGotPayment: false,
      showPaymentSent: false,
      showErrorMessage: false,
      error_message: ""
    };
  },
  created() {
    // обновляем сразу
    this.updateRates(result => {
      console.log("rates ready...", this.bipPrices);
      // this.updateSellAmount(this.sell_amount);
      this.updateBuyAmount(this.buy_amount);
    });

    this.$options.sockets.onmessage = data => {
      const json_data = JSON.parse(data.data);
      console.log("got message:", json_data.type);
      switch (json_data.type) {
        case "usdPrices":
          this.$store.commit("store/setUsdPrices", json_data);
          this.updateSellAmount();
          break;
        case "bipPrices":
          this.$store.commit("store/setBipPrices", json_data);
          this.updateSellAmount();
          break;
        case "new_contract":
          console.log("new contract ");
          break;
        case "got_payment":
          console.log("got_payment");
          if (contract && contract._id == json_data.contract._id) {
            this.gotPayment();
          }
          break;
        case "error_contract":
          console.log("error_contract");
          if (contract && contract._id == json_data.contract._id) {
            this.errorContract();
          }
          break;
        case "completed_contract":
          console.log("completed_contract");
          if (contract && contract._id == json_data.contract._id) {
            this.completedContract();
          }
          break;
      }
    };
  },
  mounted() {
    // console.log("mounted...")
  },
  destroyed() {
    delete this.$options.sockets.onmessage;
  },
  methods: {
    ...mapActions("store", ["calcPrice"]),
    ...mapMutations(["setUsdPrices", "setBipPrices"]),
    // обнулить состояние формы заявки
    resetFormData() {
      this.disableSendBtcButton = true;
      this.disableSendEthButton = true;
      this.showErrorMessage = false;
      this.error_message = "";
      this.showSendToAddress = false;
      this.showGotPayment = false;
      this.showPaymentSent = false;
    },
    // Создаем новый контракт в базе данных
    createContract(sell_coin) {
      this.resetFormData();
      console.log("create contract");
      utils.createContract(
        sell_coin,
        this.buy_coin,
        this.sell_amount,
        this.dest_address,
        contract => {
          console.log("new contract: ", contract);
          this.contract = contract;
          this.showStep1 = false;
          this.showStep2 = true;

          this.showSendToAddress = true;
          let contractComplete = false;
        }
      );
    },
    gotPayment() {
      this.showGotPayment = true;
    },
    completedContract() {
      this.showGotPayment = true;
      contractComplete = true;
      this.showPaymentSent = true;
      this.disableSendBtcButton = false;
      this.disableSendEthButton = false;
    },
    errorContract() {
      this.showErrorMessage = true;
      this.error_message = this.contract.message;
      this.disableSendBtcButton = false;
      this.disableSendEthButton = false;
    },
    // Калькулятор - обновляем сумму покупки
    updateSellAmount(arg) {
      switch (this.sell_coin) {
        case "BTC":
          this.buy_amount = this.sell_amount * this.bipPrices.BTC.buy;
          break;
        case "ETH":
          this.buy_amount = this.sell_amount * this.bipPrices.ETH.buy;
          break;
        case "BIP":
          switch (this.buy_coin) {
            case "BTC":
              this.buy_amount = this.sell_amount / this.bipPrices.BTC.sell;
              break;
            case "ETH":
              this.buy_amount = this.sell_amount / this.bipPrices.ETH.sell;
              break;
          }
      }
      this.buy_amount = utils.formatAmount(this.buy_amount, this.buy_coin);
    },
    updateBuyAmount(arg) {
      switch (this.sell_coin) {
        case "BTC":
          this.sell_amount = this.buy_amount / this.bipPrices.BTC.buy;
          break;
        case "ETH":
          this.sell_amount = this.buy_amount / this.bipPrices.ETH.buy;
          break;
        case "BIP":
          switch (this.buy_coin) {
            case "BTC":
              this.sell_amount = this.buy_amount * this.bipPrices.BTC.sell;
              break;
            case "ETH":
              this.sell_amount = this.buy_amount * this.bipPrices.ETH.sell;
              break;
          }
      }
      this.sell_amount = utils.formatAmount(this.sell_amount, this.sell_coin);
    },

    changeSellToken(arg) {
      console.log("change sell token", arg);
      if (arg == "BIP") {
        this.buy_coins_options = this.filterBIP(this.allCoins);
        this.sell_coins_options = this.allCoins;
        this.buy_coin = this.buy_coins_options[0];
      } else {
        this.buy_coins_options = ["BIP"];
        this.buy_coin = "BIP";
        this.sell_coins_options = this.allCoins;
      }
      this.updateSellAmount(this.sell_amount);
    },
    changeBuyToken(arg) {
      console.log("change buy token", arg);
      if (arg == "BIP") this.sell_coins_options = this.filterBIP(this.allCoins);
      else {
        this.sell_coins_options = this.allCoins;
        this.sell_coin = "BIP";
        this.buy_coins = this.filterBIP(this.allCoins);
      }
      this.validateAddress(this.dest_address);
      this.updateSellAmount(this.sell_amount);
    },
    reverseTokens() {
      console.log("reverse tokens");
      const buy_coin = this.buy_coin;
      const buy_options = this.buy_coins_options;
      this.buy_coin = this.sell_coin;
      this.buy_coins_options = this.sell_coins_options;
      this.sell_coin = buy_coin;
      this.sell_coins_options = buy_options;

      let sell_amount = this.sell_amount;
      this.sell_amount = this.buy_amount;
      this.buy_amount = sell_amount;
      this.validateAddress(this.dest_address);
      // this.updateSellAmount(this.sell_amount);
    },

    // Загружаем текущие курсы валют
    updateRates(callback) {
      utils.getRates((bipPrices, usdPrices) => {
        this.$store.commit("store/setUsdPrices", usdPrices);
        this.$store.commit("store/setBipPrices", bipPrices);

        // this.allRates = allRates;
        // this.btc_usd = btc_usd;
        // this.bip_usd = bip_usd;
        // this.eth_usd = eth_usd;
        callback(true);
      });
    },
    // скопировать в буфер обмена
    copyAddress(arg) {
      copy(this.contract.receivingAddress);
      Notify.create("Скопировал Адрес в буфер обмена");
    },
    // проверить минтер адрес
    validateMinterAddress(address) {
      if (utils.isValidMinterAddress(address)) {
        this.invalidAddress = false;
        this.showAddressErrorMessage = false;
      } else {
        this.invalidAddress = true;
        this.showAddressErrorMessage = true;
      }
    },
    validateAddress(address) {
      const valid = utils.isValidAddress(address, this.buy_coin);
      if (valid) {
        this.showAddressError = false;
        this.invalidAddress = false;
      } else {
        this.showAddressError = true;
        this.invalidAddress = true;
      }
    },
    filterBIP(list) {
      return list.filter(item => item != "BIP");
    }
  },
  computed: {
    ...mapState("store", ["contracts", "bipPrices", "usdPrices"])
  },
  filters: {
    myFormat(amount, type) {
      return utils.myFormat(amount, type);
    },
    formatWithCoin(amount, coin) {
      return utils.formatWithCoin(amount, coin);
    }
  },
  components: {
    bipprice: require("components/BIPPrice.vue").default,
    footer_links: require("components/footer.vue").default
  }
};
</script>

<style>
</style>
