import feathersClient from '../../boot/feathersClient'

export async function getLicenseTypeData (payload) {
  let skip
  let param
  if (payload) {
    skip = payload.rowsPerPage * (payload.page - 1)
    param = {
      $limit: payload.rowsPerPage,
      $skip: skip
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
      $skip: 0
    }
  }
  return feathersClient.service('licences').find({ query: param })
}

export async function getActiveLicenseType () {
  const param = {
    status: true
  }
  return feathersClient.service('licences').find({ paginate: false, query: param })
}

export async function storeLicenseType (formData) {
  return feathersClient.service('licences').create(formData)
}

export async function deleteLicenseType (id) {
  return feathersClient.service('licences').remove(id)
}

export async function getDetailLicenseType (id) {
  return feathersClient.service('licences').get(id)
}

export async function updateLicenseType (id, formData) {
  return feathersClient.service('licences').patch(id, formData)
}
