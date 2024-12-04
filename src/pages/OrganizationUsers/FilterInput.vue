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
              label="Full Name"
              :value="fullname"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:fullname', $event)"
            />

            <q-input
              outlined
              dense
              label="Usename"
              :value="username"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:username', $event)"
            />

            <q-input
              outlined
              dense
              label="Mobile"
              :value="mobile"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:mobile', $event)"
            />

            <q-input
              outlined
              dense
              label="E-Mail"
              :value="email"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:email', $event)"
            />

            <q-select
              outlined
              dense
              label="Status"
              :value="status"
              :options="options.statusses"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:status', $event)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              outlined
              dense
              label="Group"
              :value="group"
              :options="options.groups"
              @filter="onFilterGroups"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:group', $event)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
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

            <q-select
              outlined
              dense
              label="Role"
              :value="roleAcl"
              :options="options.rolesAcl"
              @filter="onFilterRoles"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:roleAcl', $event)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
    fullname: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    mobile: {
      type: String,
      default: ''
    },
    status: {
      type: Object,
      default: null
    },
    group: {
      type: Object,
      default: null
    },
    company: {
      type: Object,
      default: null
    },
    roleAcl: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        groups: [],
        companies: [],
        rolesAcl: [],
        statusses: [
          { label: 'All', value: 'all' },
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ]
      }
    }
  },
  methods: {
    async onFilterGroups (val, update) {
      const groupQuery = await this.filterGroup()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 1,
        ...groupQuery,
        $select: ['_id', 'name']
      }

      await this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.groups = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
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
    },
    onFilterRoles (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        forCdas: false,
        $limit: 50,
        $select: ['_id', 'name']
      }

      this.$store.dispatch('roles-acl/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.rolesAcl = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    }
  }
}
</script>
