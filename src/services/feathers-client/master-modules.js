import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class MasterModule extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'MasterModule'

  static instanceDefaults () {
    return {
      name
    }
  }
}

const servicePath = 'master-modules'
const servicePlugin = makeServicePlugin({
  Model: MasterModule,
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
