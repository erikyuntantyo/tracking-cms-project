<template>
  <div>
    <filter-input
      :group.sync="filter['group._id']"
      :company.sync="filter['company._id']"
      :vehicles.sync="filter._id"
      :status.sync="filter.status"
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
      <template
        v-if="$can('create', 'Ping')"
        #body-cell-action="{ row: { vehicleNo } }"
      >
        <td class="text-center">
          <q-btn
            label="Ping"
            unelevated
            color="red-9"
            @click="onPing(vehicleNo)"
          />
        </td>
      </template>

      <template #body-cell-failedReasons="{ row: { failedReasons } }">
        <td v-if="failedReasons.length > 0">
          <span v-html="formatReasonText(failedReasons)" />
        </td>
        <td v-else />
      </template>

      <template #body-cell-status="{ row: { status } }">
        <td>
          <q-badge
            v-if="typeof status === 'string'"
            outline
            color="orange-10"
            :label="status"
          />
          <q-badge
            v-else
            outline
            :color="status ? 'positive' : 'negative'"
            :label="status ? 'Pass' : 'Failed'"
            class="text-capitalize"
          />
        </td>
      </template>

      <template #top>
        <q-btn
          padding="sm md"
          outline
          label="Refresh"
          @click="onRequest({ pagination })"
        />
      </template>
    </q-table>
  </div>
</template>

<script>
import FilterInput from './FilterInput'
import mixin from '../../mixins/filter'
import _ from 'lodash'

export default {
  name: 'PingList',

  components: {
    FilterInput
  },

  mixins: [mixin],

  data () {
    return {
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center'
        },
        {
          name: 'companyName',
          label: 'Company',
          field: row => row.company.name,
          align: 'left',
          sortable: true
        },
        {
          name: 'vehicleNo',
          label: 'Vehicle',
          field: 'vehicleNo',
          align: 'left',
          sortable: true
        },
        {
          name: 'failedReasons',
          label: 'Failed Reasons',
          field: row => this.formatReasonText(row.failedReasons),
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          align: 'left',
          sortable: true
        }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'createdAt',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      filter: {
        'group._id': null,
        'company._id': null,
        _id: null,
        status: null
      },
      companies: {},
      lastPaginate: {
        page: null,
        sortBy: null,
        descending: null,
        rowsPerPage: null,
        rowsNumber: null
      },
      switch: ''
    }
  },

  sockets: {
    'test-connection/pong pong' (data) {
      const vehicleIdx = this.data.findIndex(v => {
        return v.vehicleNo === data.vehicle
      })

      if (vehicleIdx > -1) {
        this.data[vehicleIdx].status = data.status
        this.data[vehicleIdx].failedReasons = this.formatReasonText(data.failedReasons)
      }
    },
    'test-connection/ping ping timeout' (data) {
      const vehicleIdx = this.data.findIndex(v => {
        return v.vehicleNo === data.vehicle
      })

      if (vehicleIdx > -1) {
        this.data[vehicleIdx].status = data.status
        this.data[vehicleIdx].failedReasons = this.formatReasonText(data.failedReasons)
      }
    }
  },

  async mounted () {
    const user = await this.$store.getters['auth/user']
    const role = await this.$store.dispatch('roles-acl/get', user.roleAcl._id || user.roleAcl).then(res => res.modules.filter(v => v.name === 'Ping'))

    if (!role[0].allowCreate) {
      this.columns.shift()
    }

    this.onRequest({
      pagination: this.pagination
    })
  },

  methods: {
    async onRequest ({ pagination }) {
      const companyQuery = await this.filterCompany()
      const filterQuery = await this.filterValue()
      let match = {}

      if (Object.keys(companyQuery).length > 0) {
        filterQuery['company._id'] = companyQuery._id
      }

      if (Object.keys(filterQuery).length > 0) {
        match = (filters => {
          const rest = {}

          Object.keys(filters).forEach(key => {
            if (key.includes('group')) {
              rest[key.replace('._id', '')] = filters[key]

              filters[key.replace('._id', '')] = filters[key]
              delete filters[key]
            } else {
              if (key.includes('._id')) {
                rest[key.replace('._id', '')] = filters[key]
              } else {
                rest[key] = filters[key]
              }
            }
          })

          return rest
        })(filterQuery)
      }

      this.loading = true

      const { sortBy, descending, rowsPerPage } = pagination
      let { page } = pagination

      this.switch = (page >= this.lastPaginate.page) ? 'next' : 'previous'

      if ((this.switch === 'previous') && (sortBy !== this.lastPaginate.sortBy)) {
        page = this.lastPaginate.page
      }

      if ((this.lastPaginate.page >= page) && (this.lastPaginate.descending !== descending)) {
        page = this.lastPaginate.page
      }

      const param = {
        resource: 'vehicles',
        aggregate: [
          {
            $facet: {
              total: [
                {
                  $addFields: {
                    statusPing: '$vehicleNo'
                  }
                },
                {
                  $lookup: {
                    from: 'groups',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'company'
                  }
                },
                {
                  $unwind: {
                    path: '$company',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'connectionhistories',
                    localField: 'statusPing',
                    foreignField: 'vehicle',
                    as: 'statusPing'
                  }
                },
                {
                  $unwind: {
                    path: '$statusPing',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    _id: 1,
                    vehicleNo: 1,
                    group: 1,
                    company: 1,
                    driver: 1,
                    createdAt: 1,
                    statusPing: 1,
                    status: { $ifNull: ['$statusPing.status', true] },
                    failedReasons: { $ifNull: ['$statusPing.failedReasons', []] },
                    companyName: { $toUpper: '$company.name' }
                  }
                },
                {
                  $match: {
                    ...filterQuery
                  }
                },
                {
                  $count: 'count'
                }
              ],
              data: [
                {
                  $addFields: {
                    statusPing: '$vehicleNo'
                  }
                },
                {
                  $lookup: {
                    from: 'groups',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'company'
                  }
                },
                {
                  $unwind: {
                    path: '$company',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'connectionhistories',
                    localField: 'statusPing',
                    foreignField: 'vehicle',
                    as: 'statusPing'
                  }
                },
                {
                  $unwind: {
                    path: '$statusPing',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    _id: 1,
                    vehicleNo: 1,
                    group: 1,
                    company: 1,
                    driver: 1,
                    createdAt: 1,
                    statusPing: 1,
                    status: { $ifNull: ['$statusPing.status', true] },
                    failedReasons: { $ifNull: ['$statusPing.failedReasons', []] },
                    companyName: { $toUpper: '$company.name' }
                  }
                },
                {
                  $match: {
                    ...filterQuery
                  }
                },
                {
                  $sort: {
                    [sortBy]: descending ? -1 : 1
                  }
                },
                {
                  $limit: rowsPerPage * page
                },
                {
                  $skip: ((page > 0 ? page : 1) - 1) * rowsPerPage
                }
              ]
            }
          },
          {
            $unwind: '$total'
          }, {
            $project: {
              data: 1,
              total: '$total.count'
            }
          }
        ],
        toObjectIdMap: []
      }

      if (match.group) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[6].$match["group"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[6].$match["group"]' })
      }

      if (match.company) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[6].$match["company._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[6].$match["company._id"]' })
      }

      if (match._id) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[6].$match._id' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[6].$match._id' })
      }

      const { data } = await this.$axios.post('/aggregate', param)

      this.data = (data && (data.length > 0)) ? data[0].data : []
      this.pagination = pagination
      this.pagination.page = page
      this.pagination.rowsNumber = (data && (data.length > 0)) ? data[0].total : 0
      this.lastPaginate = pagination
      this.loading = false
    },

    formatReasonText (failedReasons) {
      if (!failedReasons) return ''

      if (Array.isArray(failedReasons)) {
        return failedReasons.map(val => {
          return `<b class="text-uppercase">${val.channel}</b>: ${val.message}`
        }).join('<br>')
      } else if (failedReasons) {
        return failedReasons
      }
    },

    async onPing (vehicleNo) {
      try {
        const pingIdx = this.data.findIndex(v => {
          return v.vehicleNo === vehicleNo
        })

        this.data[pingIdx].status = 'Waiting for response....'

        const vehicle = await _.find(this.data, { vehicleNo: vehicleNo })

        await this.$feathersClient.service('test-connection/ping').create({
          vehicle: vehicle.vehicleNo,
          driver: vehicle.driver,
          company: vehicle.company
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message,
          icon: 'error',
          position: 'top'
        })
      }
    },

    async filterValue () {
      const filter = {}
      const options = ['group._id', 'company._id', '_id', 'status']

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      return filter
    }
  }
}
</script>
