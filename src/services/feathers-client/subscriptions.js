import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Subscription extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'Subscription'

  static instanceDefaults () {
    return {
      company: '',
      license: '',
      licenseNo: '',
      endDate: '',
      createdBy: '',
      updatedBy: ''
    }
  }

  static setupInstance (data, { store, models }) {
    return data
  }
}

const servicePath = 'subscriptions'
const servicePlugin = makeServicePlugin({
  Model: Subscription,
  service: feathersClient.service(servicePath),
  servicePath,
  whitelist: []
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
