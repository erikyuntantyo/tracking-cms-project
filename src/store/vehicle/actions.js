import masterServices from '../../services/master'
import { Notify } from 'quasar'

export async function getVehicleForSubscription ({ commit }, payload) {
  const result = await masterServices.getVehicleForSubscription(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving vehicle data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}
