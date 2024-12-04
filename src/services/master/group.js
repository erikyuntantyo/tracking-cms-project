import feathersClient from '../../boot/feathersClient'

export async function getGroupData (payload) {
  let skip
  let param = {
    parent: { $exists: false },
    $populate: ['parent']
  }
  if (payload) {
    if (payload.rowsPerPage) {
      skip = payload.rowsPerPage * (payload.page - 1)
      param.$limit = payload.rowsPerPage
      param.$skip = skip
    }
    if (payload.sortBy) {
      if (payload.sortBy !== 'desc') {
        let sortType = 1
        if (payload.descending === true) {
          sortType = -1
        }
        param.$sort = {
          [payload.sortBy]: sortType
        }
      }
    }
    if (payload.filter) {
      param.$search = payload.filter
    }
    if (payload.isCompany) {
      param.parent = { $exists: true }
    }
    if (payload.group) {
      param.parent = payload.group
    }
    if (payload.limit) {
      param.$limit = payload.limit
    }
  } else {
    param = {
      $limit: 50,
      $skip: 0,
      $populate: ['parent']
    }
  }
  return feathersClient.service('groups').find({ query: param })
}
