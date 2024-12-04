import { parse, stringify } from 'qs'
import Vue from 'vue'
import axios from 'axios'
import { Loading } from 'quasar'
import feathersClient from './feathersClient'

const createAxios = baseURL => {
  const instance = axios.create({ baseURL })

  instance.defaults.timeout = 20000

  instance.defaults.paramsSerializer = {
    encode: parse,
    serialize: params => stringify(params, {
      arrayFormat: 'indices'
    })
  }

  instance.interceptors.request.use(req => {
    Loading.show()

    req.headers.Authorization = localStorage.getItem('feathers-jwt')

    return req
  })

  instance.interceptors.response.use(res => {
    Loading.hide()

    return res
  }, async err => {
    Loading.hide()

    if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
      if (err.response.config.url.includes('authentication') && err.response.config.method === 'post') {
        return Promise.reject(err)
      }

      err.config._retry = true

      if (localStorage.getItem('refresh-token')) {
        try {
          const { accessToken } = await feathersClient.service('token/refresh').create({})

          err.config.headers.Authorization = accessToken

          return axios(err.config)
        } catch (err) {
          localStorage.removeItem('feathers-jwt')
          localStorage.removeItem('refresh-token')
          location.href = '/login'
        }
      }
    }

    return Promise.reject(err)
  })

  return instance
}

const defaultAxios = createAxios(process.env.API[process.env.NODE_ENV])

Vue.prototype.$axios = defaultAxios
Vue.prototype.$axiosTracking = createAxios(process.env.API_TRACKING[process.env.NODE_ENV])
Vue.prototype.$axiosTms = createAxios(process.env.API_TMS[process.env.NODE_ENV])

export { defaultAxios }
