import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Message extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'Message'

  static instanceDefaults () {
    return {
      type: '',
      conversationId: '',
      content: '',
      media: '',
      sender: '',
      recipientStatus: [
        {
          userId: '',
          status: '',
          updatedAt: ''
        }
      ]
    }
  }
}

const servicePath = 'messages'
const servicePlugin = makeServicePlugin({
  Model: Message,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin
