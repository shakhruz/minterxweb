<template>
  <q-page class="flex">
    <div class="main-content">
      <section class="u-section--margin--top u-container">
        <div class="u-grid u-grid--vertical-margin">
          <div class="u-cell u-cell--large--auto">
            <div class="dashboard__price-title">ЦЕНА ПРОДАЖИ BIP</div>
            <div class="dashboard__price">
              <span class="dashboard__price-value">${{ bip_usd | myFormat("longUSD") }}</span>
            </div>
            <div class="dashboard__period-title">
              1 BTC = ${{ btc_usd }}
              <br />
              1000 satoshi = ~${{ (btc_usd / 100000) | myFormat("fullUSD") }}
              <br />
              1 ETH = ~${{ (eth_usd) | myFormat("fullUSD") }}
            </div>
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
                    <span>~${{ (sell_amount * bip_usd) | myFormat("fullUSD") }}</span>
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
                  v-bind:href="'https://explorer.minter.network/transactions/'+ contract.outgoingTx"
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
    <footer class="footer">
      <div class="u-container u-container--large">
        <div class="footer__menu">
          <div class="footer__menu-item">
            <a href="/#/stats" rel="noopener" class="footer__link link--hover">Статистика</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/statics/privacy.pdf"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Политика Конфиденциальности</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/statics//terms.pdf"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Условия Использования</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/statics/disclaimer.pdf"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Риски</a>
          </div>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script>
import { Notify } from "quasar";
import utils from "../utils.js";
import data from "../data.js";

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

      // цены и курсы
      btc_usd: 0,
      bip_usd: 0,
      eth_usd: 0,
      allRates: [],

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

    // обновляем регулярно
    setInterval(() => {
      this.updateRates(result => {
        console.log("rates ready..." + result);
        this.updateSellAmount(this.sell_amount);
      });
    }, 10000);
  },
  mounted() {
    // console.log("mounted...")
  },
  methods: {
    // обнулить состояние формы зяавки
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
        this.buy_amount_btc,
        this.dest_address,
        contract => {
          console.log("new contract: ", contract);
          this.contract = contract;
          this.processContract();
        }
      );
    },
    // Отслеживаем контракт, ждем оплату, следим за отправкой купленных токенов
    processContract() {
      this.showStep1 = false;
      this.showStep2 = true;

      this.showSendToAddress = true;
      let contractComplete = false;
      console.log("checking contract ", this.contract._id);

      let tries = 60 * 60; // даем 60 минут на завершение контракта
      let interval = setInterval(() => {
        utils.getContractState(this.contract._id, newContract => {
          this.contract = newContract;
          console.log("updated contract: ", this.contract);
          switch (this.contract.state) {
            case "waiting for payment":
              console.log("waiting for payment...");
              break;
            case "sending":
              this.showGotPayment = true;
              break;
            case "payment received":
              this.showGotPayment = true;
              break;
            case "completed":
              this.showGotPayment = true;
              contractComplete = true;
              this.showPaymentSent = true;
              this.disableSendBtcButton = false;
              this.disableSendEthButton = false;
              clearInterval(interval);
              console.log("contract complete");
              break;
            case "error":
              this.showErrorMessage = true;
              this.error_message = this.contract.message;
              this.disableSendBtcButton = false;
              this.disableSendEthButton = false;
              clearInterval(interval);
              console.log("contract complete");
              break;
            default:
              console.log("unknown contract state: ", this.contract.state);
          }
          tries -= 1;
          if (tries < 1) {
            clearInterval(interval);
            this.disableSendBtcButton = false;
            this.disableSendEthButton = false;
            console.log(
              "cancelled checking contract " + this.contract._id + " timed out"
            );
          }
        });
      }, 1000);
    },
    // Калькулятор - обновляем сумму покупки
    updateSellAmount(arg) {
      // посчитать в BTC
      let rate = this.allRates.find(item => item.coin == "BTC");
      if (rate) {
        const buy_price = rate.buy;
        this.buy_amount_btc = this.sell_amount / buy_price;
        this.buy_amount_btc = utils.formatAmount(this.buy_amount_btc, "BTC");
      }

      // посчитать в ETH
      rate = this.allRates.find(item => item.coin == "ETH");
      if (rate) {
        const buy_eth_price = rate.buy;
        this.buy_amount_eth = this.sell_amount / buy_eth_price;
        this.buy_amount_eth = utils.formatAmount(this.buy_amount_eth, "ETH");
      }

      // TODO: посчитать в USDT
    },
    // Загружаем текущие курсы валют
    updateRates(callback) {
      utils.getRates((allRates, btc_usd, bip_usd, eth_usd) => {
        this.allRates = allRates;
        this.btc_usd = btc_usd;
        this.bip_usd = bip_usd;
        this.eth_usd = eth_usd;
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
  computed: {},
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
