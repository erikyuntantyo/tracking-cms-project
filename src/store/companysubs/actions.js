import companySubsService from '../../services/licensing'
import { Notify } from 'quasar'

export async function getCompanySubsData ({ commit }, payload) {
  const result = await companySubsService.getCompanySubsData(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving company subscriptions data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function storeCompanySubs (context, payload) {
  const result = await companySubsService
    .storeCompanySubs(
      payload.form
    )
    .catch(err => {
      if (err) {
        Notify.create({
          message: err.message,
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      } else {
        Notify.create({
          message: 'There was an error creating company subsription. If this issue persists, contact support.',
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      }
    })
  if (result) {
    Notify.create({
      message: 'Company Subscription successfully created.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    this.$router.push('/company-subscription')
  }
}

export async function deleteCompanySubs (context, payload) {
  const result = await companySubsService
    .deleteCompanySubs(payload.id)
    .catch(err => {
      if (err) {
        Notify.create({
          message: err.message,
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      } else {
        Notify.create({
          message: 'There was an error deleting company subsription. If this issue persists, contact support.',
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      }
    })
  if (result) {
    Notify.create({
      message: 'Company Subscription successfully deleted.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
  }
}

export async function getDetailCompanySubs ({ commit }, payload) {
  const result = await companySubsService.getDetailCompanySubs(payload.id).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving license type data.',
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      }
    }
  })
  return result
}

export async function updateCompanySubs (context, payload) {
  const result = await companySubsService
    .updateCompanySubs(
      payload.id,
      payload.form
    )
    .catch(err => {
      if (err) {
        Notify.create({
          message: err.message,
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      } else {
        Notify.create({
          message: 'There was an error creating license type. If this issue persists, contact support.',
          color: 'negative',
          icon: 'error',
          position: 'top'
        })
      }
    })
  if (result) {
    Notify.create({
      message: 'License Type successfully updated.',
      color: 'positive',
      icon: 'done',
      position: 'top'
    })
    this.$router.push('/company-subscription')
  }
}

export async function getCompanyDetail (ctx, payload) {
  return companySubsService.getCompanyDetail(payload.id)
}
