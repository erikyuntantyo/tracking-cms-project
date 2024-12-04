import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class SystemSetting extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'SystemSetting'

  static instanceDefaults () {
    return {
      jobReminder: null,
      jobCancel: null,
      trackingDistance: ''
    }
  }
}

const servicePath = 'system-settings'
const servicePlugin = makeServicePlugin({
  Model: SystemSetting,
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
