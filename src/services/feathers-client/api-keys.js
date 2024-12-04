import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class apikeys extends BaseModel {
  static modelName = 'apikeys'

  static instanceDefaults () {
    return {
      company: '',
      status: '',
      accessToken: '',
      createdBy: '',
      createdAt: '',
      updatedAt: ''
    }
  }
}

const servicePath = 'api-keys'
const servicePlugin = makeServicePlugin({
  Model: apikeys,
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
