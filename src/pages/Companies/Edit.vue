<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-select
          v-model="parent"
          :options="options.groups"
          @filter="onFilterGroups"
          label="Select a group *"
          color="red-9"
          use-input
          clearable
          lazy-rules
          :rules="[val => !!val || 'Please type something']"
          :readonly="!isNew"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <div v-if="parent">
          <div class="text-bold q-mb-md">
            Same as Group
          </div>

          <q-checkbox
            v-model="copiedGroupInfo"
            label="Group Info"
            dense
            color="red-9"
            class="q-mt-none"
            :disable="!isCdas && !isNew"
          />

          <q-checkbox
            v-model="copiedContactPerson"
            label="Contact Person"
            dense
            color="red-9"
            class="q-mt-none q-ml-md"
          />
        </div>

        <div class="row">
          <div class="q-gutter-md col q-pr-md">
            <div class="text-bold">
              Company Info
            </div>

            <q-input
              v-model.trim="name"
              label="Company Name *"
              color="red-9"
              ref="name"
              :readonly="!isCdas && !isNew"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something',
                isUniqueName
              ]"
            />

            <!-- <q-input
              v-model.trim="code"
              label="Code *"
              @input="code = code.toUpperCase().replace(/[0-9\]*[\W_]/g, '')"
              color="red-9"
              lazy-rules
              :rules="[
                val => val && val.length === 3 || 'Please enter 3 character alphabet only',
                isUniqueCode
              ]"
              :readonly="!isCdas && !isNew"
            /> -->

            <q-input
              v-model.trim="groupInfo.uen"
              label="Entity Unique Number (UEN) *"
              color="red-9"
              ref="uen"
              lazy-rules
              @input="v => groupInfo.uen = v.toUpperCase().replace(/\s/g, '')"
              :rules="[
                val => val && val.length > 8 && val.length < 11 || 'Please enter between 9-10 character',
                isUniqueUen
              ]"
              :readonly="!isCdas && !isNew"
            />

            <q-input
              label="Registration Date *"
              color="red-9"
              v-model="groupInfo.registrationDate"
              mask="##/##/####"
              lazy-rules
              :rules="[ val => !!val || 'Please pick a date' ]"
              :readonly="!isCdas && !isNew"
            >
              <template #append>
                <q-icon name="event">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                    v-if="isCdas && isNew"
                  >
                    <q-date
                      color="red-9"
                      v-model="groupInfo.registrationDate"
                      @input="() => $refs.qDateProxy.hide()"
                      mask="DD/MM/YYYY"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-select
              v-model="status"
              :options="options.statusses"
              label="Status *"
              color="red-9"
              lazy-rules
              clearable
              style="text-transform: capitalize;"
              popup-content-style="text-transform: capitalize"
              :readonly="!isCdas"
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
              :disable="copiedGroupInfo"
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
                :disabled-fetching-country="isNew ? false : true"
                default-country="sg"
              />
            </div>

            <q-select
              v-model="organizationType"
              :options="options.organizationTypes"
              @filter="onFilterOrganizationTypes"
              label="Organization Types *"
              color="red-9"
              use-input
              clearable
              lazy-rules
              :rules="[val => !!val || 'Please type something']"
              :readonly="!isCdas && !isNew"
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
              v-model="timezone"
              :options="options.timezones"
              label="Timezone *"
              color="red-9"
              lazy-rules
              clearable
              :rules="[val => !!val || 'Please type something']"
              :disable="copiedGroupInfo"
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
            <div class="text-bold">
              Contact Person
            </div>

            <q-input
              v-model.trim="contactPerson.name"
              label="Contact Name *"
              color="red-9"
              lazy-rules
              :rules="[
                val => !!val || 'Please type something'
              ]"
              :disable="copiedContactPerson"
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
                :disabled-fetching-country="isNew ? false : true"
                default-country="sg"
                :disabled="copiedContactPerson"
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
  name: 'CompaniesEdit',

  mixins: [filterMixin, optionsMixin],

  data () {
    return {
      name: '',
      // code: '',
      status: 'active',
      groupInfo: {
        uen: '',
        registrationDate: null,
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
      organizationType: null,
      parent: null,
      copiedGroupInfo: false,
      copiedContactPerson: false,
      options: {
        groups: [],
        organizationTypes: [],
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
    if (!this.isNew) await this.getSelectedData()
  },

  watch: {
    // 'groupInfo.uen' (v) {
    //   this.$refs.name.validate()
    // },
    // organizationType (v) {
    //   this.$refs.uen.validate()
    // },
    parent (v, old) {
      // if (v && (old && old.value !== v.value)) this.setGroupInfo()

      if (!v) {
        this.copiedGroupInfo = false
        this.copiedContactPerson = false
      }
    },
    copiedGroupInfo: 'setGroupInfo',
    copiedContactPerson: 'setContactPerson'
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
      getCompany: 'get',
      createCompany: 'create',
      patchCompany: 'patch'
    }),

    async setGroupInfo () {
      if (this.parent) {
        const parent = this.$store.getters['groups/get'](this.parent.value)
        const res = this.$store.getters['groups/get'](this.$route.params.id)

        if (this.copiedGroupInfo) {
          this.name = parent.name
          this.groupInfo.address = parent.groupInfo.address
          this.groupInfo.postalCode = parent.groupInfo.postalCode
          this.groupInfo.email = parent.groupInfo.email
          this.groupInfo.phone = parent.groupInfo.phone
          this.timezone = parent.timezone
        } else {
          if (!this.isNew) {
            this.name = res.name
            this.groupInfo.email = res.groupInfo.email
            this.groupInfo.address = res.groupInfo.address
            this.groupInfo.postalCode = res.groupInfo.postalCode
            this.groupInfo.phone = res.groupInfo.phone
            this.timezone = res.timezone
          } else {
            this.name = ''
            this.groupInfo.email = ''
            this.groupInfo.address = ''
            this.groupInfo.postalCode = ''
            this.groupInfo.phone = ''
            this.timezone = '+08:00'
          }
        }
      }
    },
    setContactPerson () {
      if (this.parent) {
        const parent = this.$store.getters['groups/get'](this.parent.value)
        const res = this.$store.getters['groups/get'](this.$route.params.id)

        if (this.copiedContactPerson) {
          this.contactPerson.name = parent.contactPerson.name
          this.contactPerson.phone = parent.contactPerson.phone
        } else {
          if (!this.isNew) {
            this.contactPerson.name = res.contactPerson.name
            this.contactPerson.name = res.contactPerson.phone
          } else {
            this.contactPerson.name = ''
            this.contactPerson.phone = ''
          }
        }
      }
    },

    async getSelectedData () {
      try {
        const {
          name,
          // code,
          groupInfo,
          contactPerson,
          timezone,
          organizationType,
          parent,
          status,
          copiedGroupInfo,
          copiedContactPerson
        } = await this.getCompany(this.$route.params.id)

        this.name = name
        // this.code = code
        this.groupInfo.name = groupInfo.name
        this.groupInfo.email = groupInfo.email
        this.groupInfo.address = groupInfo.address
        this.groupInfo.uen = groupInfo.uen
        this.groupInfo.postalCode = groupInfo.postalCode
        this.groupInfo.phone = groupInfo.phone
        this.groupInfo.registrationDate = this.$moment(groupInfo.registrationDate).format('DD/MM/YYYY')
        this.contactPerson.name = contactPerson.name
        this.contactPerson.phone = contactPerson.phone
        this.timezone = timezone
        this.status = status
        this.copiedGroupInfo = !!copiedGroupInfo
        this.copiedContactPerson = !!copiedContactPerson

        await this.$store.dispatch('groups/get', [parent, { query: { level: 1 } }])
          .then(({ _id, name }) => {
            this.parent = { label: name, value: _id }
          })
          .catch('')

        await this.$store.dispatch('roles/get', [organizationType])
          .then(({ _id, name }) => (this.organizationType = { label: name, value: _id }))
          .catch('')

        if (copiedGroupInfo || copiedContactPerson) {
          const group = await this.$store.getters['groups/get'](parent)
          const data = {}

          if (copiedGroupInfo && this.groupInfo.email !== group.groupInfo.email) data['groupInfo.email'] = group.groupInfo.email
          if (copiedGroupInfo && this.timezone !== group.timezone) data.timezone = group.timezone
          if (copiedContactPerson && this.contactPerson.name !== group.contactPerson.name) data['contactPerson.name'] = group.contactPerson.name
          if (copiedContactPerson && this.contactPerson.phone !== group.contactPerson.phone) data['contactPerson.phone'] = group.contactPerson.phone

          if (Object.keys(data).length) {
            await this.$store.dispatch('groups/patch', [this.$route.params.id, data])
              .then(res => {
                this.groupInfo.email = res.groupInfo.email
                this.timezone = res.timezone
                this.contactPerson.name = res.contactPerson.name
                this.contactPerson.phone = res.contactPerson.phone
              })
          }
        }
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
        level: 2
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
    isUniqueUen (v) {
      const query = {
        'groupInfo.uen': { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }

      // if (this.organizationType) query.organizationType = this.organizationType.value
      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      return this.$store.dispatch('groups/find', { query })
        .then(res => {
          return !res.total || 'The UEN already registered'
        })
        .catch('Failed to validate UEN')
    },
    isUniqueCode (v) {
      const query = {
        code: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }

      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      return this.$store.dispatch('groups/find', { query })
        .then(res => {
          return !res.total || 'The code already registered'
        })
        .catch('Failed to validate code')
    },
    isEmail (val) {
      const pattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/

      return pattern.test(val) || 'Invalid email format'
    },

    async onFilterGroups (val, update) {
      const groupQuery = await this.filterGroup()

      const query = {
        name: { $regex: val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        level: 1,
        ...groupQuery,
        $select: ['_id', 'name', 'groupInfo', 'timezone', 'contactPerson']
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
    async onFilterOrganizationTypes (val, update) {
      const query = {
        name: { $regex: val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
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

    async onSubmit () {
      const user = this.$store.getters['auth/user']

      const {
        name,
        // code,
        groupInfo, contactPerson, timezone, organizationType, parent, status, copiedGroupInfo, copiedContactPerson
      } = this
      const data = {
        name,
        // code,
        level: 2,
        'groupInfo.uen': groupInfo.uen,
        'groupInfo.registrationDate': this.$moment(groupInfo.registrationDate, 'DD/MM/YYYY').toDate(),
        'groupInfo.email': groupInfo.email,
        'groupInfo.address': groupInfo.address,
        'groupInfo.postalCode': groupInfo.postalCode,
        'groupInfo.phone': groupInfo.phone.replace(/-|\s/g, ''),
        contactPerson,
        timezone,
        organizationType: organizationType.value,
        parent: parent.value,
        status,
        copiedGroupInfo,
        copiedContactPerson
      }

      // Unformat phone number
      if (data.contactPerson.phone) data.contactPerson.phone = contactPerson.phone.replace(/-|\s/g, '')

      if (this.isNew) {
        data.createdBy = user._id

        await this.createCompany(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Company created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/companies')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create company',
              icon: 'error',
              position: 'top'
            })
          })
      } else {
        data.updatedBy = user._id

        await this.patchCompany([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Company updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/companies')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to update company',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
