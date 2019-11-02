<template>
  <q-page class="flex">
    <div class="main-content">
      <main>
        <div v-if="showContract">
          <div>
            <div>Обмен {{ contract.sell_amount + " " + contract.sell_coin + " на " + contract.calc_amount + " " + contract.buy_coin }}</div>
            <hr />
            <div>ID контракта: {{ contract._id }}</div>
            <div>Хэш контракта: {{ contract.hash }}</div>
            <div>Начало контракта: {{ momentJS(contract.start_time).calendar() }}</div>
            <hr />
            <div>Адрес отправки {{ contract.buy_coin }}: {{ contract.toAddress }}</div>
            <hr />

            <div
              v-if="showSendTo"
            >Пожалуйста отправьте {{ contract.sell_amount }} {{ contract.sell_coin }} в течение 60 минут.</div>
            <div>
              <div>Адрес для отправки:</div>
              <q-input v-model="contract.receivingAddress" readonly>
                <template v-slot:after>
                  <q-btn round dense flat icon="file_copy" @click.native="copyAddress" />
                </template>
              </q-input>
              <div class style="text-align: center">
                <qriously
                  :value="contract.sell_coin == 'BTC' ? 'bitcoin:' + contract.receivingAddress + '?amount=' + contract.sell_amount : contract.receivingAddress"
                  :size="300"
                />
              </div>
            </div>

            <div v-if="showGotPayment">
              <div>Ваш перевод на {{ contract.receivedCoins | formatWithCoin(contract.sell_coin) }} получен.</div>
              <div>Отправляем {{ contract.send_amount | formatWithCoin(contract.buy_coin) }} на адрес {{ contract.toAddress }}</div>
            </div>

            <div v-if="showPaymentSent">
              <div>
                Перевод завершен. Проверить можно здесь -
                <a
                  _target="blank"
                  v-bind:href="contract.outgoingTxLink"
                >{{ contract.outgoingTx }}</a>
              </div>
              <div>Спасибо за покупку!</div>
            </div>

            <div v-if="showErrorMessage" class="error_message">Произошла ошибка: {{ error_message }}</div>
          </div>
        </div>
      </main>
    </div>
    <footer_links />
  </q-page>
</template>

<script>
import { Notify } from "quasar";
import utils from "../utils.js";
import data from "../data.js";
import moment from "moment";

moment.locale("ru-RU");

import { mapState, mapActions, mapMutations } from "vuex";

const copy = require("clipboard-copy");

export default {
  data() {
    return {
      contract: null,

      showContract: false,
      showSendTo: true,
      showGotPayment: false,
      showPaymentSent: false,
      contractComplete: false,
      showErrorMessage: false,
      error_message: ""
    };
  },
  created() {
    // Получить информацию о котракте иэ бэкенда
    utils.getContract(this.$route.params.id, contract => {
      this.contract = contract;
      this.showContract = true;
    });

    this.$options.sockets.onmessage = data => {
      const json_data = JSON.parse(data.data);
      console.log("got message:", json_data.type);
      switch (json_data.type) {
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
  destroyed() {
    delete this.$options.sockets.onmessage;
  },
  methods: {
    ...mapActions("store", ["calcPrice"]),
    ...mapMutations(["setUsdPrices", "setBipPrices"]),
    // Создаем новый контракт в базе данных
    gotPayment() {
      this.showSendToAddress = false;
      this.showGotPayment = true;
    },
    completedContract() {
      this.showSendToAddress = false;
      this.showGotPayment = true;
      this.contractComplete = true;
      this.showPaymentSent = true;
    },
    errorContract() {
      this.showSendToAddress = false;
      this.showErrorMessage = true;
      this.error_message = this.contract.message;
    },
    // скопировать в буфер обмена
    copyAddress(arg) {
      copy(this.contract.receivingAddress);
      Notify.create("Скопировал Адрес в буфер обмена");
    },
    momentJS(time) {
      return moment(time);
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
    footer_links: require("components/footer.vue").default
  }
};
</script>

<style>
</style>