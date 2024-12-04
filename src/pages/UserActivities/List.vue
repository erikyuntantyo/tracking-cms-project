<template>
  <div>
    <filter-input
      :module.sync="filter.module"
      :created-at.sync="filter.createdAt"
      :record.sync="filter.data"
      :action.sync="filter.action"
      class="q-mb-sm"
    />

    <q-table
      :columns="columns"
      :data="data"
      row-key="_id"
      :loading="loading"
      @request="onRequest"
      :filter="filter"
      :pagination.sync="pagination"
      :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
      class="my-sticky-header-table table-height"
    >
      <template #body-cell-detail="props">
        <td class="text-center">
          <q-btn
            flat
            round
            icon="flip_to_front"
            @click="onView(props.row.data)"
          >
            <q-tooltip>View</q-tooltip>
          </q-btn>
        </td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 700px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            Log Data
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <div class="q-pa-md row q-col-gutter-md">
          <div
            v-for="(val, idx) in selectedData"
            :key="idx"
            :class="`${typeof val === 'object' && val !== null ? 'col-md-12' : 'col-md-6'}`"
          >
            <div
              v-if="typeof val === 'object' && val !== null"
              class="q-pa-md bg-grey-3"
              style="border-radius: 6px;"
            >
              <h2 class="text-weight-medium col-md-12 text-subtitle2 q-my-none">
                {{ idx | startCase }}
              </h2>

              <!-- Role modules section -->
              <div v-if="Array.isArray(val)">
                <div
                  v-for="(v, i) in val"
                  :key="i"
                  class="row q-col-gutter-md"
                >
                  <q-input
                    v-for="(value, index) in v"
                    :key="index"
                    :value="value"
                    :label="index | startCase"
                    readonly
                    color="red-9"
                    class="col-md-6"
                  />
                </div>
              </div>

              <div
                class="row q-col-gutter-md"
                v-else
              >
                <q-input
                  v-for="(v, i) in val"
                  :key="i"
                  :value="v"
                  :label="i | startCase"
                  readonly
                  color="red-9"
                  class="col-md-6"
                />
              </div>
            </div>

            <q-input
              :value="formatValue({[idx]: val})"
              :label="idx | startCase"
              readonly
              color="red-9"
              v-else
            />
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import formatMixin from '../../mixins/format'
import { date, format } from 'quasar'
import FilterInput from './FilterInput'

export default {
  name: 'PageList',

  mixins: [mixin, formatMixin],

  components: {
    FilterInput
  },

  data () {
    return {
      filter: {
        module: '',
        createdAt: null,
        data: '',
        action: ''
      },
      columns: [
        {
          name: 'detail',
          label: 'Detail',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'createdAt', field: this.createdAtField, label: 'Date', align: 'center', sortable: true },
        { name: 'user', field: this.userField, label: 'User', align: 'left' },
        { name: 'module', field: this.moduleField, label: 'Module Name', align: 'left', classes: 'text-capitalize' },
        { name: 'action', field: this.actionField, label: 'Action', align: 'left', classes: 'text-capitalize' },
        { name: 'record', field: this.recordField, label: 'Record', align: 'left' }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'createdAt',
        descending: true,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false,
      selectedData: null,
      gettersData: {
        user: []
      }
    }
  },

  filters: {
    startCase (v) {
      if (!v) return ''
      v = v.toString()
      return format.capitalize(v.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1'))
    }
  },

  async mounted () {
    this.onRequest({ pagination: this.pagination })
  },

  methods: {
    ...mapActions('activity-logs', {
      findActivities: 'find',
      removeActivity: 'remove'
    }),
    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()
      const organizationQuery = await this.filterByOrganizationQuery()

      this.findActivities({
        query: {
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          ...organizationQuery,
          ...filterParams
        }
      })
        .then(async res => {
          this.loading = false

          await this.setGettersData(res.data)
          await this.setGettersValue()

          this.data = res.data
          this.pagination = pagination
          this.pagination.rowsNumber = res.total
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to fetch data',
            icon: 'error',
            position: 'top'
          })
        })
    },
    onView (data) {
      this.selectedData = data
      this.dialog = true
    },

    formatValue (value) {
      const key = Object.keys(value)[0]
      let val = value[key]

      if (['email'].includes(key)) val = this.maskEmail(val)
      if (['mobile', 'phone'].includes(key)) val = this.maskPhone(val)

      return val
    },

    async setGettersValue () {
      if (this.gettersData.user.length) {
        await this.$store.dispatch('users/find', {
          query: { _id: { $in: this.gettersData.user }, $limit: 9999999 }
        })
      }
    },
    async setGettersData (data) {
      await Promise.all(Object.keys(this.gettersData).map(async key => {
        this.gettersData[key] = await [...new Set(data.map(v => v[key]))].filter(v => !!v)
      }))
    },

    createdAtField (v) {
      return date.formatDate(v.createdAt, 'DD/MM/YYYY HH:mm:ss')
    },
    userField (v) {
      const user = this.$store.getters['users/get'](v.user) || null

      return (user && (user.fullname || user.username || user.email)) || ''
    },
    moduleField (v) {
      let value = ''

      if (typeof v.module === 'undefined') {
        const action = v.action.split('-')
        value = action[action.length - 1]
      } else {
        value = v.module.split('-').join(' ')
      }

      return value
    },
    actionField (v) {
      let value = ''
      const { action } = v

      if (typeof v.module === 'undefined') {
        const array = action.split('-')

        value = array.length > 1 ? array.slice(0, -1).join(' ') : array.join(' ')
      } else {
        value = action.split('-').join(' ')
      }

      return value
    },
    recordField (v) {
      let record = ''
      const arrField = ['recipients', 'enabled', 'daysBeforeNotification']
      const emailNotif = []
      arrField.forEach(key => {
        if (v.data[key]) emailNotif.push(v.data[key])
      })
      if (v.data.notificationDateTime) emailNotif.push(date.formatDate(v.data.notificationDateTime, 'DD/MM/YYYY'))
      if (v.data) record = v.data.name || v.data.fullname || v.data.email || v.data.username || v.data.vehicleNo || v.data.vehicleGroupName || v.data.title || v.data.bookingN || v.data.record || v.data.tripId || v.data.trailerNumber || emailNotif.join(', ') || ''

      return record
    },

    async getFilterValue () {
      const recordField = ['data']
      const dashNotationFields = ['module', 'action']
      const options = []
      const dateFields = ['createdAt']
      const filter = {}

      await recordField.map(v => {
        if (this.filter[v]) {
          filter.$or = [
            { [`${v}.name`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.fullname`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.email`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.username`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.vehicleNo`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.vehicleGroupName`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } },
            { [`${v}.title`]: { $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }
          ]
        }
      })

      await dashNotationFields.map(v => {
        if (this.filter[v]) filter[v] = { $regex: `${this.filter[v].trim().split(' ').join('-').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }
      })

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      await dateFields.map(v => {
        if (this.filter[v]) {
          typeof this.filter[v] === 'string'
            ? filter[v] = { $gt: date.startOfDate(this.formatDate(this.filter[v]), 'day'), $lte: date.endOfDate(this.formatDate(this.filter[v]), 'day') }
            : filter[v] = { $gt: date.startOfDate(this.formatDate(this.filter[v].from), 'day'), $lte: date.endOfDate(this.formatDate(this.filter[v].to), 'day') }
        }
      })

      return filter
    },

    formatDate (data) {
      const dates = data.split('/')
      return date.buildDate({ date: parseInt(dates[0]), month: parseInt(dates[1]), year: parseInt(dates[2]) })
    },

    onDelete (id) {
      this.$q.dialog({
        title: 'Delete Data',
        message: 'Are you sure want to delete this data?',
        cancel: { color: 'red-9', flat: true, padding: 'sm lg' },
        ok: { color: 'red-9', unelevated: true, padding: 'sm lg' }
      }).onOk(() => {
        this.removeActivity(id)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data deleted successfully',
              icon: 'done',
              position: 'top'
            })

            this.onRequest({
              pagination: this.pagination
            })
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to delete data',
              icon: 'error',
              position: 'top'
            })
          })
      })
    }
  }
}
</script>
