// import { Notify } from 'quasar'
import feathersClient from '../../boot/feathersClient'

export async function getSetting () {
  const param = {
    $limit: 1
  }
  return feathersClient.service('system-settings').find({ query: param })
}

export async function manage (formData) {
  return feathersClient.service('system-settings/manage').create(formData)
}
