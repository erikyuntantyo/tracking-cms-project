<template>
  <q-page class="q-pa-sm">
    <div>
      <filter-input
        :company.sync="filter['company._id']"
        :license.sync="filter['license._id']"
        :end-date.sync="filter.endDate"
        :created-at.sync="filter.createdAt"
        :updated-at.sync="filter.companySubEditAt"
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
              @click="$router.push(`/company-subscription/edit/${_id}`)"
              v-if="$can('update', 'Company Subscriptions')"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>

            <q-btn
              flat
              round
              icon="delete"
              class="q-ml-sm"
              @click="onDelete(_id)"
              v-if="$can('delete', 'Company Subscriptions')"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </td>
        </template>

        <template #top>
          <q-btn
            padding="sm lg"
            unelevated
            color="red-10"
            text-color="red-1"
            label="Add"
            @click="$router.push('/company-subscription/add')"
            v-if="$can('create', 'Company Subscriptions')"
          />
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import FilterInput from './FilterInput'

export default {
  name: 'CompanySubscriptionsList',
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
        'license._id': null,
        'company._id': null,
        endDate: null,
        createdAt: null,
        companySubEditAt: null
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
        { name: 'licenseNo', align: 'left', label: 'Vehicle Limit', field: 'licenseNo', sortable: true },
        { name: 'endDate', align: 'left', label: 'Licence End Date', field: row => this.changeFormatDate(row.endDate), sortable: true },
        { name: 'createdByName', align: 'left', label: 'Created By', field: row => (row.createdBy) ? row.createdBy.fullname : '-', sortable: true },
        { name: 'createdAt', align: 'left', label: 'Created Date', field: row => this.changeFormatDateTime(row.createdAt), sortable: true },
        { name: 'companySubUpdatedByName', align: 'left', label: 'Edited By', field: row => (row.companySubUpdatedBy) ? row.companySubUpdatedBy.fullname : this.getUsername(row.editedBy), sortable: true },
        { name: 'companySubEditAt', align: 'left', label: 'Edited Date', field: row => { return this.changeFormatDateTime(row.companySubEditAt) }, sortable: true }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'companyName',
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
      findSubscription: 'find',
      removeSubscription: 'remove'
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
      if (filterParams.companySubEditAt) match.companySubEditAt = filterParams.companySubEditAt

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
                  companySubEditAt: { $ifNull: ['$companySubUpdatedAt', '$updatedAt'] }
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
                    localField: 'companySubUpdatedBy',
                    foreignField: '_id',
                    as: 'companySubUpdatedBy'
                  }
                },
                {
                  $unwind: {
                    path: '$companySubUpdatedBy',
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
                    companySubUpdatedBy: 1,
                    companySubUpdatedAt: 1,
                    companySubEditAt: { $ifNull: ['$companySubUpdatedAt', '$updatedAt'] },
                    licenseName: { $toUpper: '$license.name' },
                    createdByName: { $toUpper: '$createdBy.fullname' },
                    companySubUpdatedByName: { $toUpper: '$companySubUpdatedBy.fullname' },
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
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[9].$match["license._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["license"]' })
      }
      if (filterParams['company._id']) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[9].$match["company._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["company"]' })
      }
      if (companyQuery['company._id']) {
        param.toObjectIdMap.push({ index: 0, path: '$facet.data[9].$match["company._id"]' })
        param.toObjectIdMap.push({ index: 0, path: '$facet.total[1].$match["company"]' })
      }
      if (filterParams.endDate) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[9].$match.endDate.$gte' },
          { index: 0, path: '$facet.data[9].$match.endDate.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.endDate.$gte' },
          { index: 0, path: '$facet.total[1].$match.endDate.$lte' }
        ])
      }
      if (filterParams.createdAt) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[9].$match.createdAt.$gte' },
          { index: 0, path: '$facet.data[9].$match.createdAt.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.createdAt.$gte' },
          { index: 0, path: '$facet.total[1].$match.createdAt.$lte' }
        ])
      }
      if (filterParams.companySubEditAt) {
        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.data[9].$match.companySubEditAt.$gte' },
          { index: 0, path: '$facet.data[9].$match.companySubEditAt.$lte' }
        ])

        param.toISODateMap = param.toISODateMap.concat([
          { index: 0, path: '$facet.total[1].$match.companySubEditAt.$gte' },
          { index: 0, path: '$facet.total[1].$match.companySubEditAt.$lte' }
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

    async getFilterValue () {
      const options = ['company._id', 'license._id']
      const date = ['endDate', 'createdAt', 'companySubEditAt']
      const filter = {}

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      await date.map(v => {
        if (this.filter[v]) filter[v] = { $gte: this.$moment(this.filter[v]).toDate(), $lte: this.$moment(this.filter[v]).add(1, 'days').toDate() }
      })

      return filter
    },
    onDelete (id) {
      this.$q.dialog({
        title: 'Delete Data',
        message: 'Are you sure want to delete this data?',
        cancel: { color: 'red-9', flat: true, padding: 'sm lg' },
        ok: { color: 'red-9', unelevated: true, padding: 'sm lg' }
      }).onOk(() => {
        this.removeSubscription(id)
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
    },
    changeFormatDateTime (datetime) {
      return this.$moment(datetime).format('YYYY-MM-DD HH:mm:ss')
    },
    changeFormatDate (datetime) {
      return this.$moment(datetime).format('YYYY-MM-DD')
    },
    getUsername (id) {
      if (id) {
        const user = this.$store.getters['users/get'](id)
        return (user && (user.fullname || user.username)) || '-'
      } else {
        return '-'
      }
    }
  }
}
</script>
