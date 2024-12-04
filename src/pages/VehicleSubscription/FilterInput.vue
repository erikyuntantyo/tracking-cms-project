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
            <q-select
              v-if="!companyUser"
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
              label="License Type"
              :value="license"
              :options="options.licenses"
              @filter="onFilterLicenses"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:license', $event)"
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
              label="Date Created"
              :value="createPick"
              color="red-9"
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
                      v-model="createPick"
                      color="red-9"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          label="Clear"
                          flat
                          @click="createPick = null"
                        />
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="red-9"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              outlined
              dense
              label="Date Updated"
              :value="updatePick"
              color="red-9"
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
                      v-model="updatePick"
                      color="red-9"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          label="Clear"
                          flat
                          @click="updatePick = null"
                        />
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="red-9"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
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
    company: {
      type: Object,
      default: null
    },
    license: {
      type: Object,
      default: null
    },
    createdAt: {
      type: String,
      default: null
    },
    updatedAt: {
      type: String,
      default: null
    }
  },

  mixins: [mixin],
  computed: {
    createPick: {
      get: function () {
        return this.createdAt
      },
      set: function (newValue) {
        this.$emit('update:createdAt', newValue)
      }
    },
    updatePick: {
      get: function () {
        return this.updatedAt
      },
      set: function (newValue) {
        this.$emit('update:updatedAt', newValue)
      }
    }
  },
  data () {
    return {
      companyUser: this.$store.getters['auth/user'].company,
      options: {
        companies: [],
        licenses: []
      }
    }
  },
  methods: {
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
    async onFilterLicenses (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        $limit: 50,
        $select: ['_id', 'name']
      }

      this.$store.dispatch('licences/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.options.licenses = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    }
  }
}
</script>
