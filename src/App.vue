<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { AbilityBuilder } from '@casl/ability'

export default {
  name: 'App',

  watch: {
    'auth.isAuthenticatePending' (val) {
      if (!val) {
        if (this.$store.getters['auth/isAuthenticated']) {
          const user = this.$store.getters['auth/user']

          user && !user.status
            ? this.logout()
            : this.updateAbilities()
        } else {
          this.$ability.update([])
        }
      }
    },
    'auth.accessToken' (val) {
      const data = {
        strategy: 'jwt',
        accessToken: val
      }
      this.$socket.emit('create', 'authentication', data)
    },
    '$store.state.message.titlePage': {
      handler (title) {
        this.titlePage = title
      }
    }
  },

  data () {
    return {
      titlePage: this.$store.state.message.titlePage,
      role: ''
    }
  },

  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  sockets: {
    'test-connection/ping ping' (data) {
      this.$feathersClient.service('test-connection/pong').create(data)
    },
    connect () {
      const data = {
        strategy: 'jwt',
        accessToken: localStorage.getItem('feathers-jwt')
      }
      this.$socket.emit('create', 'authentication', data)
    },
    disconnect () {
      setTimeout(() => {
        this.$socket.connect()
      }, 5000)
    },
    'users inactive' (data) {
      this.logout()
    },
    'messages created' (data) {
      this.pushMessage(data)
    },
    'users-online broadcast' () {
      const dataParams = {
        os: 'portal',
        user: this.$store.getters['auth/user']
      }

      this.$socket.emit('create', 'users-online', dataParams)
    },
    'groups inactive' (data) {
      this.logout()
    }
  },

  computed: mapState(['auth']),

  methods: {
    ...mapMutations({
      updateTitlePage: 'message/updateTitlePage'
    }),
    ...mapActions('vehicles', {
      getVehicles: 'get'
    }),
    async logout () {
      await this.$socket.emit('remove', 'authentication', localStorage.getItem('feathers-jwt'))

      this.$store.dispatch('auth/logout')
        .then(res => {
          this.$socket.disconnect()
          clearInterval(this.$q.localStorage.getItem('refresh'))
          localStorage.clear()
          this.$router.push('/login')
        })
        .catch(err => {
          console.log(err)
        })
    },

    async updateAbilities () {
      const user = await this.$store.getters['auth/user']
      const role = await this.$store.dispatch('roles-acl/get', user.roleAcl)

      const { can, cannot, rules } = new AbilityBuilder()

      await role.modules.forEach(el => {
        el.allowCreate
          ? can('create', el.name)
          : cannot('create', el.name)

        el.allowUpdate
          ? can('update', el.name)
          : cannot('update', el.name)

        el.allowRead
          ? can('read', el.name)
          : cannot('read', el.name)

        el.allowDelete
          ? can('delete', el.name)
          : cannot('delete', el.name)
      })

      await this.$ability.update(rules)
    },

    async pushMessage (data) {
      let vehicle = null
      let filterVehicles = (this.$store.state.messagefilters && this.$store.state.messagefilters.filters) ? this.$store.state.messagefilters.filters.vehicles : []

      filterVehicles = (filterVehicles.length > 0) ? filterVehicles.map(v => { return v._id }) : []

      if (data.isDriver && data.vehicle) {
        vehicle = await this.getVehicles(data.vehicle)
      }

      if (filterVehicles.length > 0 && filterVehicles.includes(data.conversations.vehicle)) this.showNotification(data, vehicle)
    },
    showNotification (data, vehicle) {
      if (
        data.content &&
        data.sender &&
        data.sender._id !== this.$store.getters['auth/user']._id &&
        data.conversations && data.conversations.vehicle
      ) {
        const title = (vehicle) ? `${vehicle.vehicleNo} - ${data.sender.fullname}` : data.sender.fullname
        this.$notification.show(title, {
          body: data.content.replace(/<br\/>/g, '\n'),
          tag: data._id.toString()
        }, {})
        this.updateTitlePage('New Message')
      }
    }
  }
}
</script>
