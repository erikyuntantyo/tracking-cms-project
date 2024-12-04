import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Role extends BaseModel {
  static modelName = 'Role'

  static instanceDefaults () {
    return {
      name: '',
      modules: [],
      createdAt: '',
      updatedAt: ''
    }
  }
}

const servicePath = 'roles'
const servicePlugin = makeServicePlugin({
  Model: Role,
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
