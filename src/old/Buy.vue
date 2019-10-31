<template>
  <q-page class="flex">
    <div class="main-content">
      <section class="u-section--margin--top u-container">
        <div class="u-grid u-grid--vertical-margin">
          <div class="u-cell u-cell--large--auto">
            <bipprice type="buy" />
          </div>
          <div class="u-cell u-cell--large--auto history-cell">
            <div class="history__chart-wrap" style>
              <div class="chartjs-size-monitor">
                <div class="chartjs-size-monitor-expand">
                  <div class>
                    <span>Купить</span>
                    <q-input
                      dark
                      class="dashboard__price-value"
                      v-model.number="sell_amount"
                      @input="updateSellAmount"
                    >
                      <template v-slot:prepend>
                        <img src="/statics/bip_token_small.png" width="40" height="40" />
                      </template>
                    </q-input>
                    <span>~${{ (sell_amount * usdPrices.bip_usd) | myFormat("fullUSD") }}</span>
                    <div class="price_info">
                      <div style="margin-top: 20px">Будет стоить:</div>
                      <ul>
                        <li>
                          <div this.class>{{ (buy_amount_btc) | myFormat("formatBTC")}}</div>
                        </li>
                        <li>
                          <div this.class>{{ (buy_amount_eth) | formatWithCoin("ETH")}}</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main>
        <section class="u-section--margin u-container">
          <h1 class="u-h1 u-mb2">Быстрая покупка BIP</h1>
          <div v-if="showStep1" id="step1" class="u-grid u-grid--vertical-margin">
            <div class="u-cell u-cell--medium--4-10">
              <h2 class="u-h4 u-mb1">Шаг 1</h2>
              <p>Для того, чтобы купить BIP введите свой адрес Minter кошелька и выберите форму оплаты - BITCOIN, ETH.</p>
              <p>
                Если у Вас нет Minter кошелька, Вы&nbsp;можете открыть его здесь -
                <a
                  href="https://bip.to"
                  class="link--default"
                >https://bip.to</a>.
              </p>
            </div>
            <div class="u-cell u-cell--medium--6-10">
              <form novalidate="novalidate" class="dashboard__well" _lpchecked="1">
                <div class="form-row">
                  <label class="form-field form-field--invert">
                    <span class="form-field__label">
                      Адрес Вашего Minter кошелька
                      <span
                        class="dashboard__input-address-extra"
                      >(начинается с Mx)</span>
                    </span>
                  </label>
                  <q-input
                    dark
                    v-model="dest_address"
                    spellcheck="false"
                    autocomplete="off"
                    class="form-field__input address"
                    @input="validateMinterAddress"
                  />
                  <span
                    v-if="showAddressErrorMessage"
                    class="form-field__error"
                  >Введите правильный адрес Minter</span>
                </div>
                <div class="form-row"></div>
                <div class="form-row">
                  <q-btn
                    outline
                    color="orange"
                    rounded
                    size="lg"
                    class="full-width q-mt-md"
                    label="Оплатить в BITCOIN"
                    @click.native="createContract('BTC')"
                    :disable="disableSendBtcButton || invalidAddress"
                  />
                </div>
                <div class="form-row">
                  <q-btn
                    outline
                    color="blue"
                    rounded
                    size="lg"
                    class="full-width q-mt-md"
                    label="Оплатить в ETH"
                    @click.native="createContract('ETH')"
                    :disable="disableSendEthButton || invalidAddress"
                  />
                </div>
              </form>
            </div>
          </div>
          <div v-if="showStep2" id="step2" class="u-grid u-grid--vertical-margin">
            <div class="u-cell u-cell--medium--4-10">
              <h2 class="u-h4 u-mb1">Шаг 2</h2>
              <div
                v-if="showSendToAddress"
                class="message"
              >Ваша заявка на обмен принята. Пожалуйста отправьте {{ sell_coin }} в течение 60 минут.</div>
              <div v-if="showGotPayment" class="message">
                Перевод в размере
                <strong>{{ contract.receivedCoins | formatWithCoin(sell_coin) }}</strong> для обмена получен.
                <br />Отправляем
                <strong>{{ contract.send_amount }} {{ buy_coin }}</strong>
                на адрес {{ dest_address }}
              </div>
              <div v-if="showPaymentSent" class="message">
                Ваши {{ buy_coin }} отправлены на адрес {{ dest_address }}.
                <br />Сделка завершена.
                <br />Проверить можно здесь -
                <a
                  _target="blank"
                  v-bind:href="contract.outgoingTxLink"
                >{{ contract.outgoingTx }}</a>
                <br />Спасибо за покупку!
              </div>
              <div
                v-if="showErrorMessage"
                class="error_message"
              >Произошла ошибка: {{ error_message }}</div>
            </div>
            <div class="u-cell u-cell--medium--6-10">
              <form novalidate="novalidate" class="dashboard__well" _lpchecked="1">
                <div class="form-row">
                  <label class="form-field form-field--invert">
                    <span class="form-field__label">Отправьте BTC на адрес:</span>
                  </label>
                  <q-input dark v-model="contract.receivingAddress" readonly class="address">
                    <template v-slot:after>
                      <q-btn round dense flat icon="file_copy" @click.native="copyAddress" />
                    </template>
                  </q-input>
                </div>
                <div class="form-row" style="text-align: center">
                  <qriously
                    :value="'bitcoin:' + contract.receivingAddress + '?amount=' + buy_amount_btc"
                    :size="300"
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
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
      sell_amount: 100,
      buy_amount_btc: 0,
      buy_amount_eth: 0,
      sell_coin: "BTC",
      buy_coin: "BIP",
      dest_address: "",

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
      console.log("rates ready..." + result);
      this.updateSellAmount(this.sell_amount);
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
      if (this.bipPrices.BTC) {
        const buy_price = this.bipPrices.BTC.buy;
        this.buy_amount_btc = this.sell_amount / buy_price;
        this.buy_amount_btc = utils.formatAmount(this.buy_amount_btc, "BTC");
      }

      if (this.bipPrices.ETH) {
        const buy_eth_price = this.bipPrices.ETH.buy;
        this.buy_amount_eth = this.sell_amount / buy_eth_price;
        this.buy_amount_eth = utils.formatAmount(this.buy_amount_eth, "ETH");
      }
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
