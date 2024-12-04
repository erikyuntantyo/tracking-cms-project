<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          v-model.trim="name"
          label="Name *"
          color="red-9"
          autofocus
          lazy-rules
          :rules="[
            val => !!val || 'Please type something',
            isUniqueName
          ]"
        />

        <q-select
          v-model="status"
          :options="options.statusses"
          label="Status *"
          color="red-9"
          lazy-rules
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

        <q-select
          v-model="tag"
          :options="options.tags"
          label="Tag *"
          color="red-9"
          lazy-rules
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

export default {
  name: 'LicenseTypesEdit',

  data () {
    return {
      name: '',
      status: { label: 'Active', value: true },
      tag: { label: 'Non-Default', value: false },
      options: {
        statusses: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ],
        tags: [
          { label: 'Default', value: true },
          { label: 'Non-default', value: false }
        ]
      }
    }
  },

  async created () {
    if (!this.isNew) this.getSelectedData()
  },

  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },

  methods: {
    ...mapActions('licences', {
      getLicenseType: 'get',
      createLicenseType: 'create',
      patchLicenseType: 'patch'
    }),

    async isUniqueName (v) {
      const query = {
        name: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }

      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      return this.$store.dispatch('licences/find', { query })
        .then(res => {
          return !res.total || 'The name already registered'
        })
        .catch('Failed to validate name')
    },

    async getSelectedData () {
      try {
        const data = await this.getLicenseType(this.$route.params.id)

        this.name = data.name
        this.status = { label: data.status ? 'Active' : 'Inactive', value: data.status }
        this.tag = { label: data.tag ? 'Default' : 'Non-Default', value: data.tag }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to get data',
          icon: 'error',
          position: 'top'
        })
      }
    },

    onSubmit () {
      const user = this.$store.getters['auth/user']

      const { name, status, tag } = this
      const data = { name, status: status.value, tag: tag.value }

      if (this.isNew) {
        data.createdBy = user._id

        this.createLicenseType(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/license-types')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create data',
              icon: 'error',
              position: 'top'
            })
          })
      } else {
        data.updatedBy = user._id

        this.patchLicenseType([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/license-types')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to update data',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
