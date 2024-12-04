<template>
  <q-page class="q-pa-lg">
    <div style="max-width: 1280px; margin: 0 auto;">
      <div class="row">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                Reset User Password
              </div>
            </q-card-section>
            <q-card-section class="form">
              <q-form
                class="q-gutter-md"
                ref="form"
                @submit="onSubmit"
              >
                <template>
                  <q-select
                    label="User"
                    filled
                    v-model="$v.form.selectedUser.$model"
                    use-input
                    color="red-9"
                    :options="users"
                    @filter="onFilterUsers"
                    class="form"
                    no-autocomplete
                    @virtual-scroll="onScroll"
                    @blur="onOut"
                    @input="onOut"
                    :rules="[
                      val => $v.form.selectedUser.required || 'Please select username'
                    ]"
                  >
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No results
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </template>
                <template>
                  <q-input
                    v-model="$v.form.password.$model"
                    label="Password"
                    :type="isPwd ? 'password' : 'text'"
                    lazy-rules
                    color="red-8"
                    :rules="[
                      val => $v.form.password.required || 'Please type something',
                      val => $v.form.password.minLength || 'Minimum length 8 character'
                    ]"
                    class="form"
                    autocomplete="new-password"
                  >
                    <template #append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
                </template>
                <template>
                  <q-input
                    v-model="$v.form.confirmPassword.$model"
                    label="Confirm Password"
                    :type="isPwdConf ? 'password' : 'text'"
                    lazy-rules
                    color="red-8"
                    :rules="[
                      val => $v.form.confirmPassword.sameAsPassword || 'Password must match'
                    ]"
                    class="form"
                  >
                    <template #append>
                      <q-icon
                        :name="isPwdConf ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwdConf = !isPwdConf"
                      />
                    </template>
                  </q-input>
                </template>
                <div class="col-12 row items-center justify-center">
                  <q-btn
                    type="submit"
                    flat
                    style="color: #fff;"
                    class="text-capitalize btn-psa"
                    label="Submit"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  data () {
    return {
      name: 'Reset User Password',
      users: [],
      usersClone: [],
      form: {
        password: '',
        confirmPassword: '',
        selectedUser: ''
      },
      isPwd: true,
      isPwdConf: true,
      skip: 0,
      search: '',
      total: true
    }
  },
  validations: {
    form: {
      selectedUser: {
        required
      },
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
  methods: {
    onScroll ({ index }) {
      if (index === this.users.length - 1 && this.total) {
        this.onRequest()
      }
    },
    onOut () {
      this.users = this.usersClone
    },
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
        this.form.user = this.$store.getters['auth/user']
        this.$store.dispatch('user/resetUserPassword', { form: this.form }).then(res => {
          if (res) {
            this.onReset()
            this.$refs.form.reset()
          }
        })
      }
    },
    async onRequest () {
      try {
        if (this.search) return
        else this.skip = this.skip + 50
        const { company } = await this.$store.getters['auth/user']
        const query = {
          username: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company,
          $select: ['_id', 'username'],
          $limit: 50,
          $skip: this.skip
        }

        const { data, total } = await this.$store.dispatch('users/find', { paginate: false, query })

        data.map(val => {
          this.users.push({ label: val.username, value: val._id, selected: false })
        })

        if (this.users.length > data.length) {
          this.usersClone = this.users
        }

        if (total === this.users.length) this.total = false
      } catch (err) {
        console.log(err, 'Error getting users')
      }
    },
    async onFilterUsers (val, update) {
      try {
        if (val && val.length < 3) return
        if (this.search && !val) this.onOut()
        this.search = val
        const { company } = await this.$store.getters['auth/user']
        const query = {
          username: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company,
          $select: ['_id', 'username'],
          $limit: 50
        }

        const { data, total } = await this.$store.dispatch('users/find', { paginate: false, query })

        update(() => {
          if (this.users.length && !val) {
            this.users.map(val => {
              return { label: val.username, value: val._id, selected: false }
            })
          } else if (val) {
            this.users = data.map(val => {
              return { label: val.username, value: val._id, selected: false }
            })
          } else {
            this.users = data.map(val => {
              return { label: val.username, value: val._id, selected: false }
            })
          }
        })
        if (!val && total === this.users.length) this.total = false
      } catch (err) {
        console.log(err, 'Error getting users')
      }
    },
    onReset () {
      this.form.selectedUser = null
      this.form.password = null
      this.form.confirmPassword = null
    }
  }
}
</script>

<style>
  .form {
    max-width: 700px;
    margin: 0 auto;
  }

  .btn-psa {
    background-color: #931b1d;
  }
</style>
