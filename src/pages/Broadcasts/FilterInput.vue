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
              outlined
              dense
              label="Status"
              :value="draft"
              :options="statusses"
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              emit-value
              map-options
              @input="$emit('update:draft', $event)"
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
              label="Message"
              :value="content"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:content', $event)"
            />

            <q-select
              outlined
              dense
              label="Created By"
              :value="createdBy"
              :options="admins"
              @filter="onFilterAdmins"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:createdBy', $event)"
              emit-value
              map-options
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
              label="Date Created"
              outlined
              dense
              color="red-9"
              :value="rangeCreatedAt"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="qCreatedAtProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      :value="createdAt"
                      @input="v => onDateSelect('createdAt', v)"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="createdAt"
                  name="cancel"
                  @click.stop="$emit('update:createdAt', null)"
                  class="cursor-pointer"
                  color="grey-6"
                />
              </template>
            </q-input>

            <q-select
              outlined
              dense
              label="Sent By"
              :value="sender"
              :options="senders"
              @filter="onFilterSenders"
              use-input
              clearable
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:sender', $event)"
              emit-value
              map-options
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
              label="Date Sent"
              outlined
              dense
              color="red-9"
              :value="rangeSentAt"
              class="col-lg-2 col-sm-3 col-xs-12"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy
                    ref="qSentAtProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      color="red-9"
                      :value="sentAt"
                      @input="v => onDateSelect('sentAt', v)"
                      mask="DD/MM/YYYY"
                      range
                    />
                  </q-popup-proxy>
                </q-icon>
                <q-icon
                  v-if="sentAt"
                  name="cancel"
                  @click.stop="$emit('update:sentAt', null)"
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
export default {
  name: 'FilterInput',

  data () {
    return {
      statusses: [
        { label: 'Draft', value: true },
        { label: 'Sent', value: false }
      ],
      admins: [],
      senders: []
    }
  },

  props: {
    content: { type: String, default: '' },
    draft: { type: Boolean, default: false },
    createdAt: { type: [String, Object], default: null },
    sentAt: { type: [String, Object], default: null },
    sender: { type: String, default: '' },
    createdBy: { type: String, default: '' }
  },

  computed: {
    rangeCreatedAt () {
      if (!this.createdAt) return null

      const value = typeof this.createdAt === 'object'
        ? this.createdAt.from + '-' + this.createdAt.to
        : this.createdAt
      return value
    },
    rangeSentAt () {
      if (!this.sentAt) return null

      const value = typeof this.sentAt === 'object'
        ? this.sentAt.from + '-' + this.sentAt.to
        : this.sentAt
      return value
    }
  },

  methods: {
    onDateSelect (field, v) {
      const pascalCase = field.replace(/^[a-z]/, match => {
        return match.toUpperCase()
      })

      this.$refs[`q${pascalCase}Proxy`].hide()
      this.$emit(`update:${field}`, v)
    },
    onFilterAdmins (val, update) {
      const query = {
        fullname: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        group: { $exists: false },
        company: { $exists: false },
        $select: ['_id', 'fullname']
      }

      this.$store.dispatch('users/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.admins = data.map(({ _id, fullname }) => {
              return { label: fullname, value: _id }
            })
          })
        })
    },
    onFilterSenders (val, update) {
      const query = {
        fullname: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        group: { $exists: false },
        company: { $exists: false },
        $select: ['_id', 'fullname']
      }

      this.$store.dispatch('users/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.senders = data.map(({ _id, fullname }) => {
              return { label: fullname, value: _id }
            })
          })
        })
    }
  }
}
</script>
