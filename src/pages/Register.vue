<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274c5, #5a4a9f);"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card
          square
          class="shadow-24"
          style="width: 300px;height: auto;"
        >
          <q-card-section class="bg-deep-purple-7">
            <h4 class="text-h5 text-white q-my-md">
              Register
            </h4>
            <div
              class="absolute-bottom-right q-pr-md"
              style="transform: translateY(50%);"
            >
              <q-btn
                fab
                icon="add"
                color="purple-4"
              />
            </div>
          </q-card-section>
          <q-form
            class="q-px-sm q-pt-xl"
            @submit="onSubmit"
          >
            <q-card-section>
              <q-field
                @blur="$v.form.username.$touch"
                :error="$v.form.username.$error"
                helper="Enter your username"
                error-label="Please type a valid username"
              >
                <q-input
                  square
                  clearable
                  v-model="$v.form.username.$model"
                  type="text"
                  label="Username"
                >
                  <template #prepend>
                    <q-icon name="people" />
                  </template>
                </q-input>
              </q-field>
              <q-field
                @blur="$v.form.email.$touch"
                :error="$v.form.email.$error"
                helper="Enter your email"
                error-label="Please type a valid email"
              >
                <q-input
                  square
                  clearable
                  v-model="$v.form.email.$model"
                  type="email"
                  label="Email"
                >
                  <template #prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </q-field>
              <q-field
                @blur="$v.form.password.$touch"
                :error="$v.form.password.$error"
                helper="Enter your password"
                error-label="Please type a valid password"
              >
                <q-input
                  square
                  clearable
                  v-model="$v.form.password.$model"
                  type="password"
                  label="Password"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>
              </q-field>
              <q-field
                @blur="$v.form.confirmPassword.$touch"
                :error="$v.form.confirmPassword.$error"
                helper="Enter your Confirm Password"
                error-label="Please type a valid confirm password"
              >
                <q-input
                  square
                  clearable
                  v-model="$v.form.confirmPassword.$model"
                  type="password"
                  label="Current Password"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #error>
                    <div v-if="!$v.form.confirmPassword.sameAsPassword">
                      Passwords must match.
                    </div>
                  </template>
                </q-input>
              </q-field>
              <q-field
                @blur="$v.form.mobile.$touch"
                :error="$v.form.mobile.$error"
                helper="Enter your mobile phone number"
                error-label="Please type a valid phone number"
              >
                <q-input
                  square
                  clearable
                  v-model="$v.form.mobile.$model"
                  type="text"
                  label="Phone Number"
                >
                  <template #prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </q-field>
            </q-card-section>
            <q-card-actions class="q-px-lg">
              <q-btn
                type="submit"
                unelevated
                size="lg"
                color="purple-4"
                class="full-width text-white"
                label="Register"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import { required, email, sameAs } from 'vuelidate/lib/validators'

export default {
  name: 'RegisterPage',
  data () {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        mobile: ''
      }
    }
  },
  validations: {
    form: {
      email: { required, email },
      password: { required },
      confirmPassword: {
        sameAsPassword: sameAs(form => {
          return form.password
        })
      },
      username: { required },
      name: { required },
      mobile: { required }
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
        this.$q.notify('Please review fields again.')
      } else {
        this.$store.dispatch('user/registerUser', { form: this.form })
      }
    }
  }
}
</script>
