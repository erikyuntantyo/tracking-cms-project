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
            <q-select
              outlined
              dense
              clearable
              use-input
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              label="Group"
              :value="group"
              :options="options.groups"
              @filter="onFilterGroups"
              @blur="resetVehicle"
              @input="$emit('update:group', $event)"
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
              clearable
              use-input
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              label="Company"
              :value="company"
              :options="options.companies"
              @filter="onFilterCompanies"
              @blur="resetVehicle()"
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
              clearable
              use-input
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              label="Vehicle Number"
              :value="vehicles"
              :options="options.vehicles"
              @filter="onFilterVehicles"
              @virtual-scroll="onScroll"
              @blur="onOut"
              @input="emit($event)"
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
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              label="Status"
              :value="status"
              :options="options.statusses"
              @input="$emit('update:status', $event)"
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
    group: {
      type: Object,
      default: null
    },
    company: {
      type: Object,
      default: null
    },
    vehicles: {
      type: Object,
      default: null
    },
    status: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        statusses: [
          { label: 'Pass', value: true },
          { label: 'Failed', value: false }
        ],
        groups: [],
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
    onOut () {
      this.options.vehicles = this.vehiclesClone
    },
    emit (v) {
      this.$emit('update:vehicles', v)
      this.onOut()
    },
    resetVehicle () {
      this.total = true
      this.skip = 0
      this.options.vehicles = []
      this.vehiclesClone = []
    },
    async onFilterGroups (val, update) {
      if (this.company) {
        this.$emit('update:company', null)
      }
      const groupQuery = await this.filterGroup()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 1,
        ...groupQuery,
        $select: ['_id', 'name']
      }

      await this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.groups = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },

    async onFilterCompanies (val, update) {
      let companyQuery = await this.filterCompany()

      if (companyQuery.parent) companyQuery = {}

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        parent: this.group ? this.group.value : {},
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
      else this.skip = this.skip + 50
      let companyQuery = await this.filterCompany()

      if (companyQuery._id) companyQuery = { company: companyQuery._id }
      const query = {
        vehicleNo: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        group: this.group ? this.group.value : {},
        company: this.company ? this.company.value : {},
        ...companyQuery,
        $select: ['_id', 'vehicleNo'],
        $limit: 50,
        $skip: this.skip
      }

      this.$store.dispatch('vehicles/find', { paginate: false, query })
        .then(({ data, total }) => {
          data.map(({ _id, vehicleNo }) => {
            this.options.vehicles.push({ label: vehicleNo, value: _id })
          })

          if (this.options.vehicles.length > data.length) {
            this.vehiclesClone = this.options.vehicles
          }

          if (total === this.options.vehicles.length) this.total = false
        })
    },

    async onFilterVehicles (val, update) {
      if (val && val.length < 3) return
      if (this.search && !val) this.onOut()
      this.search = val
      let companyQuery = await this.filterCompany()

      if (companyQuery._id) companyQuery = { company: companyQuery._id }
      const query = {
        vehicleNo: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        group: this.group ? this.group.value : {},
        company: this.company ? this.company.value : {},
        ...companyQuery,
        $select: ['_id', 'vehicleNo'],
        $limit: 50
      }

      this.$store.dispatch('vehicles/find', { paginate: false, query })
        .then(({ data, total }) => {
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
        })
    }
  }
}
</script>
