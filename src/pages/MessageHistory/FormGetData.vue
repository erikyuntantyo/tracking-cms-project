<template>
  <q-list class="row">
    <div class="col-12 row">
      <q-form
        @submit="onSubmit"
        class="col-12 row"
      >
        <div class="col-12 row">
          <div class="col-7 row q-gutter-xs">
            <div
              class="col-3"
              style="padding-top: 10px;max-width: 20%;"
            >
              View Message:
            </div>
            <q-select
              v-if="forCdas"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              options-cover
              lazy-rules
              label="Company"
              ref="companyField"
              :value="company"
              :options="options.companies"
              @filter="onFilterCompanies"
              @input="companyInput($event)"
              color="red-9"
              class="col-6"
              :rules="[ val => !!val || 'Please select Company']"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
              <template
                v-if="company"
                #append
              >
                <q-icon
                  name="cancel"
                  @click.stop="clearForm('company')"
                  class="cursor-pointer"
                />
              </template>
            </q-select>

            <q-select
              outlined
              dense
              use-input
              fill-input
              hide-selected
              options-cover
              lazy-rules
              label="Vehicles"
              :value="vehicles"
              :options="options.vehicles"
              @filter="onFilterVehicles"
              color="red-9"
              class="col-3"
              @input="$emit('update:vehicles', $event)"
              :rules="[ val => !!val || 'Please select vehicle']"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
              <template
                v-if="vehicles"
                #append
              >
                <q-icon
                  name="cancel"
                  @click.stop="clearForm('vehicle')"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
          </div>
          <div class="col-5 row">
            <div
              class="col-3 row"
              style="padding-top: 10px;max-width: 24%;"
            >
              Date Range:
            </div>
            <div class="col-6">
              <q-input
                label="Date"
                outlined
                dense
                color="red-8"
                :value="dateRange"
                :rules="[ val => !!val || 'Please select date range']"
              >
                <template #append>
                  <q-icon
                    name="event"
                    class="cursor-pointer"
                  >
                    <q-popup-proxy
                      ref="qDateProxy"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        color="red-9"
                        v-model="dateRange"
                        @input="() => $refs.qDateProxy.hide()"
                        mask="YYYY-MM-DD"
                        range
                      />
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon
                    v-if="dateRange"
                    name="cancel"
                    @click.stop="clearForm('date')"
                    class="cursor-pointer"
                    color="grey-6"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-3 row justify-end">
              <div>
                <q-btn
                  outline
                  color="red-9"
                  label="Retrieve"
                  type="submit"
                  style="width: 90px;"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- <q-btn outline color="red-9" label="Retrieve" @click="onSubmit()" /> -->
      </q-form>
    </div>
  </q-list>
</template>

<script>
import mixin from '../../mixins/filter'

export default {
  name: 'FormGetData',
  props: {
    vehicles: {
      type: Object,
      default: null
    },
    selectedDate: {
      type: [String, Object],
      default: null
    },
    company: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  async mounted () {
    await this.setUserInfo()
  },

  computed: {
    dateRange: {
      get () {
        if (!this.selectedDate) return null
        const value = typeof this.selectedDate === 'object'
          ? this.selectedDate.from + ' - ' + this.selectedDate.to
          : this.selectedDate
        return value
      },
      set (v) {
        return this.$emit('update:selectedDate', v)
      }
    }
  },

  data () {
    return {
      options: {
        vehicles: [],
        companies: []
      },
      forCdas: false
    }
  },

  methods: {
    clearForm (form) {
      if (form === 'vehicle') this.$emit('update:vehicles', null)
      if (form === 'company') {
        this.$emit('update:company', null)
        this.$emit('update:vehicles', null)
      }
      if (form === 'date') this.dateRange = null

      this.$emit('clear')
    },
    onSubmit () {
      this.$emit('submit')
    },
    async onFilterVehicles (val, update) {
      let organizationQuery = await this.filterByOrganizationQuery()
      if (this.company) organizationQuery = { company: this.company.value }
      if (!Object.keys(organizationQuery).length) {
        update(() => {
          this.$refs.companyField.validate()
          this.options.vehicles = []
        })
      } else {
        const query = {
          vehicleNo: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          ...organizationQuery,
          $select: ['_id', 'vehicleNo']
        }
        const { data } = await this.$store.dispatch('vehicles/find', { paginate: false, query })

        update(() => {
          this.options.vehicles = data.map(({ _id, vehicleNo }) => {
            return { label: vehicleNo, value: _id }
          })
          if (!val) this.options.vehicles = [{ label: 'ALL', value: 'all' }].concat(this.options.vehicles)
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

    companyInput (event) {
      this.$emit('update:company', event)
      this.$emit('update:vehicles', { label: 'ALL', value: 'all' })
    },

    async setUserInfo () {
      this.forCdas = localStorage.getItem('forCdas')
    }
  }
}
</script>
