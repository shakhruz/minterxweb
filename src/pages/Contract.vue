<template>
  <q-page class="flex">
    <div class="main-content">
      <main>
        <div v-if="showStep2" id="step2" class>
          <div class>
            <h2 class>Контракт на обмен {{ contract._id }}</h2>

            <div
              v-if="showSendToAddress"
              class="message"
            >Ваша заявка на обмен принята. Пожалуйста отправьте {{ contract.sell_coin }} в течение 60 минут.</div>

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

            <div v-if="showErrorMessage" class="error_message">Произошла ошибка: {{ error_message }}</div>
          </div>
          <div class>
            <form novalidate="novalidate" class>
              <div class>
                <label class>
                  <span class>Отправьте {{ contract.sell_coin }} на адрес:</span>
                </label>
                <q-input v-model="contract.receivingAddress" readonly class="address">
                  <template v-slot:after>
                    <q-btn round dense flat icon="file_copy" @click.native="copyAddress" />
                  </template>
                </q-input>
              </div>
              <div class style="text-align: center">
                <qriously
                  :value="contract.sell_coin == 'BTC' ? 'bitcoin:' + contract.receivingAddress + '?amount=' + conract.sell_amount : contract.receivingAddress"
                  :size="300"
                />
              </div>
            </form>
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

import { mapState, mapActions, mapMutations } from "vuex";

const copy = require("clipboard-copy");

export default {
  data() {
    return {
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
    utils.getContract(this.$route.params.id, contract => {
      this.contract = contract;
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
  mounted() {
    // console.log("mounted...")
  },
  destroyed() {
    delete this.$options.sockets.onmessage;
  },
  methods: {
    ...mapActions("store", ["calcPrice"]),
    ...mapMutations(["setUsdPrices", "setBipPrices"]),
    // Создаем новый контракт в базе данных
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
    // скопировать в буфер обмена
    copyAddress(arg) {
      copy(this.contract.receivingAddress);
      Notify.create("Скопировал Адрес в буфер обмена");
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