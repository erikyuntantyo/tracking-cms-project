<template>
  <q-page class="q-pa-sm">
    <div>
      <filter-input
        :company.sync="filter['company._id']"
        :license.sync="filter['license._id']"
        :created-at.sync="filter.createdAt"
        :updated-at.sync="filter.vehicleSubEditAt"
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
        <template #body-cell-action="{ row: { _id } }">
          <td class="text-center">
            <q-btn
              flat
              round
              icon="edit"
              @click="$router.push(`/vehicle-subscription/edit/${_id}`)"
              v-if="$can('update', 'Vehicle Subscriptions')"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </td>
        </template>

        <template #top />
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import FilterInput from './FilterInput'

export default {
  name: 'VehicleSubscriptionsList',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },

  components: {
    FilterInput
  },

  mixins: [mixin],

  data () {
    return {
      filter: {
        'company._id': null,
        'license._id': null,
        createdAt: null,
        vehicleSubEditAt: null
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'companyName', field: row => row.company.name, label: 'Company', align: 'left', sortable: true },
        { name: 'licenseName', align: 'left', label: 'Licence Type', field: row => row.license.name, sortable: true },
        { name: 'licenseassigned', align: 'left', label: 'Licences Assigned', field: this.licensesAssigned, sortable: true },
        { name: 'createdByName', align: 'left', label: 'Created By', field: row => (row.createdBy && row.createdBy.fullname) ? row.createdBy.fullname : '-', sortable: true },
        { name: 'createdAt', align: 'left', label: 'Created Date', field: row => this.changeFormatDateTime(row.createdAt), sortable: true },
        { name: 'vehSubUpdatedByName', align: 'left', label: 'Edited By', field: row => (row.vehSubUpdatedBy && row.vehSubUpdatedBy.fullname) ? row.vehSubUpdatedBy.fullname : '-', sortable: true },
        { name: 'vehicleSubEditAt', align: 'left', label: 'Edited Date', field: row => this.changeFormatDateTime(row.vehicleSubEditAt), sortable: true }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'company',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      lastPaginate: {
        page: null,
        sortBy: null,
        descending: null,
        rowsPerPage: null,
        rowsNumber: null
      },
      loading: false,
      dialog: false,
      gettersData: {
        company: [],
        license: []
      }
    }
  },
  async created () {
    await this.onRequest({
      pagination: this.pagination
    })
  },
  methods: {
    ...mapActions('subscriptions', {
      findSubscription: 'find'
    }),
    async onRequest ({ pagination }) {
      let companyQuery = await this.filterCompany()

      const filterParams = await this.getFilterValue()

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
      const match = {}
      if (companyQuery) {
        match.company = companyQuery._id
        companyQuery = { 'company._id': companyQuery._id }
      }
      if (filterParams['company._id']) match.company = filterParams['company._id']
      if (filterParams['license._id']) match.license = filterParams['license._id']
      if (filterParams.endDate) match.endDate = filterParams.endDate
      if (filterParams.createdAt) match.createdAt = filterParams.createdAt
      if (filterParams.vehicleSubEditAt) match.vehicleSubEditAt = filterParams.vehicleSubEditAt

      const param = {
        resource: 'subscriptions',
        aggregate: [
          {
            $facet: {
              total: [{
                $project: {
                  company: 1,
                  license: 1,
                  endDate: 1,
                  createdAt: 1,
                  vehicleSubEditAt: { $ifNull: ['$vehSubUpdatedAt', '$updatedAt'] }
                }
              }, {
                $match: match
              }, {
                $count: 'count'
              }],
              data: [
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
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                  }
                },
                {
                  $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'vehSubUpdatedBy',
                    foreignField: '_id',
                    as: 'vehSubUpdatedBy'
                  }
                },
                {
                  $unwind: {
                    path: '$vehSubUpdatedBy',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'licences',
                    localField: 'license',
                    foreignField: '_id',
                    as: 'license'
                  }
                },
                {
                  $unwind: {
                    path: '$license',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'vehicles',
                    let: {
                      companyId: '$company._id',
                      licenseId: '$license._id'
                    },
                    pipeline: [
                      {
                        $unwind: '$licenseList'
                      },
                      {
                        $unwind: '$company'
                      },
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $eq: ['$licenseList.idLicense', '$$licenseId'] },
                              { $eq: ['$licenseList.portNet', true] },
                              { $eq: ['$company', '$$companyId'] }
                            ]
                          }
                        }
                      }
                    ],
                    as: 'vehicle'
                  }
                },
                {
                  $unwind: {
                    path: '$vehicles',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    _id: 1,
                    portNet: 1,
                    license: 1,
                    company: 1,
                    licenseNo: 1,
                    endDate: 1,
                    createdAt: 1,
                    createdBy: 1,
                    updatedAt: 1,
                    licenseassigned: { $size: '$vehicle' },
                    vehSubUpdatedBy: 1,
                    vehSubUpdatedAt: 1,
                    vehicleSubEditAt: { $ifNull: ['$vehSubUpdatedAt', '$updatedAt'] },
                    licenseName: { $toUpper: '$license.name' },
                    createdByName: { $toUpper: '$createdBy.fullname' },
                    vehSubUpdatedByName: { $toUpper: '$vehSubUpdatedBy.fullname' },
                    companyName: { $toUpper: '$company.name' }
                  }
                },
                {
                  $match: {
                    ...companyQuery,
                    ...filterParams
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
        toObjectIdMap: [],
        toISODateMap: []
      }

      if (filterParams['license._id']) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[11].$match["license._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["license"]' })
      }
      if (filterParams['company._id']) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[11].$match["company._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["company"]' })
      }
      if (companyQuery['company._id']) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[11].$match["company._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["company"]' })
      }
      if (filterParams.endDate) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[11].$match.endDate.$gte' },
          { index: 0, path: '$facet.data[11].$match.endDate.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.endDate.$gte' },
          { index: 0, path: '$facet.total[1].$match.endDate.$lte' }
        ])
      }
      if (filterParams.createdAt) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[11].$match.createdAt.$gte' },
          { index: 0, path: '$facet.data[11].$match.createdAt.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.createdAt.$gte' },
          { index: 0, path: '$facet.total[1].$match.createdAt.$lte' }
        ])
      }
      if (filterParams.vehicleSubEditAt) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[11].$match.vehicleSubEditAt.$gte' },
          { index: 0, path: '$facet.data[11].$match.vehicleSubEditAt.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.vehicleSubEditAt.$gte' },
          { index: 0, path: '$facet.total[1].$match.vehicleSubEditAt.$lte' }
        ])
      }

      const { data } = await this.$axios.post('/aggregate', param)

      this.data = (data[0]) ? data[0].data : []
      this.pagination = pagination
      this.pagination.page = page
      this.pagination.rowsNumber = (data[0]) ? data[0].total : []
      this.lastPaginate = pagination
      this.loading = false
    },

    companyField (row) {
      const group = this.$store.getters['groups/get'](row.company)
      return (group && group.name) || ''
    },
    licenseField (row) {
      if (row.license) {
        const license = this.$store.getters['licences/get'](row.license)
        return (license && license.name) || ''
      }
      return ''
    },
    licensesAssigned (row) {
      return row.licenseassigned || '-'
    },
    async setGettersData (data) {
      await Promise.all(Object.keys(this.gettersData).map(async key => {
        this.gettersData[key] = await [...new Set(data.map(v => v[key]))].filter(v => !!v)
      }))
    },
    async setGettersValue () {
      if (this.gettersData.company.length) {
        await this.$store.dispatch('groups/find', {
          query: { _id: { $in: [...this.gettersData.company] }, $limit: 9999999 }
        })
      }
      if (this.gettersData.license.length) {
        await this.$store.dispatch('licences/find', {
          query: { _id: { $in: [...this.gettersData.license] }, $limit: 9999999 }
        })
      }
    },

    async getFilterValue () {
      const options = ['company._id', 'license._id']
      const date = ['createdAt', 'vehicleSubEditAt']
      const filter = {}

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      await date.map(v => {
        if (this.filter[v]) filter[v] = { $gte: this.$moment(this.filter[v]).toDate(), $lte: this.$moment(this.filter[v]).add(1, 'days').toDate() }
      })

      return filter
    },
    changeFormatDateTime (datetime) {
      return this.$moment(datetime).format('YYYY-MM-DD HH:mm:ss')
    },
    changeFormatDate (datetime) {
      return this.$moment(datetime).format('YYYY-MM-DD')
    }
  }
}
</script>
