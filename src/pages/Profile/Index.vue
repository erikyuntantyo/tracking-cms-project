<template>
  <q-page padding>
    <div style="max-width: 1280px; margin: 0 auto;">
      <q-card>
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="tab"
            active-color="red-9"
            indicator-color="red-9"
            align="justify"
          >
            <q-tab
              name="user"
              label="User Detail"
            />
            <q-tab
              name="password"
              label="Change Password"
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="tab"
            animated
          >
            <q-tab-panel
              name="user"
              class="q-pa-lg"
            >
              <profile-detail
                :fullname.sync="fullname"
                :username.sync="username"
                :mobile.sync="mobile"
                :email.sync="email"
                :preferred-comm.sync="preferredComm"
                :group.sync="group"
                :company.sync="company"
                :role-acl.sync="roleAcl"
                @submit="onChangeProfile"
              />
            </q-tab-panel>

            <q-tab-panel
              name="password"
              class="q-pa-lg"
            >
              <change-password
                ref="formChangePassword"
                :old-password.sync="oldPassword"
                :password.sync="password"
                :password-confirmation.sync="passwordConfirmation"
                @submit="onPasswordChange"
              />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>
    <q-dialog
      v-model="dialogOtp"
      persistent
    >
      <q-card style="min-width: 350px;">
        <q-card-section align="center">
          <div class="text-h6">
            OTP Code
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            input-class="text-black text-center"
            color="red-9"
            dense
            v-model="otpCode"
            autofocus
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Resend Code"
            type="button"
            @click="resendOtp"
          />
          <q-space />
          <q-btn
            label="Submit"
            flat
            color="red-9"
            @click="sendOtp"
          />
          <q-btn
            flat
            label="Cancel"
            @click="cancelOtp"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'
import ProfileDetail from './components/ProfileDetail'
import ChangePassword from './components/ChangePassword'
export default {
  name: 'ProfileIndex',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  components: {
    ProfileDetail,
    ChangePassword
  },
  data () {
    return {
      dialogOtp: false,
      otpType: '',
      otpCode: '',
      fullname: '',
      username: '',
      mobile: '',
      email: '',
      preferredComm: '',
      group: null,
      company: null,
      roleAcl: null,
      password: '',
      oldPassword: '',
      passwordConfirmation: '',
      tab: 'user'
    }
  },
  watch: {
    email (v) {
      if (!v && this.preferredComm === 'email') this.preferredComm = ''
    }
  },
  created () {
    this.getSelectedUser()
  },
  methods: {
    ...mapActions('users', {
      patchUser: 'patch'
    }),
    async getSelectedUser () {
      const { fullname, username, mobile, email, group, company, preferredComm, roleAcl } = await this.$store.getters['auth/user']

      this.fullname = fullname || ''
      this.username = username
      this.mobile = mobile
      this.email = email || ''
      this.preferredComm = preferredComm

      // Set user organization
      if (group) {
        this.$store.dispatch('groups/get', group._id || group)
          .then(({ _id, name }) => (this.group = { label: name, value: _id }))
          .catch('')
      }

      if (company) {
        this.$store.dispatch('groups/get', company._id || company)
          .then(({ _id, name }) => (this.company = { label: name, value: _id }))
          .catch('')
      }

      // Set user role
      if (roleAcl) {
        this.$store.dispatch('roles-acl/get', roleAcl._id || roleAcl)
          .then(({ _id, name }) => (this.roleAcl = { label: name, value: _id }))
          .catch('')
      }
    },
    async onChangeProfile () {
      this.otpType = 'update-profile'
      await this.requestOtp()
      this.$q.notify({
        color: 'positive',
        message: 'Please enter the OTP code that we sent to you.',
        icon: 'error',
        position: 'top'
      })
      this.dialogOtp = true
    },
    async onSubmit () {
      const user = await this.$store.getters['auth/user']
      const { fullname, email, preferredComm } = this
      const mobile = this.mobile.replace(/-|\s/g, '')

      this.patchUser([user._id, { fullname, email, mobile, preferredComm }])
        .then(res => {
          this.$q.notify({
            color: 'positive',
            message: 'Profile created successfully',
            icon: 'done',
            position: 'top'
          })
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to update profile',
            icon: 'error',
            position: 'top'
          })
        })
    },
    async requestOtp () {
      const userData = await this.$store.getters['auth/user']
      this.$store.dispatch('user/requestOtp',
        {
          user: {
            _id: userData._id
          },
          type: this.otpType,
          device: 'portal'
        }
      )
    },
    async resendOtp () {
      this.requestOtp()
      this.$q.notify({
        color: 'positive',
        message: 'Resend OTP Success.',
        icon: 'error',
        position: 'top'
      })
    },
    cancelOtp () {
      if (this.otpType === 'change-password') {
        const oldPassword = this.password
        const password = this.oldPassword
        const passwordConfirmation = this.oldPassword
        this.$store.dispatch('user/changePassword', { oldPassword, password, passwordConfirmation })
        this.$q.notify({
          message: 'Update Password Canceled',
          color: 'positive',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async sendOtp () {
      const userData = await this.$store.getters['auth/user']
      this.$store.dispatch('user/sendOtp',
        {
          user: {
            _id: userData._id
          },
          otp: this.otpCode,
          type: this.otpType,
          device: 'portal'
        }
      ).then(res => {
        if (res.success === true) {
          this.otpCode = ''
          this.dialogOtp = false
          if (this.otpType === 'change-password') {
            this.$q.notify({
              color: 'positive',
              message: 'Password changed successfully',
              icon: 'done',
              position: 'top'
            })
            this.password = ''
            this.oldPassword = ''
            this.passwordConfirmation = ''
            this.$refs.formChangePassword.resetForm()
          } else {
            this.onSubmit()
          }
        }
      }).catch(err => {
        this.$q.notify({
          message: err.message,
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      })
    },
    async onPasswordChange () {
      const { oldPassword, password, passwordConfirmation } = this

      this.$store.dispatch('user/changePassword', { oldPassword, password, passwordConfirmation })
        .then(async res => {
          /** call request OTP first **/
          this.otpType = 'change-password'
          await this.requestOtp()
          this.$q.notify({
            color: 'positive',
            message: 'Please enter the OTP code that we sent to you.',
            icon: 'error',
            position: 'top'
          })
          this.dialogOtp = true
          /** end call request OTP first **/
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to update password',
            icon: 'error',
            position: 'top'
          })
        })
    }
  }
}
</script>
