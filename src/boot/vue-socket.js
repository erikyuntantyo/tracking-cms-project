import Vue from 'vue'
import store from '../store'
import io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'

const connection = io(process.env.API[process.env.NODE_ENV], {
  transports: ['websocket'],
  upgrade: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
})

Vue.use(new VueSocketIO({
  debug: process.env.NODE_ENV !== 'production',
  connection,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
}))

export default connection
