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
              label="Trip Id"
              :value="tripId"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:tripId', $event)"
            />

            <q-input
              outlined
              dense
              label="Booking Id"
              :value="bookingN"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:bookingN', $event)"
            />

            <q-input
              outlined
              dense
              label="Container Number"
              :value="containerNumber"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:containerNumber', $event)"
            />

            <q-input
              outlined
              dense
              label="UCR No"
              :value="ucrN"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:ucrN', $event)"
            />

            <q-input
              outlined
              dense
              label="Seal No"
              :value="sealNumber"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:sealNumber', $event)"
            />

            <q-input
              outlined
              dense
              label="Trailer No"
              :value="trailerNumber"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:trailerNumber', $event)"
            />

            <q-input
              outlined
              dense
              label="Type Size"
              :value="typeSize"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:typeSize', $event)"
            />

            <q-select
              v-if="!companyUser"
              outlined
              dense
              label="Company"
              :value="company"
              :options="options.companies"
              @filter="onFilterCompanies"
              use-input
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

            <q-input
              outlined
              dense
              label="Vehicle Number"
              :value="truckNumber"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:truckNumber', $event)"
            />

            <q-input
              outlined
              dense
              label="Job Type"
              :value="jobType"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:jobType', $event)"
            />

            <q-input
              outlined
              dense
              label="Depot"
              :value="depotName"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:depotName', $event)"
            />

            <q-select
              outlined
              dense
              label="Status"
              :value="jobStatus"
              :options="options.statusses"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:jobStatus', $event)"
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
              outlined
              dense
              label="Date Created"
              :value="createPick"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="dateCreatedProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      v-model="createPick"
                      @input="() => $refs.dateCreatedProxy.hide()"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="createPick"
                  name="cancel"
                  @click.stop="createPick = null"
                  class="cursor-pointer"
                  color="grey-6"
                />
              </template>
            </q-input>

            <q-input
              outlined
              dense
              label="Start Time"
              :value="startDatePick"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="startDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      v-model="startDatePick"
                      @input="() => $refs.startDateProxy.hide()"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="startDatePick"
                  name="cancel"
                  @click.stop="startDatePick = null"
                  class="cursor-pointer"
                  color="grey-6"
                />
              </template>
            </q-input>

            <q-input
              outlined
              dense
              label="End Time"
              :value="endDatePick"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="endDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      v-model="endDatePick"
                      @input="() => $refs.endDateProxy.hide()"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="endDatePick"
                  name="cancel"
                  @click.stop="endDatePick = null"
                  class="cursor-pointer"
                  color="grey-6"
                />
              </template>
            </q-input>
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
    tripId: {
      type: String,
      default: ''
    },
    bookingN: {
      type: String,
      default: ''
    },
    containerNumber: {
      type: String,
      default: ''
    },
    ucrN: {
      type: String,
      default: ''
    },
    sealNumber: {
      type: String,
      default: ''
    },
    trailerNumber: {
      type: String,
      default: ''
    },
    typeSize: {
      type: String,
      default: ''
    },
    truckNumber: {
      type: String,
      default: ''
    },
    jobType: {
      type: String,
      default: ''
    },
    depotName: {
      type: String,
      default: ''
    },
    jobStatus: {
      type: Object,
      default: null
    },
    company: {
      type: Object,
      default: null
    },
    createdAt: {
      type: [String, Object],
      default: null
    },
    jobStartDate: {
      type: [String, Object],
      default: null
    },
    jobEndDate: {
      type: [String, Object],
      default: null
    }
  },

  mixins: [mixin],
  computed: {
    createPick: {
      get () {
        if (!this.createdAt) return null

        const value = typeof this.createdAt === 'object'
          ? this.createdAt.from + '-' + this.createdAt.to
          : this.createdAt
        return value
      },
      set (v) {
        return this.$emit('update:createdAt', v)
      }
    },
    startDatePick: {
      get () {
        if (!this.jobStartDate) return null

        const value = typeof this.jobStartDate === 'object'
          ? this.jobStartDate.from + '-' + this.jobStartDate.to
          : this.jobStartDate
        return value
      },
      set (v) {
        return this.$emit('update:jobStartDate', v)
      }
    },
    endDatePick: {
      get () {
        if (!this.jobEndDate) return null

        const value = typeof this.jobEndDate === 'object'
          ? this.jobEndDate.from + '-' + this.jobEndDate.to
          : this.jobEndDate
        return value
      },
      set (v) {
        return this.$emit('update:jobEndDate', v)
      }
    }
  },
  data () {
    return {
      companyUser: this.$store.getters['auth/user'].company,
      options: {
        companies: [],
        statusses: [
          { label: 'New', value: 'new' },
          { label: 'In Progress', value: 'in progress' },
          { label: 'Start Pickup', value: 'start pickup' },
          { label: 'Completed Pickup', value: 'completed pickup' },
          { label: 'Start Delivery', value: 'start delivery' },
          { label: 'Completed Delivery', value: 'completed delivery' },
          { label: 'Completed', value: 'completed' },
          { label: 'Canceled', value: 'cancel' },
          { label: 'Withdrawn', value: 'withdrawn' },
          { label: 'Arrived', value: 'arrived' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Not Dispatched', value: 'not dispatched' }
        ]
      }
    }
  },
  methods: {
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
    }
  }
}
</script>
