import feathersClient from '../../boot/feathersClient'

export async function getVehicleForSubscription (payload) {
  const param = {
    company: payload.company,
    $limit: -1
  }
  return feathersClient.service('vehicles').find({ query: param })
}
