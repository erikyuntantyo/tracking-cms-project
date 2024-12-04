import { Notify } from 'quasar'

export default {
  methods: {
    showNotify (status, msg) {
      let color = ''
      let icon = ''

      switch (status) {
        case 'success':
          color = 'positive'
          icon = 'check_circle'
          break

        case 'fail':
          color = 'negative'
          icon = 'warning'
          break
      }

      return Notify.create({
        color,
        position: 'top',
        message: msg,
        icon
      })
    }
  }
}
