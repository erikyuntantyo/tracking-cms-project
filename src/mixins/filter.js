export default {
  methods: {
    getUserOrganization () {
      const user = this.$store.getters['auth/user']
      let organization = null

      if (user.group) {
        organization = { group: user.group, company: null }

        if (user.company) organization.company = user.company
      }

      return organization
    },
    async getVehicleDriver () {
      let vehicle = null
      const user = await this.$store.getters['auth/user']
      const getVehicle = await this.$store.dispatch('vehicles/find', {
        query: { driver: user._id }
      })

      if (getVehicle.total > 0) vehicle = getVehicle.data[0].vehicleNo

      return vehicle
    },
    async filterByOrganizationQuery () {
      const query = {}
      const organization = await this.getUserOrganization()

      if (organization) {
        query.group = organization.group._id || organization.group

        organization.company
          ? query.company = organization.company._id || organization.company
          : query.$or = [{ company: null }, { company: { $exists: false } }]
      }

      return query
    },
    async filterForJob () {
      const query = {}
      const organization = await this.getUserOrganization()
      const user = await this.$store.getters['auth/user']
      const roleId = (user.roleAcl._id || user.roleAcl).toString()
      const userRoles = process.env.USER_ROLES[process.env.NODE_ENV]

      if (roleId !== userRoles.administrator) {
        if (organization) {
          if (organization.company) {
            query.company = organization.company

            if (roleId === userRoles.transporterDriver) {
              const vehicle = await this.getVehicleDriver()

              if (vehicle) {
                query.truckNumber = vehicle
              } else {
                query.truckNumber = { $exists: false }
              }
            }
          }
        }
      }

      return query
    },
    async filterGroup () {
      const query = {}
      const organization = await this.getUserOrganization()

      if (organization) query._id = organization.group

      return query
    },
    async filterCompany () {
      const query = {}
      const organization = await this.getUserOrganization()

      if (organization) {
        organization.company
          ? query._id = organization.company._id || organization.company
          : query.parent = organization.group._id || organization.group
      }

      return query
    }
  }
}
