<template>
  <q-page class="flex">
    <div class="main-content">
      <main>
        <section class="u-section--margin u-container">
          <h1 class="u-h1 u-mb2">История транзакций</h1>
          <q-card-section>
            <div id="history" class="q-pa-md">
              <div class="q-gutter-md">
                <p>Всего: {{allContracts.length}}</p>
                <table>
                  <thead>
                    <tr>
                      <td>Время</td>
                      <td>Продажа</td>
                      <td>Покупка</td>
                      <td>Статус</td>
                    </tr>
                  </thead>
                  <tr v-for="co in allContracts" :key="co._id">
                    <td>{{co.date | formatDate}}</td>
                    <td>{{co.receivedCoins | formatWithCoin(co.sell_coin)}}</td>
                    <td>{{co.send_amount | formatWithCoin(co.buy_coin)}}</td>
                    <td>{{co.state}}</td>
                  </tr>
                </table>
              </div>
            </div>
          </q-card-section>
        </section>
      </main>
    </div>
  </q-page>
</template>

<script>
import { Notify } from "quasar";
import utils from "../utils.js";
import data from "../data.js";

export default {
  data() {
    return {
      allContracts: []
    };
  },
  created() {
    // обновляем сразу
    this.getAllContracts(() => {
      console.log("contracts loaded...");
    });

    // обновляем регулярно
    setInterval(() => {
      this.getAllContracts(() => {
        console.log("contracts udpated...");
      });
    }, 10000);
  },
  mounted() {
    // console.log("mounted...");
  },
  methods: {
    getAllContracts(callback) {
      fetch(data.back_url + "contracts")
        .then(res => res.json())
        .then(json => {
          this.allContracts = json;
          console.log("contracts: ", this.allContracts);
          callback();
        })
        .catch(console.error);
    }
  },
  computed: {},
  filters: {
    myFormat(amount, type) {
      return utils.myFormat(amount, type);
    },
    formatWithCoin(amount, coin) {
      return utils.formatWithCoin(amount, coin);
    },
    formatDate(dateToFormat) {
      return utils.formatDate(dateToFormat);
    }
  }
};
</script>

<style>
</style>
