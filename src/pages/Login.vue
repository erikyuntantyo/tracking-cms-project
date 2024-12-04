<template>
  <div class="main-container relative-position">
    <div class="box-container col-12">
      <p class="text-h4 text-center q-mb-xl">
        CTR
      </p>

      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-select
          color="red-9"
          filled
          label="Select a login method *"
          v-model="way"
          :options="ways"
          lazy-rules
          :rules="[ val => val || 'Please choose something' ]"
          @input="username = ''"
        />

        <q-input
          v-if="way.value === 'email'"
          color="red-9"
          filled
          autocomplete="new-password"
          label="Username / E-Mail *"
          v-model="email"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />

        <div v-if="way.value === 'mobile'">
          <vue-tel-input
            mode="international"
            v-model="mobile"
            required
            valid-characters-only
            disabled-formatting
            enabled-country-code
            default-country="SG"
          />
        </div>

        <q-input
          color="red-9"
          filled
          autocomplete="new-password"
          v-model="password"
          label="Password *"
          :type="isPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        >
          <template #append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <div class="flex justify-between items-center">
          <q-btn
            type="submit"
            class="text-bold text-capitalize"
            padding="sm lg"
            unelevated
            color="red-9"
            label="Submit"
          />

          <router-link
            to="/forgot-password"
            class="text-blue-9 text-subtitle2"
            style="text-decoration: none;"
          >
            Forgot Password?
          </router-link>
        </div>
      </q-form>
    </div>

    <div class="app-footer bg-red-10 text-red-1 q-py-xs q-px-md text-center col-12">
      v{{ version }}
    </div>
  </div>
</template>

<script>
import { version } from '../../package.json'
import { AbilityBuilder } from '@casl/ability'

export default {
  name: 'LoginPage',

  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },

  watch: {
    email (val) {
      if (val) this.mobile = ''
    },
    mobile (val) {
      if (val) this.email = ''
    }
  },

  data () {
    return {
      email: '',
      mobile: '',
      password: '',
      timeClick: [],
      isPwd: true,
      way: { label: 'Username / E-mail', value: 'email' },
      ways: [
        { label: 'Username / E-mail', value: 'email' },
        { label: 'Mobile', value: 'mobile' }
      ],
      version
    }
  },
  mounted () {
    if (this.$store.getters['auth/isAuthenticated']) this.$router.push('/')
  },
  methods: {
    async onSubmit (e) {
      this.timeClick.push(e.timeStamp)
      const { email, mobile, password } = this
      if (this.timeClick.length === 1) {
        const data = {
          strategy: 'local',
          email: email || mobile.replace(/-|\s/g, ''),
          password,
          device: { os: 'computer', FCMId: 'portal' },
          remember: true
        }
        await this.$store.dispatch('auth/authenticate', data)
          .then(res => {
            res.user && (typeof res.user.firstLogin === 'undefined' || res.user.firstLogin)
              ? this.$router.push('/login-otp')
              : this.$router.push('/vehicle-tracking')

            if (res.refreshToken) localStorage.setItem('refresh-token', res.refreshToken)

            this.$q.notify({
              color: 'positive',
              message: res.user && (typeof res.user.firstLogin === 'undefined' || res.user.firstLogin) ? `OTP sent. Check your ${res.user.preferredComm}` : 'Login successful',
              icon: 'done',
              position: 'top'
            })

            if (this.$socket.disconnected) this.$socket.connect()

            const data = {
              strategy: 'jwt',
              accessToken: localStorage.getItem('feathers-jwt')
            }
            this.$socket.emit('create', 'authentication', data)

            this.updateAbilities()
          })
          .catch(err => {
            let message = ''
            if (err.code) {
              message = err.message
            } else {
              message = 'Unable to reach webservice. Please contact your administrator.'
            }
            this.$q.notify({
              color: 'negative',
              message: message,
              icon: 'error',
              position: 'top'
            })
            this.timeClick = []
          })
      }
    },
    async updateAbilities () {
      const user = await this.$store.getters['auth/user']
      const role = await this.$store.dispatch('roles-acl/get', user.roleAcl)
      const roleAcl = this.$store.getters['roles-acl/get'](user.roleAcl)
      localStorage.setItem('forCdas', roleAcl.forCdas)

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
    }
  }
}
</script>

<style>
.main-container {
  height: 100vh;
  display: flex;
  align-items: center;
}

.box-container {
  margin: 0 auto;
  padding: 0 10px;
  max-width: 500px;
  width: 100%;
}

.app-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

@media (min-width: 768px) {
  .box-container {
    padding: 0;
  }
}
</style>
