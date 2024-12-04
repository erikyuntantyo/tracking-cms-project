import vehicleSubsService from '../../services/licensing'
import { Notify } from 'quasar'

export async function updateVehicleSubs (context, payload) {
  const result = await vehicleSubsService
    .updateVehicleSubs(
      payload.form
    )
    .catch(err => {
      if (err) {
        if (err.success === false) {
          Notify.create({
            message: err.message,
            color: 'negative',
            icon: 'info',
            position: 'top'
          })
        }
      }
    })
  if (result) {
    Notify.create({
      message: 'Vehicle Subscription successfully updated.',
      color: 'positive',
      icon: 'info',
      position: 'top'
    })
    this.$router.push('/vehicle-subscription')
  }
}
