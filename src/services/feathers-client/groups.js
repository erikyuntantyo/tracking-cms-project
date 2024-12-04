import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Group extends BaseModel {
  static modelName = 'Group'

  static instanceDefaults () {
    return {
      name: '',
      code: '',
      contactPerson: '',
      groupInfo: {
        registrationDate: '',
        address: '',
        postalCode: '',
        phone: '',
        email: ''
      },
      status: '',
      parent: '',
      logo: '',
      timezone: '',
      level: null
    }
  }
}

const servicePath = 'groups'
const servicePlugin = makeServicePlugin({
  Model: Group,
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
