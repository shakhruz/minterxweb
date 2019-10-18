import Vue from "vue";
import Vuex from "vuex";
import VueNativeSock from "vue-native-websocket";
import store from "./store";
import storeAll from "../store";

Vue.use(VueNativeSock, "ws://localhost:9090", {
  store: storeAll,
  format: "json"
});
Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      store
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  });

  return Store;
}
