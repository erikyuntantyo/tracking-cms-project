import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class MessageHistories extends BaseModel {
  static modelName = 'message-histories'

  static instanceDefaults () {
    return {
      user: '',
      action: '',
      data: null
    }
  }

  static setupInstance (data, { store, models }) {
    return data
  }
}

const servicePath = 'message-histories'
const servicePlugin = makeServicePlugin({
  Model: MessageHistories,
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
