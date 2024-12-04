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
              label="Name"
              :value="name"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:name', $event)"
            />

            <q-input
              outlined
              dense
              label="UEN"
              :value="uen"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:uen', $event)"
            />

            <q-input
              outlined
              dense
              label="Address"
              :value="address"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:address', $event)"
            />

            <q-input
              outlined
              dense
              label="Postal Code"
              :value="postalCode"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:postalCode', $event)"
            />

            <q-input
              outlined
              dense
              label="Phone"
              :value="phone"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:phone', $event)"
            />

            <q-select
              outlined
              dense
              label="Group"
              :value="parent"
              :options="options.groups"
              @filter="onFilterGroups"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:parent', $event)"
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
              label="Organization Type"
              :value="organizationType"
              :options="options.organizationTypes"
              @filter="onFilterOrganizationTypes"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:organizationType', $event)"
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
    name: {
      type: String,
      default: ''
    },
    uen: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    postalCode: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    parent: {
      type: Object,
      default: null
    },
    organizationType: {
      type: Object,
      default: null
    },
    status: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        groups: [],
        organizationTypes: [],
        statusses: [
          { label: 'All', value: 'all' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Terminated', value: 'terminated' }
        ]
      }
    }
  },
  methods: {
    async onFilterOrganizationTypes (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        $limit: 50,
        $select: ['_id', 'name']
      }

      await this.$store.dispatch('roles/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.organizationTypes = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
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
    }
  }
}
</script>
