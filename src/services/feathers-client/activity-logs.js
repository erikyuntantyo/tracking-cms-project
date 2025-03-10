import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class ActivityLog extends BaseModel {
  static modelName = 'ActivityLog'

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

const servicePath = 'activity-logs'
const servicePlugin = makeServicePlugin({
  Model: ActivityLog,
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
