<template>
  <div>
    <filter-input
      :vehicle-no.sync="filter.vehicleNo"
      :company.sync="filter.company"
      :driver.sync="filter.driver"
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
      <template #body-cell-action="{ row: { _id } }">
        <td class="text-center">
          <q-btn
            flat
            round
            icon="edit"
            @click="$router.push(`/vehicles/edit/${_id}`)"
            v-if="$can('update', 'Vehicle Management')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="delete"
            class="q-ml-sm"
            @click="onDelete(_id)"
            v-if="$can('delete', 'Vehicle Management')"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </td>
      </template>

      <template #top>
        <q-btn
          padding="sm lg"
          class="q-mr-md"
          unelevated
          color="red-10"
          text-color="red-1"
          label="Add"
          @click="$router.push('/vehicles/add')"
          v-if="$can('create', 'Vehicle Management')"
        />
        <q-btn
          outline
          color="black"
          label="Export"
          padding="sm lg"
          disable
          v-if="data.length === 0 && (forCdas || roleAdmin)"
        />
        <vue-excel-xlsx
          v-if="data.length > 0 && (forCdas || roleAdmin)"
          class="q-btn"
          :data="dataExport"
          :columns="columnsExport"
          :file-name="exportName"
          :file-type="'xlsx'"
          :sheet-name="'sheetname'"
        >
          <q-btn
            outline
            color="black"
            padding="sm lg"
            label="Export"
          />
        </vue-excel-xlsx>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import FilterInput from './FilterInput'
import VueExcelXlsx from 'vue-excel-xlsx'
import Vue from 'vue'

Vue.use(VueExcelXlsx)

export default {
  name: 'VehiclesList',
  components: {
    FilterInput
  },

  mixins: [mixin],

  data () {
    return {
      filter: {
        vehicleNo: '',
        company: null,
        status: { label: 'Active', value: true },
        driver: null
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'vehicleNo', field: 'vehicleNo', label: 'Vehicle No.', align: 'left', sortable: true },
        { name: 'company.name', field: row => row.company && row.company.name ? row.company.name : '', label: 'Company', align: 'left', sortable: true },
        { name: 'status', field: row => row.status ? 'Active' : 'Inactive', label: 'Status', align: 'left', sortable: true },
        { name: 'driver.fullname', field: row => row.driver && row.driver.fullname ? row.driver.fullname : '', label: 'Driver', align: 'left', sortable: true },
        { name: 'remarks', field: row => row.remarks ? row.remarks : '-', label: 'Remarks', align: 'left' }
      ],
      columnsExport: [
        { field: 'vehicleNo', label: 'Vehicle No.' },
        { field: 'company.name', label: 'Company' },
        { field: 'status', label: 'Status', dataFormat: this.statusFormat },
        { field: 'driver.fullname', label: 'Driver' },
        { field: 'remarks', label: 'Remarks', dataFormat: this.remarksData }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'vehicleNo',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false,
      dataExport: [],
      exportName: '',
      forCdas: false,
      roleAdmin: false
    }
  },
  async mounted () {
    await this.setUserInfo()
    await this.onRequest({
      pagination: this.pagination
    })
    this.exportName = `vehicles-management-${(this.filter.company) ? this.filter.company.label + '-' : ''}${this.$moment().format('YYYYMMDD')}`
  },
  methods: {
    ...mapActions('vehicles', {
      findVehicles: 'find',
      removeVehicle: 'remove'
    }),
    ...mapActions('roles-acl', {
      getRole: 'get'
    }),
    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()
      const organizationQuery = await this.filterByOrganizationQuery()
      if (filterParams.status === 'all') delete filterParams.status

      this.findVehicles({
        query: {
          $limit: rowsPerPage * page,
          $skip: ((page > 0 ? page : 1) - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          ...organizationQuery,
          ...filterParams,
          $populate: ['company', 'driver'],
          aggregate: true,
          allData: this.forCdas || this.roleAdmin
        }
      })
        .then(res => {
          this.loading = false

          const existsData = (res.data.length > 0)

          this.data = existsData ? res.data : []
          this.dataExport = res.allData
          this.pagination = pagination
          this.pagination.rowsNumber = existsData ? res.total : 0

          if (this.forCdas || this.roleAdmin) {
            if (organizationQuery.company) {
              this.exportName = `vehicles-management-${this.dataExport[0].company.name}${this.$moment().format('YYYYMMDD')}`
            } else {
              this.exportName = `vehicles-management-${(this.filter.company) ? this.filter.company.label + '-' : ''}${this.$moment().format('YYYYMMDD')}`
            }
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
    async getFilterValue () {
      const string = ['vehicleNo']
      const options = ['company', 'driver', 'status']
      const filter = {}

      await string.map(v => {
        if (this.filter[v]) filter[v] = { $regex: `${this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }
      })

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
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
        this.removeVehicle(id)
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
    async setUserInfo () {
      const user = await this.$store.getters['auth/user']
      const roleAcl = await this.getRole(user.roleAcl._id || user.roleAcl)
      const roleName = roleAcl.name.toLowerCase()

      this.forCdas = roleAcl.forCdas
      this.roleAdmin = roleName.includes('admin')
    },
    statusFormat (value) {
      return value ? 'Active' : 'Inactive'
    },
    remarksData (value) {
      return !value ? '-' : value
    }
  }
}
</script>
