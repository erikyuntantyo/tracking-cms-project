<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          v-model.trim="fullname"
          label="Fullname *"
          color="red-9"
          autofocus
          :rules="[
            val => !!val || 'Please type something'
          ]"
        />

        <q-input
          v-model.trim="username"
          label="Username *"
          color="red-9"
          lazy-rules
          :readonly="!isNew"
          :rules="[
            val => !!val || 'Please type something',
            isUsername,
            isUniqueUsername
          ]"
        />

        <div>
          <div class="q-field__label text-caption q-mb-xs">
            Mobile *
          </div>
          <vue-tel-input
            v-model="mobile"
            mode="international"
            required
            valid-characters-only
            disabled-fetching-country
            default-country="sg"
          />
        </div>

        <q-input
          v-model="email"
          type="email"
          label="E-mail"
          color="red-9"
          lazy-rules
          :rules="[
            isEmail,
            isUniqueEmail
          ]"
        />

        <q-select
          v-model="status"
          :options="options.statusses"
          label="Status *"
          color="red-9"
          lazy-rules
          :rules="[val => !!val || 'Please type something']"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div>
          <div class="q-field__label text-caption q-mb-sm">
            2FA Notification Channel *
          </div>
          <div class="q-col-gutter-md">
            <q-radio
              v-model="preferredComm"
              dense
              val="email"
              label="E-Mail"
              color="red-9"
              class="q-mt-none"
              :disable="!email"
            />

            <q-radio
              v-model="preferredComm"
              dense
              val="sms"
              label="SMS"
              color="red-9"
              class="q-mt-none"
            />

            <q-radio
              v-model="preferredComm"
              dense
              val="push"
              label="Push Notification"
              color="red-9"
              class="q-mt-none"
            />
          </div>
        </div>

        <q-input
          v-if="isNew"
          v-model="password"
          color="red-9"
          autocomplete="new-password"
          label="Password *"
          :type="isPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[val => !!val || 'Please type something']"
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
          v-if="isNew"
          v-model="passwordConfirmation"
          color="red-9"
          autocomplete="new-password"
          label="Confirm Password *"
          :type="isConPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[
            val => !!val || 'Please type something',
            val => val === this.password || 'Password confirmation doesn\'t match'
          ]"
        >
          <template #append>
            <q-icon
              :name="isConPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConPwd = !isConPwd"
            />
          </template>
        </q-input>

        <q-select
          v-model="roleAcl"
          :options="options.rolesAcl"
          @filter="onFilterRoles"
          label="Role *"
          color="red-9"
          use-input
          clearable
          lazy-rules
          :rules="[val => !!val || 'Please type something']"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div class="text-right q-mt-lg">
          <q-btn
            label="Back"
            padding="sm lg"
            @click.prevent="$router.go(-1)"
            color="red-9"
            flat
          />

          <q-btn
            label="Submit"
            type="submit"
            class="q-ml-sm"
            padding="sm lg"
            unelevated
            color="red-10"
            text-color="red-1"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'CDASUserEdit',

  data () {
    return {
      fullname: '',
      username: '',
      mobile: '',
      email: '',
      status: { label: 'Active', value: true },
      preferredComm: 'sms',
      roleAcl: null,
      password: '',
      passwordConfirmation: '',
      options: {
        statusses: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ],
        rolesAcl: []
      },
      isPwd: true,
      isConPwd: true
    }
  },

  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },

  watch: {
    email (v) {
      if (!v && this.preferredComm === 'email') this.preferredComm = 'sms'
    }
  },

  created () {
    if (!this.isNew) this.getSelectedData()
  },

  methods: {
    ...mapActions('users', {
      getUser: 'get',
      createUser: 'create',
      patchUser: 'patch'
    }),
    isUniqueUsername (v) {
      const query = {
        username: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }

      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      return this.$store.dispatch('users/find', { query })
        .then(res => {
          return !res.total || 'Username already exists'
        })
    },
    isUniqueEmail (v) {
      if (v) {
        const query = {
          email: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        }

        if (!this.isNew) query._id = { $ne: this.$route.params.id }

        return this.$store.dispatch('users/find', { query })
          .then(res => {
            return !res.total || 'Email already exists'
          })
      }

      return true
    },
    isUsername (val) {
      const pattern = /^[a-z0-9_.-]*$/

      return pattern.test(val) || 'Invalid username format, use lowercase, digits, (_), (.), or (-)'
    },
    isEmail (val) {
      if (val) {
        const pattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/

        return pattern.test(val) || 'Invalid email format'
      }

      return true
    },
    async getSelectedData () {
      const query = {
        group: { $exists: false },
        company: { $exists: false }
      }
      const { fullname, username, mobile, email, status, preferredComm, roleAcl } = await this.getUser(this.$route.params.id, { query })

      this.fullname = fullname || ''
      this.username = username
      this.mobile = mobile
      this.email = email || ''
      this.preferredComm = preferredComm
      this.status = { label: status ? 'Active' : 'Inactive', value: status }

      // Set user role
      await this.$store.dispatch('roles-acl/get', roleAcl)
        .then(({ _id, name }) => (this.roleAcl = { label: name, value: _id }))
        .catch('')
    },
    onFilterGroups (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 1
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.groups = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    onFilterCompanies (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        parent: this.group ? this.group.value : { $exists: false }
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.companies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    onFilterRoles (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        forCdas: true
      }

      this.$store.dispatch('roles-acl/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.rolesAcl = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    async onSubmit () {
      const user = this.$store.getters['auth/user']
      const {
        fullname,
        username,
        email,
        status,
        preferredComm,
        password,
        roleAcl
      } = await this
      const mobile = this.mobile.replace(/-|\s/g, '')
      let role = null

      if (roleAcl) {
        await this.$store.dispatch('roles/find', {
          query: {
            name: { $regex: '^administrator$', $options: 'i' }
          }
        })
          .then(res => {
            role = res.data.length ? res.data[0]._id : null
          })
      }

      const data = await {
        fullname,
        username,
        email,
        mobile,
        status: status.value,
        preferredComm,
        role,
        roleAcl: roleAcl.value
      }

      if (this.isNew) {
        data.password = password
        data.createdBy = user._id

        this.createUser(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'User created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/cdas-users')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create user',
              icon: 'error',
              position: 'top'
            })
          })
      } else {
        data.updatedBy = user._id

        this.patchUser([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'User updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/cdas-users')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to update user',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
