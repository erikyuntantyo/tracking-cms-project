<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <div class="row">
          <div class="q-gutter-md col q-pr-md">
            <q-input
              v-model.trim="name"
              label="Group Name *"
              color="red-9"
              ref="name"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something',
                isUniqueName
              ]"
              :readonly="!isCdas && !isNew"
            />

            <q-select
              v-model="status"
              :options="options.statusses"
              label="Status *"
              color="red-9"
              lazy-rules
              clearable
              style="text-transform: capitalize;"
              popup-content-style="text-transform: capitalize"
              :readonly="!isCdas || isNew"
              :rules="[val => !!val || 'Please type something']"
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
              v-model.trim="groupInfo.email"
              label="E-Mail *"
              color="red-9"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something'
              ]"
            />

            <q-input
              label="Address *"
              type="textarea"
              v-model="groupInfo.address"
              color="red-9"
              lazy-rules
              :rules="[ val => !!val || 'Please type something' ]"
            />

            <q-input
              v-model.trim="groupInfo.postalCode"
              @input="groupInfo.postalCode = groupInfo.postalCode.replace(/[^0-9]/g, '')"
              label="Postal Code *"
              color="red-9"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something'
              ]"
            />

            <div>
              <div class="q-field__label text-caption q-mb-xs">
                Company Phone *
              </div>
              <vue-tel-input
                v-model="groupInfo.phone"
                mode="international"
                required
                valid-characters-only
                default-country="sg"
                :disabled-fetching-country="isNew ? false : true"
              />
            </div>

            <q-select
              v-model="timezone"
              :options="options.timezones"
              label="Timezone *"
              color="red-9"
              lazy-rules
              clearable
              :rules="[val => !!val || 'Please type something']"
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

          <div class="q-gutter-md col q-pl-md">
            <q-input
              v-model.trim="contactPerson.name"
              label="Contact Name *"
              color="red-9"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something'
              ]"
            />

            <div>
              <div class="q-field__label text-caption q-mb-xs">
                Phone *
              </div>
              <vue-tel-input
                v-model="contactPerson.phone"
                mode="international"
                required
                valid-characters-only
                disabled-fetching-country
                default-country="sg"
              />
            </div>
          </div>
        </div>

        <div class="text-right q-mt-lg">
          <q-btn
            label="Back"
            padding="sm lg"
            @click.prevent="$router.go(-1)"
            color="red-9"
            flat
          />

          <q-btn
            label="Submit"
            type="submit"
            class="q-ml-sm"
            padding="sm lg"
            unelevated
            color="red-10"
            text-color="red-1"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapActions } from 'vuex'
import filterMixin from '../../mixins/filter'
import optionsMixin from '../../mixins/options'

export default {
  name: 'GroupsEdit',

  mixins: [filterMixin, optionsMixin],

  data () {
    return {
      name: '',
      status: 'active',
      groupInfo: {
        email: '',
        address: '',
        postalCode: '',
        phone: ''
      },
      contactPerson: {
        name: '',
        phone: ''
      },
      timezone: '+08:00',
      options: {
        statusses: [
          'inactive',
          'active',
          'suspended',
          'terminated'
        ]
      }
    }
  },

  async created () {
    if (!this.isNew) this.getSelectedData()
  },

  watch: {
    // 'groupInfo.uen' (v) {
    //   this.$refs.name.validate()
    // },
    // organizationType (v) {
    //   this.$refs.uen.validate()
    // }
  },

  computed: {
    isNew () {
      return !this.$route.params.id
    },
    isCdas () {
      return typeof this.$store.getters['auth/user'].group === 'undefined'
    }
  },

  methods: {
    ...mapActions('groups', {
      getGroup: 'get',
      createGroup: 'create',
      patchGroup: 'patch'
    }),

    async getSelectedData () {
      try {
        const {
          name,
          groupInfo,
          contactPerson,
          timezone,
          status
        } = await this.getGroup(this.$route.params.id)

        this.name = name
        this.groupInfo = groupInfo
        this.contactPerson = contactPerson
        this.timezone = timezone
        this.status = status
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to get company',
          icon: 'error',
          position: 'top'
        })
      }
    },

    async isUniqueName (v) {
      const query = {
        name: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        level: 1
      }

      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      // if (this.groupInfo.uen) {
      //   const { data } = await this.$store.dispatch('groups/find', {
      //     query: { 'groupInfo.uen': { $regex: `^${this.groupInfo.uen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
      //   })

      //   if (data.length) {
      //     return v.trim() === data[0].name.trim() || `You are using registered UEN, please use name ${data[0].name} instead`
      //   }
      // }

      return this.$store.dispatch('groups/find', { query })
        .then(res => {
          return !res.total || 'The name already registered'
        })
        .catch('Failed to validate name')
    },
    isEmail (val) {
      const pattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/

      return pattern.test(val) || 'Invalid email format'
    },

    async onSubmit () {
      const user = this.$store.getters['auth/user']

      const { name, groupInfo, contactPerson, timezone, status } = this
      const data = {
        name,
        level: 1,
        'groupInfo.email': groupInfo.email,
        'groupInfo.address': groupInfo.address,
        'groupInfo.postalCode': groupInfo.postalCode,
        'groupInfo.phone': groupInfo.phone.replace(/-|\s/g, ''),
        contactPerson,
        timezone,
        status
      }

      // Unformat phone number
      if (data.contactPerson.phone) data.contactPerson.phone = contactPerson.phone.replace(/-|\s/g, '')

      if (this.isNew) {
        data.createdBy = user._id

        await this.createGroup(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Group created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/groups')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create group',
              icon: 'error',
              position: 'top'
            })
          })
      } else {
        data.updatedBy = user._id

        await this.patchGroup([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Group updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/groups')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to update group',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
