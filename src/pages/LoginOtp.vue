<template>
  <div class="main-container relative-position">
    <div class="box-container col-12">
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          color="red-9"
          filled
          autocomplete="new-password"
          label="Enter the OTP"
          v-model="otp"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />

        <div class="flex justify-between items-center">
          <div>
            <q-btn
              type="submit"
              class="text-bold text-capitalize q-mr-sm"
              padding="sm lg"
              unelevated
              color="red-9"
              label="Submit"
            />

            <q-btn
              flat
              padding="sm md"
              label="Resend OTP"
              @click="resendOtp"
            />
          </div>

          <q-btn
            flat
            padding="sm md"
            label="Logout"
            @click="onLogout"
          />
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

export default {
  name: 'LoginOtp',

  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },

  data () {
    return {
      otp: '',
      version
    }
  },
  mounted () {
    if (this.$store.getters['auth/isAuthenticated'] && (typeof this.$store.getters['auth/user'].firstLogin === 'undefined' || this.$store.getters['auth/user'].firstLogin) === false) this.$router.push('/')
  },
  methods: {
    async onSubmit () {
      try {
        const user = this.$store.getters['auth/user']

        await this.$store.dispatch('user/sendOtp', {
          user: { _id: user._id },
          type: 'first-login',
          otp: this.otp,
          device: 'portal'
        })

        this.$router.push('/vehicle-tracking')
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message,
          icon: 'error',
          position: 'top'
        })
      }
    },

    async resendOtp () {
      const user = await this.$store.getters['auth/user']

      this.$q.notify({
        color: 'positive',
        message: `OTP sent. Check your ${user.preferredComm}`,
        position: 'top'
      })

      await this.$store.dispatch('user/requestOtp', {
        user: { _id: user._id },
        type: 'first-login',
        device: 'portal'
      })
    },

    async onLogout () {
      this.$store.dispatch('auth/logout')
        .then(res => {
          this.$socket.disconnect()
          localStorage.removeItem('vehicles')
          this.$router.push('/login')
        })
        .catch(err => {
          console.log(err)
        })
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
