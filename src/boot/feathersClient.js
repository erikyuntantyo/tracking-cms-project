import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import { iff, discard } from 'feathers-hooks-common'
import feathersVuex from 'feathers-vuex'
import axios from 'axios'
import Vue from 'vue'
import socket from './vue-socket'
import { parse, stringify } from 'qs'

const restClient = rest(process.env.API[process.env.NODE_ENV])
axios.defaults.timeout = 20000

const feathersClient = feathers()
  .configure(restClient.axios(
    axios.create({
      paramsSerializer: {
        encode: parse,
        serialize: stringify
      }
    })
  ))
  .configure(auth({ storage: window.localStorage }))
  .hooks({
    before: {
      all: [
        iff(
          context => ['create', 'update', 'patch'].includes(context.method),
          discard('__id', '__isTemp')
        ),
        async ctx => {
          if (
            ctx.path !== 'authentication' &&
            ctx.method !== 'post'
          ) {
            if (!ctx.params.headers) ctx.params.headers = {}
            ctx.params.headers.Authorization = localStorage.getItem(ctx.path.includes('token') ? 'refresh-token' : 'feathers-jwt')
          }
        }
      ]
    },
    after: {
      all: [
        async ctx => {
          if (ctx.path.includes('token') && ctx.method === 'create') {
            await feathersClient.authentication.setAccessToken(ctx.result.accessToken)

            if (Vue.store) {
              Vue.store.commit('auth/setAuthenticatePending')
              Vue.store.commit('auth/setAccessToken', ctx.result.accessToken)
              Vue.store.commit('auth/clearAuthenticateError')
            }

            socket.emit('create', 'authentication', {
              strategy: 'jwt',
              accessToken: ctx.result.accessToken
            })
          }
        }
      ]
    }
  })

Vue.prototype.$feathersClient = feathersClient

export default feathersClient

// Setting up feathers-vuex
const {
  makeServicePlugin,
  makeAuthPlugin,
  BaseModel,
  models,
  FeathersVuex
} = feathersVuex(feathersClient, {
  serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
  idField: '_id', // Must match the id field in your database table/collection
  whitelist: ['$regex', '$options']
})

export { makeAuthPlugin, makeServicePlugin, BaseModel, models, FeathersVuex }
