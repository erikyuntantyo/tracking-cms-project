import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class User extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'User'

  static instanceDefaults () {
    return {
      email: '',
      password: ''
    }
  }

  static setupInstance (data, { store, models }) {
    return data
  }
}

const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
  paramsForServer: ['$populateParams'],
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
