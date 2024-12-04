<template>
  <div>
    <form-get-data
      :vehicles.sync="formGet.vehicles"
      :selected-date.sync="formGet.selectedDate"
      :company.sync="formGet.company"
      @submit="submitGetData()"
      @clear="clearForm()"
    />
    <filter-input
      :message.sync="search.dataMsg"
      :user-send.sync="search.userSend"
      :user-rec.sync="search.userRec"
      @onSearch="reqSearch()"
      class="q-mb-sm"
    />
    <div class="col-12 row q-mb-sm">
      <div class="col-6">
        <q-btn
          outline
          color="black"
          label="Export"
          :disable="data.length === 0"
          v-if="data.length === 0"
        />
        <vue-excel-xlsx
          v-if="data.length > 0"
          class="q-btn"
          :data="originalData.data"
          :columns="columns"
          :file-name="exportName"
          :file-type="'xlsx'"
          :sheet-name="'sheetname'"
        >
          <q-btn
            outline
            color="black"
            label="Export"
          />
        </vue-excel-xlsx>
      </div>
      <div class="col-6 row justify-end items-center">
        {{ this.showPagination() }}
        <q-btn
          outline
          color="black q-mx-md"
          label="Prev Page"
          :disable="pagination.page === 1"
          @click="pagination.page--; onRequest({ pagination })"
        />
        <q-btn
          outline
          color="black"
          label="Next Page"
          :disable="(this.pagination.rowsPerPage * pagination.page) >= this.pagination.rowsNumber"
          @click="pagination.page++; onRequest({ pagination })"
        />
      </div>
    </div>
    <q-table
      :columns="columns"
      class="my-sticky-header-table table-height"
      :class="(data.length > 0) ? 'data-box' : ''"
      :data="data"
      :loading="loading"
      @request="onRequest"
      :filter="filter"
      :hide-no-data="false"
      :hide-pagination="true"
      :pagination.sync="pagination"
      :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import { format } from 'quasar'
import FilterInput from './FilterInput'
import FormGetData from './FormGetData'
import _ from 'lodash'
import VueExcelXlsx from 'vue-excel-xlsx'
import Vue from 'vue'

Vue.use(VueExcelXlsx)

export default {
  name: 'PageList',

  mixins: [mixin],

  components: {
    FilterInput,
    FormGetData
  },

  data () {
    return {
      formGet: {
        vehicles: null,
        selectedDate: null,
        company: null
      },
      filter: {
        messagDateTime: {
          $gte: '',
          $lt: ''
        },
        company: ''
      },
      search: {
        dataMsg: '',
        userSend: '',
        userRec: ''
      },
      columns: [
        { name: 'messagDateTime', field: 'messagDateTime', label: 'Date/Time', align: 'center', sortable: true, headerClasses: 'text-bold' },
        { name: 'userSend', field: 'userSend', label: 'Sender', align: 'center', sortable: true, headerClasses: 'text-bold' },
        { name: 'userRec', field: 'userRec', label: 'Receiver', align: 'center', sortable: true, headerClasses: 'text-bold' },
        { name: 'dataMsg', field: 'dataMsg', label: 'Message', align: 'left', sortable: true, headerClasses: 'text-bold' }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'messagDateTime',
        descending: false,
        rowsPerPage: 100,
        rowsNumber: 0
      },
      loading: false,
      lastSortBy: '',
      user: {},
      fromClearFunction: false,
      originalData: [],
      userCompany: {},
      exportName: '',
      retrieve: false
    }
  },
  watch: {
    'data' () {
      if (this.retrieve) this.exportData()
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
    this.setUserInfo()
    // this.onRequest({ pagination: this.pagination })
  },

  methods: {
    showPagination () {
      const first = (this.pagination.rowsNumber) ? (this.pagination.page - 1) * this.pagination.rowsPerPage + 1 : 0
      let seccond = (this.pagination.rowsNumber >= this.pagination.rowsPerPage) ? this.pagination.page * this.pagination.rowsPerPage : this.pagination.rowsNumber
      if (seccond >= this.pagination.rowsNumber) {
        seccond = this.pagination.rowsNumber
      }
      return `Showing records ${first + '-' + seccond} of ${this.pagination.rowsNumber}`
    },
    ...mapActions('message-histories', {
      findMessageHistory: 'find'
    }),
    async onRequest ({ pagination }) {
      if (this.fromClearFunction) return []

      this.loading = true
      const filterParams = await this.getFilterValue()
      let { sortBy } = pagination
      if (sortBy !== null) {
        this.lastSortBy = sortBy
      } else {
        sortBy = this.lastSortBy
      }
      const { descending } = pagination

      this.findMessageHistory({
        query: {
          $limit: this.pagination.rowsPerPage,
          $skip: (this.pagination.page - 1) * this.pagination.rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          $select: ['messagDateTime', 'userSend', 'userRec', 'dataMsg'],
          ...this.filter,
          ...filterParams
        }
      })
        .then(async res => {
          this.loading = false
          this.fromClearFunction = false
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

          this.fromClearFunction = false
          this.loading = false
        })
    },

    exportData () {
      this.findMessageHistory({
        query: {
          $select: ['messagDateTime', 'userSend', 'userRec', 'dataMsg'],
          $sort: {
            messagDateTime: 1
          },
          ...this.filter,
          $limit: 999999
        }
      })
        .then(res => {
          this.retrieve = false
          this.originalData = _.clone(res)
          if (res.total > res.limit) {
            this.$q.notify({
              color: 'positive',
              message: 'The Export Records Are More Than Setting Limit. Please Change The Date Range To Continue!',
              icon: 'done',
              position: 'top'
            })
          }
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

    async setUserInfo () {
      this.user = await this.$store.getters['auth/user']
      if (this.user.company) {
        const { data } = await this.$axios.get(`/groups/${this.user.company}`)
        this.userCompany = data
      }
    },

    submitGetData () {
      if (this.checkDateRange()) {
        this.$q.notify({
          color: 'negative',
          message: 'Date range cannot exceed 60 days.',
          icon: 'warning',
          position: 'top'
        })
      } else {
        this.fromClearFunction = false
        this.retrieve = true

        this.filter.messagDateTime = {
          $gte: (this.formGet.selectedDate && this.formGet.selectedDate.from) ? this.formGet.selectedDate.from : this.formGet.selectedDate,
          $lt: (this.formGet.selectedDate && this.formGet.selectedDate.to) ? this.formGet.selectedDate.to : this.formGet.selectedDate
        }

        if (this.formGet.company) {
          this.filter.company = this.formGet.company.value
          this.exportName = `message-histories-${this.formGet.company.label}-${this.$moment(new Date()).format('YYYYMMDD')}`
        }
        if (this.formGet.vehicles && this.formGet.vehicles.value !== 'all') {
          this.filter.vehicle = this.formGet.vehicles.value
        } else delete this.filter.vehicle
        if (this.userCompany && this.userCompany._id) this.filter.company = this.userCompany._id
      }
    },

    clearForm () {
      this.data = []
      this.fromClearFunction = true
      this.pagination.page = 1
      this.pagination.rowsNumber = 0
      if (!this.formGet.selectedDate) this.filter.messagDateTime = null
      if (!this.formGet.vehicles) delete this.filter.vehicle
      if (!this.formGet.company) this.filter.company = ''
    },

    async getFilterValue () {
      const string = ['dataMsg', 'userSend', 'userRec']
      const filter = {}

      await string.map(v => {
        if (this.search[v]) filter[v] = { $regex: `${this.search[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }
      })

      return filter
    },

    reqSearch () {
      if (this.search.dataMsg !== '' || !this.search.userSend !== '' || !this.search.userRec !== '') this.pagination.page = 1
      this.onRequest({ pagination: this.pagination })
    },

    checkDateRange () {
      const { from, to } = this.formGet.selectedDate

      const fromDateObj = new Date(from)
      const toDateObj = new Date(to)

      const fromDatePlus60Days = new Date(fromDateObj)
      fromDatePlus60Days.setDate(fromDatePlus60Days.getDate() + 59)

      if (toDateObj > fromDatePlus60Days) return true

      return false
    }
  }
}
</script>
<style>
.my-sticky-header-table {
  position: sticky;
  z-index: 1;
  top: 0;
  height: auto;
  background-color: #fff;
}

.data-box {
  height: calc(116vh - 400px);
}

.q-table tbody td {
  height: 30px;
}

.text-bold {
  font-weight: 550 !important;
  font-size: 14px !important;
}
</style>
