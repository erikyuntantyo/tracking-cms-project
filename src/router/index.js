import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
// import L from 'leaflet'
// import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
// import 'leaflet/dist/leaflet.css'
import VueTelInput from 'vue-tel-input'
import Transfer from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import feathersClient from '../boot/feathersClient'

Vue.use(VueRouter)
Vue.use(VueTelInput)
Vue.use(Transfer, { locale })

// Vue.component('l-map', LMap)
// Vue.component('l-tile-layer', LTileLayer)
// Vue.component('l-marker', LMarker)

// import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
// import iconUrl from 'leaflet/dist/images/marker-icon.png'
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// delete L.Icon.Default.prototype._getIconUrl

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl,
//   iconUrl,
//   shadowUrl
// })

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach(async (to, from, next) => {
    store.commit('page/setTitle', to.meta.title)

    let accessToken = ''
    if (!store.getters['auth/isAuthenticated'] && localStorage.getItem('refresh-token')) {
      try {
        const response = await feathersClient.service('token/refresh').create({})
        accessToken = response.accessToken
      } catch (e) {
        localStorage.removeItem('feathers-jwt')
        localStorage.removeItem('refresh-token')
        next('/login')
      }
    }

    if (accessToken) {
      await store.dispatch('auth/authenticate', {
        strategy: 'jwt',
        accessToken
      }).catch(error => {
        if (!error.message.includes('Could not find stored JWT')) console.log('Not authenticated')
      })
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (store.getters['auth/isAuthenticated']) {
        const user = store.getters['auth/user']
        if (user.firstLogin) await store.dispatch('users/find', [user._id])

        user.firstLogin
          ? next('/login-otp')
          : next()
      } else {
        next('/login')
      }
    } else {
      next()
    }
  })

  return Router
}
