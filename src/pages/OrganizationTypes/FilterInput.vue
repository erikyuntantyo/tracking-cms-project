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

            <q-select
              outlined
              dense
              label="Roles"
              multiple
              use-chips
              use-input
              :value="rolesAcl"
              :options="options.roles"
              @filter="onFilterRoles"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:rolesAcl', $event)"
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
export default {
  name: 'FilterInput',
  props: {
    name: {
      type: String,
      default: ''
    },
    rolesAcl: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      options: {
        roles: []
      }
    }
  },
  methods: {
    async onFilterRoles (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        $limit: 50,
        $select: ['_id', 'name']
      }
      const { data } = await this.$store.dispatch('roles-acl/find', { paginate: false, query })

      update(() => {
        this.options.roles = data.map(({ _id, name }) => {
          return { label: name, value: _id }
        })
      })
    }
  }
}
</script>
