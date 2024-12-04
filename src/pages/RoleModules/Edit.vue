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
          :rules="[val => !!val || 'Please type something']"
        />

        <div>
          <q-checkbox
            v-model="forCdas"
            dense
            label="Is CDAS Role?"
            color="red-9"
            class="q-mt-none"
          />
        </div>

        <div>
          <div
            v-for="(module, idx) in modules"
            :key="idx"
            class="row"
          >
            <div class="q-mb-md text-bold col-4">
              {{ module.name }}
            </div>

            <div class="flex">
              <q-checkbox
                dense
                color="red-9"
                label="All"
                v-model="module.allowAll"
                @input="onAllowAll(module)"
                class="q-mr-xl"
              />

              <q-checkbox
                v-if="module.allowRead !== null"
                dense
                color="red-9"
                label="View"
                v-model="module.allowRead"
                @input="onCheck(module)"
                class="q-mr-xl"
              />

              <q-checkbox
                v-if="module.allowCreate !== null"
                dense
                color="red-9"
                label="Create"
                v-model="module.allowCreate"
                @input="onCheck(module)"
                class="q-mr-xl"
              />

              <q-checkbox
                v-if="module.allowUpdate !== null"
                dense
                color="red-9"
                label="Edit"
                v-model="module.allowUpdate"
                @input="onCheck(module)"
                class="q-mr-xl"
              />

              <q-checkbox
                v-if="module.allowDelete !== null"
                dense
                color="red-9"
                label="Delete"
                v-model="module.allowDelete"
                @input="onCheck(module)"
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
import { AbilityBuilder } from '@casl/ability'

export default {
  name: 'RoleModulesEdit',

  data () {
    return {
      name: '',
      forCdas: false,
      modules: []
    }
  },

  async mounted () {
    await this.setModules()

    if (!this.isNew) this.getSelectedData()
  },

  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },

  methods: {
    ...mapActions('roles-acl', {
      getRole: 'get',
      createRole: 'create',
      patchRole: 'patch'
    }),

    async setModules () {
      let modules = await this.$store.dispatch('master-modules/find', {
        query: {
          $limit: 999999
        }
      })
        .then(res => res.data.map(v => ({ name: v.name })))
        .catch([])

      if (modules.length) {
        const customModules = [
          { name: 'Messaging', permissions: 'cr' },
          { name: 'Vehicle Tracking', permissions: 'r' },
          { name: 'Jobs', permissions: 'ru' },
          { name: 'Messaging History', permissions: 'r' },
          { name: 'Vehicle Journey History', permissions: 'r' },
          { name: 'User Activities', permissions: 'r' },
          { name: 'System Settings', permissions: 'ru' },
          { name: 'Multiple Users', permissions: 'rc' },
          { name: 'Upload Vehicles', permissions: 'rc' },
          { name: 'Ping', permissions: 'rc' },
          { name: 'Reset User Password', permissions: 'r' },
          { name: 'Message History', permissions: 'r' },
          { name: 'Trailer Management', permissions: 'ru' }
        ]

        modules = await modules.map(({ name }) => {
          if (customModules.some(v => v.name === name)) {
            const module = customModules.filter(v => v.name === name)[0]
            const permissions = {
              name: module.name,
              allowAll: false,
              allowCreate: null,
              allowRead: null,
              allowUpdate: null,
              allowDelete: null
            }

            if (module.permissions.includes('c')) permissions.allowCreate = false
            if (module.permissions.includes('r')) permissions.allowRead = false
            if (module.permissions.includes('u')) permissions.allowUpdate = false
            if (module.permissions.includes('d')) permissions.allowDelete = false

            return permissions
          } else {
            return {
              name,
              allowAll: false,
              allowCreate: false,
              allowRead: false,
              allowUpdate: false,
              allowDelete: false
            }
          }
        })
      }

      this.modules = modules
    },

    async getSelectedData () {
      try {
        const role = await this.getRole(this.$route.params.id)

        this.name = role.name
        this.forCdas = role.forCdas

        if (role.modules.length) {
          this.modules.forEach(async v => {
            const module = await role.modules.filter(val => val.name === v.name)[0]

            if (module) {
              if (v.allowCreate !== null) v.allowCreate = await module.allowCreate
              if (v.allowRead !== null) v.allowRead = await module.allowRead
              if (v.allowUpdate !== null) v.allowUpdate = await module.allowUpdate
              if (v.allowDelete !== null) v.allowDelete = await module.allowDelete
            }

            this.onCheck(v)
          })
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to get role',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onAllowAll (item) {
      if (item.allowCreate !== null) item.allowCreate = item.allowAll
      if (item.allowRead !== null) item.allowRead = item.allowAll
      if (item.allowUpdate !== null) item.allowUpdate = item.allowAll
      if (item.allowDelete !== null) item.allowDelete = item.allowAll
    },
    async onCheck (item) {
      const allowCreate = item.allowCreate === null || item.allowCreate
      const allowRead = item.allowRead === null || item.allowRead
      const allowUpdate = item.allowUpdate === null || item.allowUpdate
      const allowDelete = item.allowDelete === null || item.allowDelete

      item.allowAll = allowCreate && allowRead && allowUpdate && allowDelete
    },

    async updateAbilities () {
      const user = await this.$store.getters['auth/user']
      const role = await this.$store.dispatch('roles-acl/get', user.roleAcl)

      const { can, cannot, rules } = new AbilityBuilder()

      await role.modules.forEach(el => {
        el.allowCreate
          ? can('create', el.name)
          : cannot('create', el.name)

        el.allowUpdate
          ? can('update', el.name)
          : cannot('update', el.name)

        el.allowRead
          ? can('read', el.name)
          : cannot('read', el.name)

        el.allowDelete
          ? can('delete', el.name)
          : cannot('delete', el.name)
      })

      await this.$ability.update(rules)
    },

    onSubmit () {
      const user = this.$store.getters['auth/user']

      const { name, forCdas, modules } = this
      const data = {
        name,
        forCdas,
        modules: modules.map(v => {
          delete v.allowAll
          return v
        })
      }

      if (this.isNew) {
        data.createdBy = user._id

        this.createRole(data)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Role created successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/role-modules')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to create role',
              icon: 'error',
              position: 'top'
            })
          })
      } else {
        data.updatedBy = user._id

        this.patchRole([this.$route.params.id, data])
          .then(res => {
            this.updateAbilities()

            this.$q.notify({
              color: 'positive',
              message: 'Role updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/role-modules')
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to update role',
              icon: 'error',
              position: 'top'
            })
          })
      }
    }
  }
}
</script>
