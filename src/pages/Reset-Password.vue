<template>
  <q-layout class="bg">
    <q-page-container>
      <q-page class="row col-12">
        <div class="col-12 row items-center justify-center">
          <div class="col-6">
            <center>
              <p class="title-page">
                Reset Password
              </p>
            </center>
            <q-form
              class="q-gutter-md"
              @submit="onSubmit"
            >
              <q-input
                v-model="$v.form.otp.$model"
                label="Enter Your OTP Code"
                lazy-rules
                :rules="[
                  val => $v.form.otp.required || 'Please type something'
                ]"
              />
              <q-input
                v-model="$v.form.password.$model"
                label="Password"
                :type="isPwd ? 'password' : 'text'"
                lazy-rules
                :rules="[
                  val => $v.form.password.required || 'Please type something',
                  val => $v.form.password.minLength || 'Minimum length 8 character'
                ]"
              >
                <template #append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <q-input
                v-model="$v.form.confirmPassword.$model"
                label="Confirm Password"
                :type="isPwdConf ? 'password' : 'text'"
                lazy-rules
                :rules="[
                  val => $v.form.confirmPassword.sameAsPassword || 'Password must match'
                ]"
              >
                <template #append>
                  <q-icon
                    :name="isPwdConf ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwdConf = !isPwdConf"
                  />
                </template>
              </q-input>
              <q-btn
                type="submit"
                flat
                style="color: #fff;"
                class="full-width text-capitalize btn-psa"
                label="Send"
              />
              <q-btn
                flat
                style="color: black;"
                class="full-width text-capitalize"
                label="Resend Code"
                @click="resendCode"
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
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  name: 'PageResetPassword',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  data () {
    return {
      form: {
        otp: '',
        password: '',
        confirmPassword: ''
      },
      isPwd: true,
      isPwdConf: true
    }
  },
  validations: {
    form: {
      otp: { required },
      password: {
        required,
        minLength: minLength(8)
      },
      confirmPassword: {
        sameAsPassword: sameAs(form => {
          return form.password
        })
      }
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
      this.$v.$touch()
      if (this.$v.form.$error) {
        this.$q.notify({
          color: 'negative',
          message: 'Please review fields again.',
          icon: 'error',
          position: 'top'
        })
      } else {
        this.$store.dispatch('user/resetPassword', { form: this.form })
      }
    },
    resendCode () {
      this.$store.dispatch('user/resendCode', { email: this.$q.localStorage.getItem('emailUser'), device: 'portal' })
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
