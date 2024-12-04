<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          label="Name *"
          color="red-9"
          v-model.trim="name"
          lazy-rules
          :rules="[
            val => val && val.length > 0 || 'Please type something',
          ]"
        />

        <q-select
          v-model="roles"
          label="Roles"
          clearable
          use-input
          use-chips
          multiple
          :options="options.roles"
          @filter="onFilterRoles"
          color="red-9"
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
  name: 'OrganizationTypesEdit',
  data () {
    return {
      name: '',
      roles: [],
      options: {
        roles: []
      }
    }
  },
  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },
  created () {
    if (!this.isNew) this.getSelectedData()
  },
  methods: {
    ...mapActions('roles', {
      findOrganizationTypes: 'find',
      getOrganizationType: 'get',
      createOrganizationType: 'create',
      patchOrganizationType: 'patch'
    }),
    async getSelectedData () {
      try {
        const { name, rolesAcl } = await this.getOrganizationType(this.$route.params.id)

        this.name = name

        if (rolesAcl.length) {
          await this.$store.dispatch('roles-acl/find', {
            query: {
              _id: { $in: rolesAcl }
            }
          })
            .then(({ data }) => {
              this.roles = data.map(({ _id, name }) => {
                return { label: name, value: _id }
              })
            })
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch data',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterRoles (val, update) {
      try {
        const query = {
          name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          $limit: 50
        }

        const { data } = await this.$store.dispatch('roles-acl/find', { query })

        update(() => {
          this.options.roles = data.map(({ _id, name }) => {
            return { label: name, value: _id }
          })
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch roles',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onSubmit () {
      const { name, roles } = this
      const user = await this.$store.getters['auth/user']

      const data = {
        name,
        rolesAcl: roles ? roles.map(v => v.value) : []
      }

      if (this.isNew) {
        data.createdBy = user._id

        this.createOrganizationType(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/organization-types')
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

        this.patchOrganizationType([this.$route.params.id, data])
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/organization-types')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create data',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
