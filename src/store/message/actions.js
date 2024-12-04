import messageServices from '../../services/message'
import { Notify } from 'quasar'

export async function getListMessages (context, payload) {
  const result = await messageServices.getListMessages(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function getListMessagesGroup (context, payload) {
  const result = await messageServices.getListMessagesGroup(payload).catch(err => {
    if (err.response) {
      const errorCode = err.response.data.code
      if (errorCode) {
        Notify.create({
          message: 'There was an error retrieving data.',
          color: 'negative'
        })
      }
    }
  })
  return result
}

export async function sendMessageGroup (context, payload) {
  const result = await messageServices
    .sendMessage(
      'group',
      payload.form.conversationId,
      payload.form.vehicleId,
      payload.form.messageGroup
    )
    .catch(err => {
      if (err.response) {
        const errorCode = err.response.data.code
        if (errorCode === 409) {
          Notify.create({
            message: 'There was an error send message. If this issue persists, contact support.',
            color: 'negative'
          })
        } else {
          Notify.create({
            message: 'There was an error send message. If this issue persists, contact support.',
            color: 'negative'
          })
        }
      }
    })
  if (result) {
    Notify.create({
      message: 'Message successfully send.',
      color: 'positive'
    })
    return result
  }
}

export async function broadcast (ctx, payload) {
  return messageServices.broadcast(payload)
}
