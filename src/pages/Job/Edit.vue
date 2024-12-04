<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        ref="form"
        class="q-gutter-md"
      >
        <q-input
          label="Container Number"
          v-model="form.containerNumber"
          color="red-9"
          @input="val => { form.containerNumber = val.toUpperCase() }"
          :rules="[val => ((val.length > 0 && !!val.trim()) || (val.length === 0 && originalData.containerNumber.length === 0)) || 'Please type something Container Number']"
        />

        <q-input
          label="Seal Number"
          v-model="form.sealNumber"
          color="red-9"
          @input="val => { form.sealNumber = val.toUpperCase() }"
          :rules="[val => ((val.length > 0 && !!val.trim()) || (val.length === 0 && originalData.sealNumber.length === 0)) || 'Please type something Seal Number']"
        />

        <q-input
          label="Trailer Number"
          v-model="form.trailerNumber"
          color="red-9"
          @input="val => { form.trailerNumber = val.toUpperCase() }"
          :rules="[val => ((val.length > 0 && !!val.trim()) || (val.length === 0 && originalData.trailerNumber.length === 0)) || 'Please type something Trailer Number']"
        />

        <q-input
          label="Tare Weight"
          v-model.number="form.weight"
          type="number"
          color="red-9"
          :rules="[val => val >= 0 || 'Please type something Tare Weight']"
        />

        <div class="text-right q-mt-lg">
          <q-btn
            label="Back"
            padding="sm lg"
            @click.prevent="$router.go(-1)"
            color="red-9"
            flat
          />

          <q-btn
            v-if="$can('update', 'Jobs')"
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
import { clone } from 'lodash'
import { mapActions } from 'vuex'
import mixin from '../../mixins/filter'

export default {
  name: 'JobsList',

  mixins: [mixin],

  data () {
    return {
      form: {
        containerNumber: '',
        sealNumber: '',
        trailerNumber: '',
        weight: ''
      },
      originalData: {
        containerNumber: '',
        sealNumber: '',
        trailerNumber: '',
        weight: ''
      },
      backUpData: {}
    }
  },

  async mounted () {
    this.getData()
  },

  methods: {
    ...mapActions('jobs', {
      getJobs: 'get',
      patchJobs: 'patch'
    }),
    async getData () {
      const data = await this.getJobs(this.$route.params.id)
      this.backUpData = clone(data)
      this.form.containerNumber = data.containerNumber ? clone(data.containerNumber) : ''
      this.form.sealNumber = data.sealNumber ? clone(data.sealNumber) : ''
      this.form.trailerNumber = data.trailerNumber ? clone(data.trailerNumber) : ''
      this.form.weight = data.weight ? clone(data.weight) : 0

      this.originalData.containerNumber = data.containerNumber ? clone(data.containerNumber) : ''
      this.originalData.sealNumber = data.sealNumber ? clone(data.sealNumber) : ''
      this.originalData.trailerNumber = data.trailerNumber ? clone(data.trailerNumber) : ''
      this.originalData.weight = data.weight ? clone(data.weight) : 0
    },
    onSubmit () {
      const sendData = {}
      if (this.backUpData.containerNumber !== this.form.containerNumber) sendData.containerNumber = this.form.containerNumber
      if (this.backUpData.sealNumber !== this.form.sealNumber) sendData.sealNumber = this.form.sealNumber
      if (this.backUpData.trailerNumber !== this.form.trailerNumber) sendData.trailerNumber = this.form.trailerNumber
      if (this.backUpData.weight !== this.form.weight) sendData.weight = this.form.weight

      if (Object.keys(sendData).length > 0) {
        this.patchJobs([this.$route.params.id, sendData])
          .then(res => {
            console.log('respon', res)
            this.$q.notify({
              color: 'positive',
              message: 'job updated successfully',
              icon: 'done',
              position: 'top'
            })

            this.$router.push('/jobs')
          })
      } else {
        this.$router.push('/jobs')
      }
    }
  }
}
</script>
