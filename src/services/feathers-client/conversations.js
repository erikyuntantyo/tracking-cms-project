import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Conversation extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'Conversation'

  static instanceDefaults () {
    return {
      type: '',
      members: [],
      vehicle: '',
      company: '',
      createdBy: ''
    }
  }
}

const servicePath = 'conversations'
const servicePlugin = makeServicePlugin({
  Model: Conversation,
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
