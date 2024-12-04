// import { Notify } from 'quasar'
import feathersClient from '../../boot/feathersClient'
import { defaultAxios } from '../../boot/axios'
import { LocalStorage } from 'quasar'

export async function getProfile () {
  return feathersClient.service('profile').find()
}

export async function signup (username, email, password, mobile) {
  return defaultAxios.post('/users', {
    username: username,
    email: email,
    password: password,
    mobile: mobile
  })
}

export async function forgotpassword (payload) {
  return defaultAxios.post('/users/forgot-password', {
    email: payload.email,
    device: payload.device
  })
}

export async function resetpassword (otp, password, confirmPassword) {
  return defaultAxios.post('/users/reset-password', {
    otp: otp,
    password: password,
    confirm_password: confirmPassword,
    user: {
      email: LocalStorage.getItem('emailUser')
    },
    device: 'portal'
  })
}

export async function resetuserpassword (user, selectedUser, password, confirmPassword) {
  return defaultAxios.post('/users/reset-user-password', {
    userpatch: user,
    password: password,
    confirm_password: confirmPassword,
    user: {
      email: selectedUser
    },
    device: 'portal'
  })
}

export async function changePassword ({ oldPassword, password, passwordConfirmation }) {
  return feathersClient.service('users/change-password').create({
    old_password: oldPassword,
    new_password: password,
    confirm_password: passwordConfirmation
  })
}

export async function requestOtp (formData) {
  return feathersClient.service('authentication/otp-request').create(formData)
}

export async function sendOtp (formData) {
  return feathersClient.service('authentication/otp-confirmation').create(formData)
}

export async function clearDevice (payload) {
  const formData = {
    device: null,
    deviceHistory: payload.device
  }
  const clearDevice = await feathersClient.service('users').patch(payload.userId, formData)
  return clearDevice
}
