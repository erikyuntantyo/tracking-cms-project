import profileServices from '../../services/account'
import { Notify, LocalStorage } from 'quasar'

export async function getProfile ({ commit }, payload) {
  const result = await profileServices.getProfile().catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving data.',
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      }
    }
  })
  return result
}

export async function registerUser (context, payload) {
  const result = await profileServices
    .signup(
      payload.form.username,
      payload.form.email,
      payload.form.password,
      payload.form.mobile
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.data.code
        if (errorCode === 409) {
          Notify.create({
            message: 'This account already exists. Try resetting your password or contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        } else {
          Notify.create({
            message: 'There was an error creating your account. If this issue persists, contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        }
      }
    })
  if (result && result.status >= 201) {
    Notify.create({
      message: 'Account successfully created. Please check your email to verify your account.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    this.$router.push('/login')
  }
}

export async function forgotPassword (context, payload) {
  const result = await profileServices
    .forgotpassword(
      payload
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.status
        if (errorCode === 500) {
          Notify.create({
            message: err.response.data.message,
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        } else {
          Notify.create({
            message: 'There was an error forgot your password. If this issue persists, contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        }
      }
    })
  if (result && result.status >= 200) {
    LocalStorage.set('emailUser', payload.email)
    Notify.create({
      message: 'Please check your email/SMS/notification, we sent OTP code for reset password.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    this.$router.push('/reset-password')
  }
}

export async function resetPassword (context, payload) {
  const result = await profileServices
    .resetpassword(
      payload.form.otp,
      payload.form.password,
      payload.form.confirmPassword
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.status
        if (errorCode === 500) {
          Notify.create({
            message: err.response.data.message,
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        } else {
          Notify.create({
            message: 'There was an error reset your password. If this issue persists, contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        }
      }
    })
  if (result && result.status >= 200) {
    Notify.create({
      message: 'Reset password successfully.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    this.$router.push('/login')
  }
}

export async function resetUserPassword (context, payload) {
  const result = await profileServices
    .resetuserpassword(
      payload.form.user,
      payload.form.selectedUser.label,
      payload.form.password,
      payload.form.confirmPassword
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.status
        if (errorCode === 500) {
          Notify.create({
            message: err.response.data.message,
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
          return false
        } else {
          Notify.create({
            message: 'There was an error reset your password. If this issue persists, contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
          return false
        }
      }
    })
  if (result && result.status >= 200) {
    Notify.create({
      message: result.data.message,
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    return true
  }
}

export async function resendCode (context, payload) {
  const result = await profileServices
    .forgotpassword(
      payload
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.status
        if (errorCode === 500) {
          Notify.create({
            message: err.response.data.message,
            color: 'negative'
          })
        } else {
          Notify.create({
            message: 'There was an error reset your password. If this issue persists, contact support.',
            color: 'negative',
            icon: 'error',
            position: 'top'
          })
        }
      }
    })
  if (result && result.status >= 200) {
    Notify.create({
      message: 'OTP Code sent successfully.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
  }
}

export async function changePassword (ctx, { oldPassword, password, passwordConfirmation }) {
  return profileServices.changePassword({ oldPassword, password, passwordConfirmation })
}

export async function requestOtp (ctx, payload) {
  return profileServices.requestOtp(payload)
}

export async function sendOtp (ctx, payload) {
  return profileServices.sendOtp(payload)
}

export async function clearDevice (context, payload) {
  const result = await profileServices.clearDevice(payload)
    .catch(err => {
      Notify.create({
        message: err.response.data.message,
        color: 'negative',
        icon: 'error',
        position: 'top'
      })
    })

  if (result) {
    return result
  }
}
