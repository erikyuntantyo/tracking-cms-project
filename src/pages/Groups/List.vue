<template>
  <div>
    <filter-input
      :name.sync="filter.name"
      :address.sync="filter['groupInfo.address']"
      :postal-code.sync="filter['groupInfo.postalCode']"
      :phone.sync="filter['groupInfo.phone']"
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
            @click="$router.push(`/groups/edit/${_id}`)"
            v-if="$can('update', 'Groups')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="delete"
            class="q-ml-sm"
            @click="onDelete(_id)"
            v-if="$can('delete', 'Groups')"
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
          @click="$router.push('/groups/add')"
          v-if="$can('create', 'Groups')"
        />
      </template>
    </q-table>
  </div>
</template>

<script>
import FilterInput from './FilterInput'
import mixin from '../../mixins/filter'
import { mapActions } from 'vuex'

export default {
  name: 'GroupsList',

  components: {
    FilterInput
  },

  mixins: [mixin],

  data () {
    return {
      filter: {
        name: '',
        'groupInfo.address': '',
        'groupInfo.phone': '',
        'groupInfo.postalCode': '',
        status: { label: 'Active', value: 'active' }
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { field: 'name', name: 'name', label: 'Name', align: 'left', sortable: true },
        { field: row => row.groupInfo.address, name: 'groupInfo.address', label: 'Address', align: 'left', sortable: true, style: 'white-space: normal' },
        { field: row => row.groupInfo.postalCode, name: 'groupInfo.postalCode', label: 'Postal Code', align: 'center', sortable: true },
        { field: row => row.groupInfo.phone, name: 'groupInfo.phone', label: 'Phone', align: 'center', sortable: true },
        { field: 'status', name: 'status', label: 'Status', align: 'left', sortable: true }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'name',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      alert: false
    }
  },

  created () {
    this.onRequest({
      pagination: this.pagination
    })
  },

  methods: {
    ...mapActions('groups', {
      findRoles: 'find',
      deleteRole: 'remove'
    }),

    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()
      const groupQuery = await this.filterGroup()

      if (filterParams.status === 'all') delete filterParams.status

      this.findRoles({
        query: {
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          level: 1,
          ...filterParams,
          ...groupQuery
        }
      })
        .then(res => {
          this.loading = false

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
    async getFilterValue () {
      const string = ['name', 'groupInfo.email', 'groupInfo.address', 'groupInfo.postalCode', 'groupInfo.phone']
      const filter = {}
      const options = ['status']

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
      })
        .onOk(() => {
          this.deleteRow(id)
        })
    },
    deleteRow (id) {
      this.deleteRole(id)
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
    }
  }
}
</script>
