<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          label="Vehicle No *"
          color="red-9"
          ref="vehicleNo"
          v-model.trim="vehicleNo"
          lazy-rules
          @input="v => this.vehicleNo = v.toUpperCase().replace(/\s/g, '')"
          autofocus
          :rules="[
            val => val && val.length > 0 || 'Please type something'
          ]"
        />

        <q-select
          v-model="company"
          label="Company *"
          :options="options.companies"
          @filter="onFilterCompanies"
          clearable
          color="red-9"
          use-input
          lazy-rules
          :rules="[ val => !!val || 'Please type something' ]"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-model="status"
          label="Status"
          :options="options.statusses"
          color="red-9"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-model="driver"
          label="Driver"
          clearable
          use-input
          :options="options.drivers"
          @filter="onFilterDrivers"
          color="red-9"
          :rules="[]"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-input
          label="Remarks"
          color="red-9"
          v-model="remarks"
          maxlength="100"
          autogrow
          hint="Maximum 100 characters"
        />

        <div class="text-right q-mt-lg">
          <q-btn
            label="Back"
            padding="sm lg"
            @click.prevent="$router.go(-1)"
            color="red-9"
            flat
          />

          <q-btn
            label="Submit"
            type="submit"
            class="q-ml-sm"
            padding="sm lg"
            unelevated
            color="red-10"
            text-color="red-1"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import mixin from '../../mixins/filter'

export default {
  name: 'VehicleManagementEdit',

  mixins: [mixin],

  data () {
    return {
      vehicleNo: '',
      company: null,
      status: { label: 'Active', value: true },
      driver: null,
      options: {
        companies: [],
        statusses: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ],
        drivers: []
      },
      remarks: ''
    }
  },
  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },
  watch: {
    company (prev, val) {
      this.$refs.vehicleNo.validate()

      if (!val || ((val && val.value) !== (prev && prev.value))) {
        this.driver = null
      }
    }
  },
  created () {
    if (!this.isNew) this.getSelectedVehicle()
  },
  methods: {
    ...mapGetters({
      getAuthUser: 'auth/user'
    }),
    ...mapActions('roles-acl', {
      getRole: 'get'
    }),
    ...mapActions('vehicles', {
      getVehicle: 'get',
      createVehicle: 'create',
      patchVehicle: 'patch'
    }),
    ...mapActions('groups', {
      getGroup: 'get'
    }),
    isUniqueVehicleNo (v) {
      if (this.company) {
        const query = {
          vehicleNo: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
          company: this.company.value,
          status: true
        }

        if (!this.isNew) query._id = { $ne: this.$route.params.id }

        return this.$store.dispatch('vehicles/find', { query })
          .then(res => {
            return !res.total || 'The vehicle number already registered'
          })
          .catch(err => {
            console.error('Failed to fetch vehicles: ', err.message)

            return 'Failed to fetch vehicles'
          })
      }

      return true
    },
    isFormatVehicleNo (v) {
      const vehicleNumber = v.toUpperCase()
      const vehicleNumberLength = vehicleNumber.length
      if (vehicleNumberLength > 7) {
        return 'Vehicle Number too long'
      } else if (vehicleNumberLength < 4) {
        return 'Vehicle Number minimum 4 character'
      } else if (!isNaN(vehicleNumber.substring(0, 1)) || !isNaN(vehicleNumber.substring(1, 2)) || !isNaN(vehicleNumber.substr(vehicleNumber.length - 1))) {
        return 'Format is cc<number>c, where (c) is an alphabet character and <number> is a number up to 4 digits max.'
      } else if (isNaN(vehicleNumber.substring(2, vehicleNumberLength - 1)) === true) {
        return 'Format is cc<number>c, where (c) is an alphabet character and <number> is a number up to 4 digits max.'
      } else {
        return true
      }
    },
    isUniqueVehicleNumber (v) {
      if (this.company) {
        const query = {
          vehicleNo: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
          company: this.company.value
        }

        if (!this.isNew) query._id = { $ne: this.$route.params.id }

        return this.$store.dispatch('vehicles/find', { query })
          .then(res => {
            return !res.total || 'Vehicle number already exists in this company'
          })
          .catch(err => {
            console.error('Failed to fetch vehicles: ', err.message)

            return 'Failed to fetch vehicles'
          })
      }

      return true
    },
    // isUniqueDriver (v) {
    //   if (v) {
    //     const query = { driver: v.value }

    //     if (!this.isNew) query._id = { $ne: this.$route.params.id }

    //     return this.$store.dispatch('vehicles/find', { query })
    //       .then(res => !res.total || 'The driver is already registered in another vehicle')
    //       .catch('Failed to fetch vehicles')
    //   }

    //   return v
    // },

    async getSelectedVehicle () {
      try {
        const { vehicleNo, company, status, driver, remarks } = await this.getVehicle(this.$route.params.id)

        this.vehicleNo = vehicleNo
        this.status = { label: status ? 'Active' : 'Inactive', value: status }
        this.remarks = !remarks ? '' : remarks

        await this.$store.dispatch('groups/get', [company, { query: { level: 2 } }])
          .then(({ _id, name }) => {
            this.company = { label: name, value: _id }
          }).catch(null)

        const driverValue = await this.$store.dispatch('users/get', [driver, { query: { $populate: 'company' } }])
          .catch(null)

        if (driverValue) this.driver = { label: (driverValue.fullname || driverValue.username), value: driverValue._id }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch data',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterCompanies (val, update) {
      const companyQuery = await this.filterCompany()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        ...companyQuery,
        $select: ['_id', 'name']
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.companies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    async onFilterDrivers (val, update) {
      try {
        const userRoles = process.env.USER_ROLES[process.env.NODE_ENV]
        const roleAcl = userRoles.transporterDriver

        if (roleAcl && this.company) {
          const query = {
            $or: [
              { fullname: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
              { username: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }
            ],
            roleAcl,
            company: this.company.value,
            $select: ['_id', 'username', 'fullname']
          }

          const { data } = await this.$store.dispatch('users/find', { query })

          update(() => {
            this.options.drivers = data.map(({ _id, username, fullname }) => {
              return { label: fullname || username, value: _id }
            })
          })
        } else {
          update(() => {
            this.options.drivers = []
          })
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch drivers',
          icon: 'error',
          position: 'top'
        })
      }
    },

    async onSubmit () {
      const { vehicleNo, company, status, driver, remarks } = this
      const user = this.getAuthUser()
      const companyData = await this.getGroup(company.value).catch(null)
      const data = {
        vehicleNo,
        status: status.value,
        group: companyData ? companyData.parent : null,
        company: companyData ? companyData._id ? companyData._id : companyData : null,
        remarks: remarks
      }

      data.driver = (driver && driver.value) || driver

      const unique = await this.isUniqueVehicleNumber(vehicleNo).then(res => { return res })

      if (unique === true) {
        if (this.isNew) {
          data.createdBy = user._id

          this.createVehicle(data)
            .then(res => {
              this.$q.notify({
                color: 'positive',
                message: 'Data created successfully',
                icon: 'done',
                position: 'top'
              })

              this.$router.push('/vehicles')
            })
            .catch(err => {
              this.$q.notify({
                color: 'negative',
                message: err.message || 'Failed to create data',
                icon: 'error',
                position: 'top'
              })
            })
        } else {
          data.updatedBy = user._id

          this.patchVehicle([this.$route.params.id, data])
            .then(res => {
              this.$q.notify({
                color: 'positive',
                message: 'Data updated successfully',
                icon: 'done',
                position: 'top'
              })

              this.$router.push('/vehicles')
            })
            .catch(err => {
              this.$q.notify({
                color: 'negative',
                message: err.message || 'Failed to create data',
                icon: 'error',
                position: 'top'
              })
            })
        }
      } else {
        this.$q.notify({
          color: 'negative',
          message: unique || 'Failed to create data',
          icon: 'error',
          position: 'top'
        })
      }
    }
  }
}
</script>
