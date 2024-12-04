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
              label="Module"
              :value="module"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:module', $event)"
            />

            <q-select
              outlined
              dense
              label="Action"
              :value="action"
              :options="options.actions"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12 text-capitalize"
              popup-content-class="text-capitalize"
              @input="$emit('update:action', $event)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              outlined
              dense
              label="Record"
              :value="record"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:record', $event)"
            />

            <q-input
              label="Date"
              outlined
              dense
              color="red-9"
              :value="computedDate"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      v-model="computedDate"
                      @input="() => $refs.qDateProxy.hide()"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="computedDate"
                  name="cancel"
                  @click.stop="computedDate = null"
                  class="cursor-pointer"
                  color="grey-6"
                />
              </template>
            </q-input>
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
    module: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      default: ''
    },
    record: {
      type: String,
      default: ''
    },
    createdAt: {
      type: [String, Object],
      default: null
    }
  },

  mixins: [mixin],

  computed: {
    computedDate: {
      get () {
        if (!this.createdAt) return null

        const value = typeof this.createdAt === 'object'
          ? this.createdAt.from + '-' + this.createdAt.to
          : this.createdAt
        return value
      },
      set (v) {
        return this.$emit('update:createdAt', v)
      }
    }
  },

  data () {
    return {
      options: {
        actions: ['login', 'logout', 'create', 'update', 'patch', 'remove']
      }
    }
  }
}
</script>
