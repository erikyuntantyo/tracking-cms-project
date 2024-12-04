import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Job extends BaseModel {
  // constructor (data, options) {
  //   super(data, optsions)
  // }

  static modelName = 'Job'

  static instanceDefaults () {
    return {
      jobType: '',
      tripId: '',
      text: '',
      jobStatus: '',
      company: '',
      DriverLogin: '',
      truckNumber: '',
      sealNumber: '',
      containerNumber: '',
      batchNumber: '',
      typeSize: '',
      psaInstruction: '',
      pickupLocation: '',
      deliveryLocation: '',
      psaLocation: '',
      survey: '',
      weight: '',
      createdBy: '',
      updatedBy: ''
    }
  }
}

const servicePath = 'jobs'
const servicePlugin = makeServicePlugin({
  Model: Job,
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
