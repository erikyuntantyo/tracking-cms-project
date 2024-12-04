<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <div class="q-field__label">
          Message *
        </div>
        <q-editor
          v-model="content"
          toolbar-toggle-color="red-9"
          :toolbar="[
            ['bold','italic','underline','strike']
          ]"
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
            label="Save"
            type="submit"
            class="q-ml-sm"
            padding="sm lg"
            outline
            unelevated
            color="red-10"
            @click="saveType = 'draft'"
          />

          <q-btn
            label="Send"
            type="submit"
            class="q-ml-sm"
            padding="sm lg"
            unelevated
            color="red-10"
            text-color="red-1"
            @click="saveType = ''"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'BroadcastsEdit',

  mounted () {
    if (!this.isNew) this.initializeData()
    document.querySelector('div[contenteditable]').addEventListener('paste', function (e) {
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertHTML', false, text)
    })
  },

  data () {
    return {
      content: '',
      saveType: ''
    }
  },

  computed: {
    isNew () {
      return !this.$route.params.id
    }
  },

  methods: {
    async initializeData () {
      try {
        const message = await this.$store.dispatch('messages/get', this.$route.params.id)

        this.content = message.content
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message,
          icon: 'error',
          position: 'top'
        })
      }
    },

    async onSave () {
      this.saveType = await 'draft'
      this.onSubmit()
    },

    async onSubmit () {
      if (!this.content) {
        return this.$q.notify({
          color: 'negative',
          message: 'Message content is required',
          icon: 'error',
          position: 'top'
        })
      }

      try {
        const sender = this.$store.getters['auth/user']._id

        if (!this.isNew) {
          await this.$feathersClient
            .service('broadcasts')
            .patch(this.$route.params.id, {
              content: this.content,
              sender,
              draft: this.saveType === 'draft'
            })
        } else {
          await this.$feathersClient
            .service('broadcasts')
            .create({
              messages: {
                type: 'text',
                content: this.content,
                sender,
                draft: this.saveType === 'draft'
              },
              flagFrom: 'broadcast'
            })
        }

        this.content = ''
        this.$router.push('/broadcasts')
      } catch (err) {
        console.error(err.message)

        this.$q.notify({
          color: 'negative',
          message: 'Something went wrong',
          icon: 'error',
          position: 'top'
        })
      }
    }
  }
}
</script>
