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
              label="Status"
              :value="status"
              :options="options.statusses"
              clearable
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
export default {
  name: 'FilterInput',

  props: {
    name: {
      type: String,
      default: ''
    },
    status: {
      type: Object,
      default: null
    }
  },

  data () {
    return {
      options: {
        statusses: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ]
      }
    }
  },

  methods: {
  }
}
</script>
