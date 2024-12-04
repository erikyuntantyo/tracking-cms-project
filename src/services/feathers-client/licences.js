import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class LicenseType extends BaseModel {
  static modelName = 'LicenseType'

  static instanceDefaults () {
    return {
      name: '',
      status: null
    }
  }
}

const servicePath = 'licences'
const servicePlugin = makeServicePlugin({
  Model: LicenseType,
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
