<template>
  <q-layout view="lHh LpR lFf">
    <q-header
      bordered
      class="bg-red-10 text-red-1"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="onSidebarChanged"
        />

        <q-toolbar-title class="text-capitalize">
          {{ $store.getters['page/pageTitle'] }}
        </q-toolbar-title>
        <div v-if="forCdas">
          <div class="col-12 row items-center">
            <div class="col-5 row justify-end q-pr-sm">
              <q-btn
                flat
                icon="refresh"
                @click="reCheckOnline"
              />
            </div>
            <div class="col-7 row">
              <div class="col-12">
                User Online Mobile: <span class="text-bold">{{ online.mobile }}</span>
              </div>
              <div class="col-12">
                User Online Portal: <span class="text-bold">{{ online.portal }}</span>
              </div>
            </div>
          </div>
        </div>
        <q-btn
          flat
          dense
          no-caps
        >
          <user-info
            :user="user"
            :role="role"
            @logout="onLogout"
          />
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <main-menu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-red-10 text-red-1 q-py-xs q-px-md text-center">
      v{{ version }}
    </q-footer>
  </q-layout>
</template>

<script>
import { mapMutations } from 'vuex'
import { version } from '../../package.json'
import MainMenu from '../components/Menu'
import UserInfo from '../components/UserInfo'

export default {
  name: 'MainLayout',
  components: {
    MainMenu,
    UserInfo
  },
  async mounted () {
    await this.$store.dispatch('roles-acl/get', this.$store.getters['auth/user'].roleAcl)
    await this.setUserInfo()
    await this.reCheckOnline()
  },
  data () {
    return {
      title: 'CTR',
      user: '',
      role: '',
      online: {
        mobile: 0,
        portal: 0
      },
      forCdas: false,
      leftDrawerOpen: false,
      version
    }
  },
  sockets: {
    'users-online resultUserOnline' (data) {
      this.online = data
    }
  },
  methods: {
    ...mapMutations({
      resetFilters: 'messagefilters/resetData'
    }),
    onSidebarChanged () {
      this.leftDrawerOpen = !this.leftDrawerOpen
      if (this.$map) setTimeout(() => this.$map.invalidateSize(), 500)
    },
    async onLogout () {
      const { _id, device } = await this.$store.getters['auth/user']
      this.$q.dialog({
        title: 'Logout',
        message: 'Are you sure you want to logout the system?',
        cancel: { color: 'red-9', flat: true, padding: 'sm lg' },
        ok: { color: 'red-9', unelevated: true, padding: 'sm lg' }
      }).onOk(async () => {
        this.$store.dispatch('user/clearDevice', { userId: _id, device }).then(res => {
          this.$store.dispatch('auth/logout')
            .then(async res => {
              await this.$feathersClient.service('token/revoke').create({})
              this.$socket.emit('remove', 'authentication', localStorage.getItem('feathers-jwt'))
              this.$socket.disconnect()
              clearInterval(this.$q.localStorage.getItem('refresh'))
              this.resetFilters()
              localStorage.clear()
              this.$router.push('/login')
            })
            .catch(err => {
              console.log(err)
            })
        })
      })
    },
    async setUserInfo () {
      const user = await this.$store.getters['auth/user']
      const roleAcl = await this.$store.getters['roles-acl/get'](user.roleAcl)

      this.forCdas = roleAcl.forCdas
      this.user = user.fullname || user.username
      this.role = roleAcl.name
    },
    reCheckOnline () {
      this.$feathersClient.service('users-online').find()
    }
  }
}
</script>
