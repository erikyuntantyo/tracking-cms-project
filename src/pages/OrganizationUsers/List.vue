<template>
  <div>
    <filter-input
      :fullname.sync="filter.fullname"
      :username.sync="filter.username"
      :email.sync="filter.email"
      :status.sync="filter.status"
      :mobile.sync="filter.mobile"
      :group.sync="filter.group"
      :company.sync="filter.company"
      :role-acl.sync="filter.roleAcl"
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
            @click="$router.push(`/organization-users/edit/${_id}`)"
            v-if="$can('update', 'Organization Users')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="delete"
            class="q-ml-sm"
            @click="onDelete(_id)"
            v-if="$can('delete', 'Organization Users')"
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
          @click="$router.push('/organization-users/add')"
          v-if="$can('create', 'Organization Users')"
        />
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'
import formatMixin from '../../mixins/format'
import FilterInput from './FilterInput'

export default {
  name: 'OrganizationUsersList',

  components: {
    FilterInput
  },

  mixins: [mixin, formatMixin],

  data () {
    return {
      filter: {
        fullname: '',
        username: '',
        email: '',
        status: { label: 'Active', value: true },
        mobile: '',
        group: null,
        company: null,
        roleAcl: null
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'fullname', field: 'fullname', label: 'Name', align: 'left', sortable: true },
        { name: 'username', field: 'username', label: 'Username', align: 'left', sortable: true },
        { name: 'email', field: this.emailField, label: 'E-Mail', align: 'left', sortable: true },
        { name: 'mobile', field: this.mobileField, label: 'Mobile', align: 'center', sortable: true },
        { name: 'group', field: row => row.group.name, label: 'Group', align: 'left' },
        { name: 'company', field: row => row.company.name, label: 'Company', align: 'left' },
        { name: 'roleAcl', field: row => row.roleAcl.name, label: 'Role', align: 'left' },
        { name: 'status', field: row => row.status ? 'Active' : 'Inactive', label: 'Status', align: 'left', sortable: true }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'fullname',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false
    }
  },

  created () {
    this.onRequest({
      pagination: this.pagination
    })
  },

  methods: {
    ...mapActions('users', {
      findUsers: 'find',
      removeUser: 'remove'
    }),

    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()
      const organizationQuery = await this.filterByOrganizationQuery()

      if (filterParams.status === 'all') delete filterParams.status

      this.findUsers({
        query: {
          $populate: ['company', 'group', 'roleAcl'],
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          $or: [
            { group: { $exists: true } },
            { company: { $exists: true } }
          ],
          ...organizationQuery,
          ...filterParams
        }
      })
        .then(async res => {
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
    onDelete (id) {
      this.$q.dialog({
        title: 'Delete Data',
        message: 'Are you sure want to delete this data?',
        cancel: { color: 'red-9', flat: true, padding: 'sm lg' },
        ok: { color: 'red-9', unelevated: true, padding: 'sm lg' }
      }).onOk(() => {
        this.removeUser(id)
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

    mobileField (v) {
      if (v.mobile) return this.maskPhone(v.mobile)

      return ''
    },
    emailField (v) {
      if (v.email) return this.maskEmail(v.email)

      return ''
    },

    async getFilterValue () {
      const string = ['fullname', 'username', 'email', 'mobile']
      const options = ['group', 'company', 'roleAcl', 'status']
      const filter = {}

      await string.map(v => {
        if (this.filter[v]) filter[v] = { $regex: this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
      })

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      return filter
    }
  }
}
</script>
