import licenseTypeService from '../../services/licensing'
import { Notify } from 'quasar'

export async function getLicenseTypeData ({ commit }, payload) {
  const result = await licenseTypeService.getLicenseTypeData(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving license type data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function getActiveLicenseType () {
  const result = await licenseTypeService.getActiveLicenseType().catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving active license type data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function storeLicenseType (context, payload) {
  const result = await licenseTypeService
    .storeLicenseType(
      payload.form
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.data.code
        if (errorCode === 409) {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        } else {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        }
      }
    })
  if (result) {
    Notify.create({
      message: 'License Type successfully created.',
      color: 'positive'
    })
    this.$router.push('/licensetypes')
  }
}

export async function deleteLicenseType (context, payload) {
  const result = await licenseTypeService
    .deleteLicenseType(payload.id)
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.data.code
        if (errorCode === 409) {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        } else {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        }
      }
    })
  if (result) {
    Notify.create({
      message: 'License Type successfully deleted.',
      color: 'positive'
    })
  }
}

export async function getDetailLicenseType ({ commit }, payload) {
  const result = await licenseTypeService.getDetailLicenseType(payload.id).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving license type data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function updateLicenseType (context, payload) {
  const result = await licenseTypeService
    .updateLicenseType(
      payload.id,
      payload.form
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.data.code
        if (errorCode === 409) {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        } else {
          Notify.create({
            message: 'There was an error creating license type. If this issue persists, contact support.',
            color: 'negative'
          })
        }
      }
    })
  if (result) {
    Notify.create({
      message: 'License Type successfully updated.',
      color: 'positive'
    })
    this.$router.push('/licensetypes')
  }
}
