import Vue from 'vue'
import Vuex from 'vuex'
import { FeathersVuex } from '../boot/feathersClient'
import authvuex from './store.auth'

import user from './user'
import group from './group'
import companies from './companies'
import vehicle from './vehicle'
import message from './message'
import licensetype from './licensetype'
import companysubs from './companysubs'
import vehiclesubs from './vehiclesubs'
import settings from './settings'
import page from './page'
import messagefilters from './messagefilters'

import VueNativeNotification from 'vue-native-notification'

Vue.use(VueNativeNotification, {
  // Automatic permission request before
  // showing notification (default: true)
  requestOnNotify: true
})

const requireModule = require.context(
  // The path where the service modules live
  '../services/feathers-client',
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /.js$/
)

const servicePlugins = requireModule
  .keys()
  .map(modulePath => requireModule(modulePath).default)

Vue.use(Vuex)
Vue.use(FeathersVuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    plugins: [...servicePlugins, authvuex],
    modules: {
      page,
      user,
      group,
      companies,
      vehicle,
      message,
      licensetype,
      companysubs,
      vehiclesubs,
      settings,
      messagefilters
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
