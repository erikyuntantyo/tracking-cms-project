import masterServices from '../../services/master'
import { Notify } from 'quasar'

export async function getCompaniesData ({ commit }, payload) {
  payload.isCompany = true
  const result = await masterServices.getGroupData(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving companies data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}
