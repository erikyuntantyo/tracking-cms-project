<template>
  <div>
    <filter-input
      :name.sync="filter.name"
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
            @click="$router.push(`/role-modules/edit/${_id}`)"
            v-if="$can('update', 'Role Modules')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="delete"
            class="q-ml-sm"
            @click="onDelete(_id)"
            v-if="$can('delete', 'Role Modules')"
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
          @click="$router.push('/role-modules/add')"
          v-if="$can('create', 'Role Modules')"
        />
      </template>
    </q-table>
  </div>
</template>

<script>
import FilterInput from './FilterInput'
import { mapActions } from 'vuex'

export default {
  name: 'RoleModulesList',

  components: {
    FilterInput
  },

  data () {
    return {
      filter: {
        name: ''
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { field: 'name', name: 'name', label: 'Name', align: 'left', sortable: true }
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
    ...mapActions('roles-acl', {
      findRoles: 'find',
      deleteRole: 'remove'
    }),
    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()

      this.findRoles({
        query: {
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          ...filterParams
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
      const string = ['name']
      const filter = {}

      await string.map(v => {
        if (this.filter[v]) filter[v] = { $regex: `${this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' }
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
