<template>
  <div class="full-width full-height bg-grey-3">
    <div class="q-px-sm full-height column full-width">
      <div class="col q-py-md full-height full-width column justify-center">
        <div
          class="q-mb-md"
          v-if="$can('create', 'Messaging') && !isGroup"
        >
          <q-btn
            class="text-capitalize full-width"
            padding="sm"
            unelevated
            color="white"
            text-color="gray-10"
            label="Broadcast Message"
            size="sm"
            @click="onBroadcastClick"
          />
        </div>

        <div class="q-mb-sm column full-width">
          <label class="block text-subtitle2 q-mb-xs">Filter</label>
          <q-select
            v-if="!isGroup && (!this.$store.getters['auth/user'].group && !this.$store.getters['auth/user'].company)"
            filled
            dense
            label="Select a company"
            :value="selectedCompany"
            :options="companies"
            @filter="onFilterCompanies"
            clearable
            bg-color="white"
            color="red-9"
            class="q-mb-sm full-width"
            size="sm"
            lazy-rules
            use-input
            emit-value
            map-options
            @input="$emit('update:selectedCompany', $event)"
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
            v-if="!isGroup"
            clearable
            use-input
            use-chips
            multiple
            filled
            dense
            label="Select a group"
            :value="selectedGroup"
            :options="groups"
            @filter="onFilterGroups"
            bg-color="white"
            color="red-9"
            class="q-mb-sm full-width"
            size="sm"
            lazy-rules
            emit-value
            map-options
            @input="$emit('update:selectedGroup', $event)"
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
            v-if="!isGroup"
            bg-color="white"
            color="red-9"
            use-input
            filled
            dense
            clearable
            size="sm"
            placeholder="Type vehicle no."
            :value="filter"
            @input="$emit('update:filter', $event)"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-input
            v-else
            bg-color="white"
            color="red-9"
            dense
            use-input
            filled
            placeholder="Type group name"
            :value="filterGroup"
            @input="$emit('update:filterGroup', $event)"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="q-mb-xs flex justify-between">
          <h2
            :style="{ display: 'block' }"
            class="col-auto text-subtitle2 text-red-10"
          >
            Vehicles <span class="text-grey-10">({{ vehicles.length }})</span>
          </h2>

          <h2 class="col-auto text-subtitle2">
            Sort by:
            <q-btn-dropdown
              class="text-capitalize"
              size="sm"
              dropdown-icon="expand_more"
              unelevated
              color="white"
              text-color="gray-10"
              :label="sortBy"
            >
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  v-for="sort in sorts"
                  :key="sort"
                  @click="$emit('update:sort-by', sort)"
                  :active="sort === sortBy"
                  active-class="bg-red-1 text-red-9"
                >
                  <q-item-section>
                    <q-item-label class="text-capitalize">
                      {{ sort }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </h2>
        </div>

        <div
          class="col bg-white rounded-borders relative-position full-height"
        >
          <q-scroll-area
            class="q-pa-xs full-height"
            :thumb-style="{
              right: '4px',
              borderRadius: '5px',
              backgroundColor: '#b71c1c',
              width: '5px',
              opacity: 0.75
            }"
            :bar-style="{
              right: '2px',
              borderRadius: '9px',
              backgroundColor: '#b71c1c',
              width: '9px',
              opacity: 0.2
            }"
            v-if="vehicles.length"
          >
            <div
              class="row q-col-gutter-xs"
              v-if="!isGroup"
            >
              <div
                class="col-md-4 col-sm-3 flex items-center justify-center"
                v-for="vehicle in vehicles"
                :key="vehicle._id"
              >
                <q-card
                  class="full-width cursor-pointer relative-position"
                  flat
                  bordered
                  v-ripple
                  @click="onVehicleClick(vehicle)"
                >
                  <q-card-section
                    :style="{ height: '3rem' }"
                    :class="[
                      {
                        'bg-blue-2':
                          selectedVehicles.includes(vehicle._id),
                        'bg-grey-3': !selectedVehicles.includes(
                          vehicle._id
                        ) && !vehicle.hasNewMessage,
                        'bg-orange-13': !selectedVehicles.includes(
                          vehicle._id
                        ) && vehicle.hasNewMessage
                      },
                      'flex items-center justify-center text-subtitle2']"
                  >
                    <q-icon
                      size="xs"
                      class="absolute-top-right text-grey-7 q-mt-xs q-mr-xs"
                      v-if="selectedVehicles.includes(vehicle._id)"
                    />
                    {{ vehicle.vehicleNo }}
                  </q-card-section>
                </q-card>

                <q-inner-loading
                  :showing="visible"
                  label="Please wait..."
                  label-class="text-teal"
                  label-style="font-size: 1.1em"
                />
              </div>
            </div>
          </q-scroll-area>

          <div
            v-else
            class="text-grey-5 text-center absolute"
            style="left: 0; right: 0; top: 50%; transform: translateY(-50%);"
          >
            <q-icon
              name="sms_failed"
              size="lg"
              class="q-mb-sm"
            />
            <p class="q-mb-none">
              You dont have any message here
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarMessage',

  props: {
    filter: { type: String, default: '' },
    filterGroup: { type: String, default: '' },
    selectedGroup: {
      type: Array,
      default: () => []
    },
    groups: {
      type: Array,
      default: () => []
    },
    selectedCompany: { type: String, default: '' },
    selectedVehicles: {
      type: Array,
      default: () => []
    },
    vehicles: {
      type: Array,
      default: () => []
    },
    vehicleGroups: {
      type: Array,
      default: () => []
    },
    sortBy: {
      type: String,
      default: 'latest message'
    },
    sorts: {
      type: Array,
      default: () => []
    },
    visible: Boolean
  },

  async mounted () {
    if (localStorage.getItem('selected-company')) {
      await this.$store.dispatch('groups/find', {
        paginate: false,
        query: {
          _id: localStorage.getItem('selected-company')
        }
      })
        .then(({ data }) => {
          this.companies = data.map(({ _id, name }) => {
            return { label: name, value: _id }
          })
        })
    }
  },

  data () {
    return {
      isGroup: false,
      isRead: false,
      companies: []
    }
  },

  methods: {
    onVehicleClick (vehicle) {
      if (!vehicle.loadProccess) {
        this.$emit('vehicle-click', vehicle._id)
      }
    },
    onBroadcastClick () {
      this.$emit('broadcast-click')
    },
    clearGroupSelected () {
      this.$emit('clear-group-click')
    },
    onFilterCompanies (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        $select: ['_id', 'name']
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.companies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    onFilterGroups (val, update) {
      this.$emit('filter-groups', { val, update })
    }
  }
}
</script>
<style scoped>
  .close {
    cursor: pointer;
    position: absolute;
    top: 50%;
    right: 0%;
    padding: 12px 16px;
    transform: translate(0%, -50%);
  }
</style>
