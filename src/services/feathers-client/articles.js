import feathersClient, { makeServicePlugin, BaseModel } from '../../boot/feathersClient'

class Article extends BaseModel {
  static modelName = 'Article'

  static instanceDefaults () {
    return {
      title: '',
      content: '',
      createdBy: '',
      updatedBy: ''
    }
  }

  static setupInstance (data, { store, models }) {
    return data
  }
}

const servicePath = 'articles'
const servicePlugin = makeServicePlugin({
  Model: Article,
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
