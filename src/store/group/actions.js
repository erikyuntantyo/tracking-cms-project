import masterServices from '../../services/master'
import { Notify } from 'quasar'

export async function getGroupData ({ commit }, payload) {
  const result = await masterServices.getGroupData(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving group data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}
