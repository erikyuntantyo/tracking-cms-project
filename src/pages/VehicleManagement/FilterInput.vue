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
              label="Vehicle No."
              :value="vehicleNo"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="onInput"
            />

            <q-select
              outlined
              dense
              label="Company"
              use-input
              :value="company"
              :options="options.companies"
              @filter="onFilterCompanies"
              @blur="resetVehicle"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
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
              label="Status"
              :value="status"
              :options="options.statusses"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
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

            <q-select
              outlined
              dense
              label="Driver"
              use-input
              :value="driver"
              :options="options.drivers"
              @filter="onFilterDrivers"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @virtual-scroll="onScroll"
              @blur="onOut()"
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
    vehicleNo: {
      type: String,
      default: ''
    },
    company: {
      type: Object,
      default: null
    },
    status: {
      type: Object,
      default: null
    },
    driver: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        companies: [],
        statusses: [
          { label: 'All', value: 'all' },
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ],
        drivers: []
      },
      driversClone: [],
      skip: 0,
      search: '',
      total: true
    }
  },
  methods: {
    onScroll ({ index }) {
      if (index === this.options.drivers.length - 1 && this.total) {
        this.onRequest()
      }
    },
    resetVehicle () {
      this.total = true
      this.skip = 0
      this.options.drivers = []
      this.driversClone = []
    },
    onOut () {
      this.options.drivers = this.driversClone
    },
    emit (v) {
      this.$emit('update:driver', v)
      this.onOut()
    },
    onInput (v) {
      this.$emit('update:vehicleNo', v.toUpperCase().replace(/\s/g, ''))
    },
    async onFilterCompanies (val, update) {
      const companyQuery = await this.filterCompany()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        ...companyQuery,
        $select: ['_id', 'name']
      }

      await this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.companies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    async onRequest () {
      try {
        if (this.search) return
        else this.skip = this.skip + 50
        const roleAcl = await this.getDriverRole()

        if (roleAcl) {
          const organizationQuery = await this.filterByOrganizationQuery()

          const query = {
            $or: [
              { fullname: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
              { username: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }
            ],
            roleAcl,
            ...organizationQuery,
            $limit: 50,
            $skip: this.skip,
            $select: ['fullname', 'username', '_id']
          }
          if (this.company) query.company = this.company.value

          const { data, total } = await this.$store.dispatch('users/find', { paginate: false, query })

          data.map(({ _id, username, fullname }) => {
            this.options.drivers.push({ label: fullname || username, value: _id })
          })

          if (this.options.drivers.length > data.length) {
            this.driversClone = this.options.drivers
          }

          if (total === this.options.drivers.length) this.total = false
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
    async onFilterDrivers (val, update) {
      try {
        if (val && val.length < 3) return
        if (this.search && !val) this.onOut()
        this.search = val
        const roleAcl = await this.getDriverRole()

        if (roleAcl) {
          const organizationQuery = await this.filterByOrganizationQuery()

          const query = {
            $or: [
              { fullname: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
              { username: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }
            ],
            roleAcl,
            ...organizationQuery,
            $limit: 50,
            $select: ['fullname', 'username', '_id']
          }
          if (this.company) query.company = this.company.value

          const { data, total } = await this.$store.dispatch('users/find', { paginate: false, query })
          update(() => {
            if (this.options.drivers.length && !val) {
              this.options.drivers.map(({ _id, username, fullname }) => {
                return { label: fullname || username, value: _id }
              })
            } else if (val) {
              this.options.drivers = data.map(({ _id, username, fullname }) => {
                return { label: fullname || username, value: _id }
              })
            } else {
              this.options.drivers = data.map(({ _id, username, fullname }) => {
                return { label: fullname || username, value: _id }
              })
            }
            if (!val && total === data.length) this.total = false
          })
        } else {
          update(this.options.drivers = [])
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
    getDriverRole () {
      const query = { name: { $regex: 'driver', $options: 'i' } }

      return this.$store.dispatch('roles-acl/find', { query })
        .then(res => res.data.length ? res.data[0]._id : null)
        .catch(err => console.error('Failed to get driver role: ', err.message || err))
    }
  }
}
</script>
