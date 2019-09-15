<template>
  <q-page class="flex">
    <div id="calculator">
      <h3>Обмен Валют</h3>
      <div>Шаг 1 из 2. Выберите валюту, сумму и направление обмена:</div>
      <div class="q-pa-md" style="max-width: 300px">
        <div class="q-gutter-md">
          <q-select outlined v-model="model" :options="options" label="Outlined" />
          <q-btn outline color="primary" icon="compare_arrows" />
          <q-select outlined v-model="model" :options="options" label="Outlined" />
          <q-input outlined v-model="text" label="Outlined" />
          <q-input outlined v-model="text" label="Outlined" />
          <q-btn outline color="primary" label="Далее" />
        </div>
      </div>
    </div>
    <div id="exhange_rates" class="q-pa-md" style="max-width: 300px">
      <div class="q-gutter-md">
        <h3>Обменные курсы</h3>
        <table>
          <thead>
            <tr><td></td><td>BIP</td><td>BTC</td></tr>
            <tr><td>Продажа</td>1<td>0.0487</td><td>472сатоши</td></tr>
            <tr><td>Покупка</td>1<td>0.0450</td><td>434сатоши</td></tr>
            <tr><td>Резерв</td><td>50000</td><td>0.1</td></tr>
          </thead>
        </table>
      </div>
    </div>
    <div id="history" class="q-pa-md" style="max-width:300px">
      <div class="q-gutter-md">
        <h3>История операций</h3>
        <p>Кол-во операций всего/сегодня: 100/1</p>
        <table>
          <tr>
            <td>Время</td>
            <td>Продажа</td>
            <td>Транзакция продажи</td>
            <td>Покупка</td>
            <td>Транзакция покупки</td>
            <td>Статус</td>
          </tr>
          <tr>
            <td>15.09 16:25</td>
            <td>110 BIP</td>
            <td></td>
            <td>Покупка</td>
            <td>Транзакция покупки</td>
            <td>Статус</td>
          </tr>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
}
</script>

<style>
</style>
