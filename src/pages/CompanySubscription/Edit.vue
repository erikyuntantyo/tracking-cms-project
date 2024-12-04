<template>
  <q-card>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        class="q-gutter-sm"
      >
        <div class="row">
          <div class="col">
            <q-select
              use-input
              clearable
              lazy-rules
              emit-value
              map-options
              :options="optionCompanies"
              :rules="[
                val => $v.form.company.required || 'Please choose something'
              ]"
              @filter="onFilterCompanies"
              @input="$emit('update:company', $event)"
              v-model="$v.form.company.$model"
              label="Company Name *"
              color="red-8"
            />
            <q-select
              v-model="$v.form.license.$model"
              :options="optionLicences"
              :option-value="opt => Object(opt) === opt && '_id' in opt ? opt._id : null"
              :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : null"
              label="Licence Type *"
              color="red-8"
              clearable
              lazy-rules
              emit-value
              map-options
              :rules="[
                val => $v.form.license.required || 'Please choose something'
              ]"
            />
            <q-input
              v-model="$v.form.licenseNo.$model"
              label="Vehicle Limit *"
              lazy-rules
              color="red-8"
              type="number"
              @input="$v.form.licenseNo.$touch()"
              :rules="[
                val => $v.form.licenseNo.required || 'Please type something',
              ]"
            />
            <q-input
              @change="updateSomething"
              mask="date"
              color="red-8"
              label="Licence End Date"
              :rules="['date']"
              :value="form.endDate"
            >
              <template #append>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                >
                  <q-popup-proxy>
                    <q-date
                      color="red-9"
                      v-model="form.endDate"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <div class="text-right q-mt-lg">
          <q-btn
            label="Back"
            type="button"
            color="red-9"
            flat
            class="q-ml-sm"
            @click="onCancel"
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
import { required } from 'vuelidate/lib/validators'
import mixin from '../../mixins/filter'

export default {
  name: 'EditCompanySubs',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  data () {
    return {
      form: {
        company: '',
        license: '',
        licenseNo: '',
        endDate: ''
        // endDate: formattedDate
      },
      optionCompanies: [],
      optionLicences: []
    }
  },
  validations: {
    form: {
      company: { required },
      license: { required },
      licenseNo: { required }
    }
  },
  mixins: [mixin],
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Please review fields again.')
      } else {
        this.form.module = 'companySubscriptions'
        if (typeof this.form.company === 'object') this.form.company = this.form.company.value
        this.$store.dispatch('companysubs/updateCompanySubs', { id: this.$route.params.id, form: this.form })
      }
    },
    onCancel () {
      this.$router.go(-1)
    },
    updateSomething (val) {
      this.form.endDate = val
    },
    getDetail () {
      this.$store.dispatch('companysubs/getDetailCompanySubs', { id: this.$route.params.id }).then(res => {
        if (res.company) {
          this.$store.dispatch('groups/get', [res.company, { query: { level: 2 } }])
            .then(({ _id, name }) => (this.form.company = { label: name, value: _id }))
            .catch('')
        }
        this.form.license = res.license
        this.form.licenseNo = res.licenseNo
        this.form.endDate = this.$moment(res.endDate).format('YYYY/MM/DD')
      })
    },
    getListCompanies () {
      this.$store.dispatch('companies/getCompaniesData', {}).then(res => {
        this.optionCompanies = res.data
      })
    },
    getListLicences () {
      this.$store.dispatch('licensetype/getLicenseTypeData').then(res => {
        this.optionLicences = res.data
      })
    },
    async onFilterCompanies (val, update) {
      const companyQuery = await this.filterCompany()

      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        ...companyQuery,
        $select: ['_id', 'name']
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.optionCompanies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    }
  },
  mounted () {
    this.getDetail()
    this.getListCompanies()
    this.getListLicences()
  }
}
</script>
