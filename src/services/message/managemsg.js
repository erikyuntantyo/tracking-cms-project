import { LocalStorage } from 'quasar'
import feathersClient from '../../boot/feathersClient'
// import user from 'src/store/user'

export async function getListMessages (payload) {
  const param = {
    conversationId: '5f9bb49e1afb3c00dbe554ec',
    $populate: ['sender'],
    $sort: {
      createdAt: -1
    },
    $limit: payload.paramMessage.limit,
    $skip: payload.paramMessage.skip
  }
  return feathersClient.service('messages').find({ query: param })
}

export async function getListMessagesGroup (payload) {
  const convIdData = await this.getDetailConversation('vehicle', payload.paramMessageGroup.vehicleId)
  if (convIdData.total > 0) {
    const param = {
      conversationId: convIdData.data[0]._id,
      $populate: ['sender'],
      $sort: {
        createdAt: -1
      },
      $limit: payload.paramMessageGroup.limit,
      $skip: payload.paramMessageGroup.skip
    }
    return feathersClient.service('messages').find({ query: param })
  } else {
    return {}
  }
}

export async function sendMessage (type, conversationId, vehicleId, message) {
  const sender = LocalStorage.getItem('userID')
  const companyId = LocalStorage.getItem('userCompany')
  // let formData
  var formData = {
    type: type,
    vehicle: vehicleId,
    company: companyId,
    messages: {
      type: 'text',
      sender: sender,
      content: message
    }
    // conversationId: conversationId
  }
  if (conversationId) {
    formData.conversationId = conversationId
  }
  // const data = await this.getDetailConversation('id', '5f9bb49e1afb3c00dbe554ec')
  // const members = data.members
  // if (type === 'private') {
  //   formData = {
  //     type: 'private',
  //     company: companyId._id,
  //     members: members,
  //     messages: {
  //       type: 'text',
  //       sender: sender,
  //       content: message
  //     },
  //     conversationId: '5f9bb49e1afb3c00dbe554ec'
  //   }
  // }
  return feathersClient.service('messages').create(formData)
}

export async function getDetailConversation (type, id = '') {
  var data
  if (type === 'id') {
    data = feathersClient.service('conversations').get(id)
  } else if (type === 'vehicle') {
    var vehicleId
    if (id) {
      vehicleId = id
    } else {
      vehicleId = LocalStorage.getItem('userVehicle')
    }
    data = feathersClient.service('conversations').find({ query: { vehicle: vehicleId } })
  }
  return data
}

export async function broadcast (formData) {
  return feathersClient.service('send-message/vehicles').create(formData)
}
