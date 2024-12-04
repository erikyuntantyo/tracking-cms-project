<template>
  <q-layout class="bg">
    <q-page-container>
      <q-page class="row col-12">
        <div class="col-12 row items-center justify-center">
          <div class="col-6">
            <center>
              <p class="title-page">
                Forgot Password
              </p>
            </center>
            <q-form
              class="q-gutter-md"
              @submit="onSubmit"
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
                v-model="email"
                label="Email"
                lazy-rules
                :rules="[ val => val && val.length > 0 || 'Please type something']"
                helper="Enter your registered email address to reset your password"
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
              <q-btn
                type="submit"
                flat
                style="color: #fff;"
                class="full-width text-capitalize btn-psa"
                label="Send"
              />
            </q-form>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PageForgotPassword',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  data () {
    return {
      email: '',
      mobile: '',
      way: { label: 'Username / E-mail', value: 'email' },
      ways: [
        { label: 'Username / E-mail', value: 'email' },
        { label: 'Mobile', value: 'mobile' }
      ]
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
  computed: {
    ...mapState({
      submitting: state => state.auth.showLoading
    }),
    disableSubmit () {
      return this.$v.form.$invalid
    }
  },
  methods: {
    onSubmit () {
      const { email, mobile } = this
      const data = {
        email: email || mobile.replace(/-|\s/g, ''),
        device: 'portal'
      }
      this.$store.dispatch('user/forgotPassword', data)
    }
  }
}
</script>

<style>
  .btn-psa {
    background-color: #931b1d;
  }

  .title-page {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: bold;
    text-transform: capitalize;
    font-size: 28px;
    color: black;
    margin-bottom: 50px;
  }
</style>
