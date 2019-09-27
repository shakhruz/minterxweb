<template>
  <q-page class="flex">
    <div id="contract">
      <h3>Обмен Валют</h3>
      <div>Шаг 2 из 2. Проверьте данные заказа</div>
      <div id="notes">
        <p>Мы зарезервировали средства для Вашего заказа на 60 минут. Время истечения резерва: Воскресенье, 15 сентября, 18:46</p>
        <p>Сохраните ссылку на эту страницу чтобы проверить состояние этой сделки</p>
        <table>
            <tr><td>Токены на продажу</td><td>BIP</td></tr>
            <tr><td>Сумма продажи</td><td>100</td></tr>
            <tr><td>Токены на покупку</td><td>BTC</td></tr>
            <tr><td>Сумма покупки</td><td>36182сатоши (0.00036182btc)</td></tr>
            <tr><td>Статус сделки</td><td>ожидание оплаты</td></tr>
            <tr><td>Адрес доставки BTC</td><td><q-input outlined v-model="text" label="Outlined" /></td></tr>
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
