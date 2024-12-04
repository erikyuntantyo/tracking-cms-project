<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-select
          v-model="company"
          label="Company *"
          :options="options.companies"
          @filter="onFilterCompany"
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

        <q-input
          label="Group Name *"
          color="red-9"
          ref="vehicleGroupName"
          v-model.trim="vehicleGroupName"
          lazy-rules
          :rules="[
            val => val && val.length > 0 || 'Please type something',
            isUniqueName
          ]"
        />

        <q-select
          v-model="vehicles"
          label="Vehicles *"
          clearable
          use-input
          use-chips
          multiple
          :options="options.vehicles"
          @filter="onFilterVehicles"
          color="red-9"
          :rules="[
            val => val && val.length > 0 || 'Please type something'
          ]"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

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
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import { filter } from 'lodash'

export default {
  name: 'VehicleGroupsEdit',

  mixins: [mixin],

  data () {
    return {
      vehicleGroupName: '',
      company: null,
      vehicles: [],
      options: {
        companies: [],
        vehicles: [],
        allvehicles: []
      },
      vehicleFilter: ''
    }
  },
  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },
  watch: {
    company (prev, val) {
      if (!val) this.vehicles = []
      if ((val && val.value) !== (prev && prev.value)) {
        this.vehicles = []
        this.getVehicle()
      }
    }
  },
  async created () {
    if (!this.isNew) await this.getSelectedData()
  },
  sockets: {
    async 'vehicles total-vehicles' (data) {
      if (data.method === 'create') {
        this.options.allvehicles.push({ label: data.data.vehicleNo, value: data.data._id })
      } else {
        const myIndex = this.options.allvehicles.map(v => v.label).indexOf(data.data.vehicleNo)
        if (myIndex !== -1) {
          this.options.allvehicles.splice(myIndex, 1)
        }
      }
      if (this.vehicleFilter) {
        const regex = new RegExp(`${this.vehicleFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
        this.options.vehicles = filter(this.options.allvehicles, obj => regex.test(obj.label))
      } else {
        this.options.vehicles = this.options.allvehicles
      }
    }
  },
  methods: {
    ...mapActions('vehicle-groups', {
      findGroups: 'find',
      getGroup: 'get',
      createGroup: 'create',
      patchGroup: 'patch'
    }),
    isUniqueName (v) {
      if (this.company) {
        const query = {
          vehicleGroupName: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company: this.company.value
        }

        if (!this.isNew) query._id = { $ne: this.$route.params.id }

        return this.findGroups({ query })
          .then(res => {
            return !res.total || 'The group name already registered'
          })
          .catch(err => {
            console.error('Failed to fetch vehicle groups: ', err.message)

            return 'Failed to fetch vehicle groups'
          })
      }

      return true
    },
    async getSelectedData () {
      try {
        const { vehicleGroupName, company, vehicles } = await this.getGroup(this.$route.params.id)

        this.vehicleGroupName = vehicleGroupName

        await this.$store.dispatch('groups/get', company)
          .then(({ _id, name, parent }) => {
            this.company = { label: name, parent, value: _id }
          })
          .catch(err => {
            console.error('Company not found: ', err.message)
          })

        if (vehicles.length) {
          await this.$store.dispatch('vehicles/find', {
            query: {
              _id: { $in: vehicles },
              status: true
            }
          })
            .then(({ data }) => {
              this.vehicles = data.map(({ _id, vehicleNo }) => {
                return { label: vehicleNo, value: _id }
              })
            })
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch data',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterCompany (val, update) {
      const companyQuery = await this.filterCompany()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        ...companyQuery,
        $select: ['_id', 'parent', 'name']
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.companies = data.map(({ _id, parent, name }) => {
              return { label: name, value: _id, parent }
            })
          })
        })
    },
    async onFilterVehicles (val, update) {
      try {
        this.vehicleFilter = val
        update(() => {
          const regex = new RegExp(`${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
          this.options.vehicles = filter(this.options.allvehicles, obj => regex.test(obj.label))
        })
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
      const { vehicleGroupName, company, vehicles } = this
      const user = await this.$store.getters['auth/user']

      const data = {
        vehicleGroupName,
        group: company.parent,
        company: company.value,
        vehicles: vehicles ? vehicles.map(v => v.value) : []
      }

      if (this.isNew) {
        data.createdBy = user._id

        this.createGroup(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/vehicle-groups')
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

        this.patchGroup([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/vehicle-groups')
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
    },
    async getVehicle () {
      const query = {
        $limit: 9999999,
        company: this.company ? this.company.value : { $exists: false },
        $select: ['_id', 'vehicleNo'],
        status: true
      }

      const { data } = await this.$store.dispatch('vehicles/find', { query })

      this.options.vehicles = this.options.allvehicles = data.map(({ _id, vehicleNo }) => {
        return { label: vehicleNo, value: _id }
      })
    }
  }
}
</script>
