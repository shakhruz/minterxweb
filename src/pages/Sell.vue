<template>
  <q-page class="flex">
    <div class="main-content">
      <section class="u-section--margin--top u-container">
        <div class="u-grid u-grid--vertical-margin">
          <div class="u-cell u-cell--large--auto">
            <div class="dashboard__price-title">ЦЕНА ПОКУПКИ BIP</div>
            <div class="dashboard__price">
              <span class="dashboard__price-value">${{ bip_usd | myFormat("longUSD") }}</span>
            </div>
            <div class="dashboard__period-title">
              1 BTC = ${{ btc_usd }}
              <br />
              1000 satoshi = ~${{ (btc_usd / 100000) | myFormat("fullUSD") }}
            </div>
          </div>
          <div class="u-cell u-cell--large--auto history-cell">
            <div class="history__chart-wrap" style>
              <div class="chartjs-size-monitor">
                <div class="chartjs-size-monitor-expand">
                  <div class>
                    <span>Продать</span>
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
                      <div style="margin-top: 20px">Вы получите:</div>
                      <ul>
                        <li>
                          <div class>{{ buy_amount_btc | myFormat("formatBTC") }}</div>
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
          <h1 class="u-h1 u-mb2">Быстрая продажа BIP</h1>
          <div v-if="showStep1" id="step1" class="u-grid u-grid--vertical-margin">
            <div class="u-cell u-cell--medium--4-10">
              <h2 class="u-h4 u-mb1">Шаг 1</h2>
              <p>Для того, чтобы продать BIP введите адрес кошелька для получения купленных токенов и выберите токен который хотите купить - BITCOIN или ETH.</p>
            </div>
            <div class="u-cell u-cell--medium--6-10">
              <form novalidate="novalidate" class="dashboard__well" _lpchecked="1">
                <div class="form-row">
                  <label class="form-field form-field--invert">
                    <span class="form-field__label">Адрес кошелька для получения токенов</span>
                  </label>
                  <q-input
                    dark
                    v-model="dest_address"
                    spellcheck="false"
                    autocomplete="off"
                    class="form-field__input address"
                  />
                  <span
                    v-if="showAddressErrorMessage"
                    class="form-field__error"
                  >Введите правильный адрес</span>
                </div>
                <div class="form-row"></div>
                <div class="form-row">
                  <q-btn
                    outline
                    color="orange"
                    rounded
                    size="lg"
                    class="full-width q-mt-md"
                    label="Получить BITCOIN"
                    @click.native="createContract('BTC')"
                  />
                </div>
                <div class="form-row">
                  <q-btn
                    outline
                    color="blue"
                    rounded
                    size="lg"
                    class="full-width q-mt-md"
                    label="Получить  ETH"
                    @click.native="createContract('ETH')"
                    :disable="true"
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
                <strong>{{ contract.receivedCoins | myFullFormat(sell_coin) }}</strong> для обмена получен.
                <br />Отправляем
                <strong>{{ contract.send_amount }} {{ buy_coin }}</strong>
                на адрес {{dest_address}}
              </div>
              <div v-if="showPaymentSent" class="message">
                Ваши {{ buy_coin }} отправлены на адрес {{ dest_address }}.
                <br />Сделка завершена.
                <br />Проверить можно здесь -
                <a
                  _target="blank"
                  v-bind:href="''+ contract.outgoingTx +''"
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
                    <span class="form-field__label">Отправьте BIP на адрес:</span>
                  </label>
                  <q-input dark v-model="contract.receivingAddress" readonly class="address">
                    <template v-slot:after>
                      <q-btn round dense flat icon="file_copy" @click.native="copyAddress" />
                    </template>
                  </q-input>
                </div>
                <div class="form-row" style="text-align: center">
                  <qriously :value="contract.receivingAddress" :size="300" />
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
            <a
              href="/about"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >О проекте</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/stats"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Статистика</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/privacy.pdf"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Политика Конфиденциальности</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/terms.pdf"
              target="_blank"
              rel="noopener"
              class="footer__link link--hover"
            >Условия Использования</a>
          </div>
          <div class="footer__menu-item">
            <a
              href="/disclaimer.pdf"
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
      sell_coin: "BIP",
      buy_coin: "BTC",
      dest_address: "",

      invalidAddress: true,
      disableSendBtcButton: false,
      showAddressErrorMessage: false,

      // цены и курсы
      btc_usd: 0,
      bip_usd: 0,
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
    // console.log("mounted...");
  },
  methods: {
    // обнулить состояние формы зяавки
    resetFormData() {
      this.disableSendBtcButton = true;
      this.showErrorMessage = false;
      this.error_message = "";
      this.showSendToAddress = false;
      this.showGotPayment = false;
      this.showPaymentSent = false;
    },
    // Создаем новый контракт в базе данных
    createContract(buy_coin) {
      this.buy_coin = buy_coin;
      if (!this.isValidAddress(this.buy_coin, this.dest_address)) {
        this.invalidAddress = true;
        this.showAddressErrorMessage = true;
        // адрес доставки неправильный, останавливаем процесс
        return;
      } else {
        // адрес правильный, прячем сообщение об ошибке
        this.invalidAddress = false;
        this.showAddressErrorMessage = false;
      }

      this.resetFormData();
      console.log("create contract");
      utils.createContract(
        this.sell_coin,
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
              clearInterval(interval);
              console.log("contract complete");
              break;
            case "error":
              this.showErrorMessage = true;
              this.error_message = this.contract.message;
              this.disableSendBtcButton = false;
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
            console.log(
              "cancelled checking contract " + this.contract._id + " timed out"
            );
          }
        });
      }, 1000);
    },
    // Калькулятор - обновляем сумму покупки
    updateSellAmount(arg) {
      // Посчитать в BTC
      const rate = this.allRates.find(item => item.coin == "BTC");
      if (rate) {
        // console.log("btc rate: ", rate);
        const buy_price = rate.sell;
        this.buy_amount_btc = this.sell_amount / buy_price;
        this.buy_amount_btc = utils.formatAmount(this.buy_amount_btc, "BTC");
      }

      // TODO: посчитать в ETH, USDT
    },
    // Загружаем текущие курсы валют
    updateRates(callback) {
      utils.getRates((allRates, btc_usd, bip_usd) => {
        this.allRates = allRates;
        this.btc_usd = btc_usd;
        this.bip_usd = bip_usd;
        callback(true);
      });
    },
    // копируем в буфер обмена
    copyAddress(arg) {
      copy(arg);
      Notify.create("Скопировал Адрес в буфер обмена");
    }
  },
  computed: {},
  filters: {
    myFormat(amount, type) {
      return utils.myFormat(amount, type);
    }
  },
  myFullFormat(amount, coin) {
    return utils.formatSendingAmount(amount, coin);
  }
};
</script>

<style>
</style>
