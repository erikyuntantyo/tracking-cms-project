import feathersClient from '../../boot/feathersClient'
import { Notify } from 'quasar'

export async function updateVehicleSubs (formData) {
  return feathersClient.service('vehicles/subscription').create(formData)
    .catch(err => {
      Notify.create({
        color: 'negative',
        message: err.message,
        icon: 'error',
        position: 'top'
      })
    })
}
