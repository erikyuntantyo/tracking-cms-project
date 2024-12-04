import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class RolesAcl extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'RolesAcl'

  static instanceDefaults () {
    return {
      name: '',
      forCdas: null,
      modules: []
    }
  }
}

const servicePath = 'roles-acl'
const servicePlugin = makeServicePlugin({
  Model: RolesAcl,
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
