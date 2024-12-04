import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class VehicleGroup extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'VehicleGroup'

  static instanceDefaults () {
    return {
      vehicleGroupName: '',
      company: '',
      vehicles: '',
      createdBy: '',
      createdAt: '',
      updatedBy: '',
      updatedAt: ''
    }
  }
}

const servicePath = 'vehicle-groups'
const servicePlugin = makeServicePlugin({
  Model: VehicleGroup,
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
