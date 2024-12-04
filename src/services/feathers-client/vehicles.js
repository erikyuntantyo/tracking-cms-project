import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Vehicle extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'Vehicle'

  static instanceDefaults () {
    return {
      vehicleNo: '',
      group: '',
      company: '',
      driver: '',
      status: '',
      portNet: false,
      createdBy: '',
      updatedBy: ''
    }
  }

  static setupInstance (data, { store, models }) {
    return data
  }
}

const servicePath = 'vehicles'
const servicePlugin = makeServicePlugin({
  Model: Vehicle,
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
