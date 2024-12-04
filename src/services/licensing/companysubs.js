import feathersClient from '../../boot/feathersClient'
import { LocalStorage } from 'quasar'

export async function getCompanySubsData (payload) {
  let skip
  let param
  if (payload) {
    skip = payload.rowsPerPage * (payload.page - 1)
    param = {
      $limit: payload.rowsPerPage,
      $skip: skip,
      $populate: ['company', 'license', 'createdBy', 'updatedBy']
    }
    if (payload.sortBy !== 'desc') {
      let sortType = 1
      if (payload.descending === true) {
        sortType = -1
      }
      param.$sort = {
        [payload.sortBy]: sortType
      }
    }
  } else {
    param = {
      $limit: 50,
      $skip: 0,
      $populate: ['company', 'license', 'createdBy', 'updatedBy']
    }
  }
  return feathersClient.service('subscriptions').find({ query: param })
}

export async function storeCompanySubs (formData) {
  const param = {
    company: formData.company,
    license: formData.license,
    licenseNo: formData.licenseNo,
    endDate: formData.endDate,
    createdBy: LocalStorage.getItem('userID')
  }
  return feathersClient.service('subscriptions').create(param)
}

export async function deleteCompanySubs (id) {
  return feathersClient.service('subscriptions').remove(id)
}

export async function getDetailCompanySubs (id) {
  return feathersClient.service('subscriptions').get(id)
}

export async function updateCompanySubs (id, formData) {
  return feathersClient.service('subscriptions').patch(id, formData)
}

export async function getCompanyDetail (id) {
  return feathersClient.service('groups').get(id)
}
