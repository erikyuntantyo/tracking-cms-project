<template>
  <q-list
    bordered
    class="rounded-borders"
  >
    <q-expansion-item
      icon="filter_list"
      label="Advanced Filter"
    >
      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <q-input
              outlined
              dense
              label="Group Name"
              :value="vehicleGroupName"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:vehicleGroupName', $event)"
            />

            <q-select
              outlined
              dense
              label="Company"
              use-input
              :value="company"
              :options="options.companies"
              @filter="onFilterCompanies"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @blur="resetVehicle"
              @input="$emit('update:company', $event)"
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
              outlined
              dense
              label="Vehicles"
              multiple
              use-input
              use-chips
              :value="vehicles"
              :options="options.vehicles"
              @filter="onFilterVehicles"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:vehicles', $event)"
              @virtual-scroll="onScroll"
              @blur="onOut"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
import mixin from '../../mixins/filter'

export default {
  name: 'FilterInput',
  props: {
    vehicleGroupName: {
      type: String,
      default: ''
    },
    company: {
      type: Object,
      default: null
    },
    vehicles: {
      type: Array,
      default: () => []
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        companies: [],
        vehicles: []
      },
      vehiclesClone: [],
      skip: 0,
      search: '',
      total: true
    }
  },
  methods: {
    onScroll ({ index }) {
      if (index === this.options.vehicles.length - 1 && this.total) {
        this.onRequest()
      }
    },
    resetVehicle () {
      this.total = true
      this.skip = 0
      this.options.vehicles = []
      this.vehiclesClone = []
    },
    onOut () {
      this.options.vehicles = this.vehiclesClone
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
    async onRequest () {
      if (this.search) return
      this.skip = this.skip + 50
      const organizationQuery = await this.filterByOrganizationQuery()

      const query = {
        vehicleNo: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        ...organizationQuery,
        $select: ['_id', 'vehicleNo'],
        $limit: 50,
        $skip: this.skip,
        status: true
      }
      if (this.company) query.company = this.company.value
      const { data, total } = await this.$store.dispatch('vehicles/find', { paginate: false, query })

      data.map(({ _id, vehicleNo }) => {
        this.options.vehicles.push({ label: vehicleNo, value: _id })
      })

      if (this.options.vehicles.length > data.length) {
        this.vehiclesClone = this.options.vehicles
      }

      if (total === this.options.vehicles.length) this.total = false
    },
    async onFilterVehicles (val, update) {
      if (val && val.length < 3) return
      if (this.search && !val) this.onOut()
      this.search = val
      const organizationQuery = await this.filterByOrganizationQuery()

      const query = {
        vehicleNo: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        ...organizationQuery,
        $select: ['_id', 'vehicleNo'],
        $limit: 50,
        status: true
      }
      if (this.company) query.company = this.company.value
      const { data, total } = await this.$store.dispatch('vehicles/find', { paginate: false, query })

      update(() => {
        if (this.options.vehicles.length && !val) {
          this.options.vehicles.map(({ _id, vehicleNo }) => {
            return { label: vehicleNo, value: _id }
          })
        } else if (val) {
          this.options.vehicles = data.map(({ _id, vehicleNo }) => {
            return { label: vehicleNo, value: _id }
          })
        } else {
          this.options.vehicles = data.map(({ _id, vehicleNo }) => {
            return { label: vehicleNo, value: _id }
          })
        }
        if (!val && total === this.options.vehicles.length) this.total = false
      })
    }
  }
}
</script>
