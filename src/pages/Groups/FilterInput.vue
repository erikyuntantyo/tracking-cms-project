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
    status: {
      type: Object,
      default: null
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        statusses: [
          { label: 'All', value: 'all' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Active', value: 'active' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Terminated', value: 'terminated' }
        ]
      }
    }
  }
}
</script>
