<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          label="Title *"
          color="red-9"
          v-model.trim="title"
          lazy-rules
          :rules="[
            val => !!val || 'Please type something',
            isUniqueTitle
          ]"
        />

        <q-editor
          v-model="content"
          toolbar-toggle-color="red-9"
          min-height="5rem"
        />

        <div class="text-right">
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
  name: 'ArticlesEdit',
  data () {
    return {
      title: '',
      content: ''
    }
  },
  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },
  mounted () {
    if (!this.isNew) {
      this.getArticle(this.$route.params.id)
        .then(res => {
          this.title = res.title
          this.content = res.content
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to fetch data',
            icon: 'error',
            position: 'top'
          })
        })
    }
  },
  methods: {
    ...mapActions('articles', {
      getArticle: 'get',
      createArticle: 'create',
      patchArticle: 'patch'
    }),

    async isUniqueTitle (v) {
      const query = {
        title: { $regex: `^${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      }

      if (!this.isNew) query._id = { $ne: this.$route.params.id }

      return this.$store.dispatch('articles/find', { query })
        .then(res => {
          return !res.total || 'The title already registered'
        })
        .catch('Failed to validate title')
    },

    async onSubmit () {
      const { title, content } = this
      const user = await this.$store.getters['auth/user']

      const data = { title, content }

      if (!content) {
        return this.$q.notify({
          color: 'negative',
          message: 'Please fill the content',
          icon: 'error',
          position: 'top'
        })
      }

      try {
        let message = ''

        if (this.isNew) {
          data.createdBy = user._id
          await this.createArticle(data)
          message = 'Data created successfully'
        } else {
          data.updatedBy = user._id
          await this.patchArticle([this.$route.params.id, data])
          message = 'Data updated successfully'
        }

        this.$q.notify({
          color: 'positive',
          message,
          icon: 'done',
          position: 'top'
        })

        this.$router.push('/articles')
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to create data',
          icon: 'error',
          position: 'top'
        })
      }
    }
  }
}
</script>
