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
              color="red-8"
              lazy-rules
              type="number"
              @input="$v.form.licenseNo.$touch()"
              :rules="[
                val => $v.form.licenseNo.required || 'Please type something',
              ]"
            />
            <q-input
              @change="updateSomething"
              mask="date"
              label="Licence End Date"
              color="red-8"
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
// import { date } from 'quasar'

// const timeStamp = Date.now()
// const formattedDate = date.formatDate(timeStamp, 'YYYY-MM-DD')

export default {
  name: 'AddCompanySubs',
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
        this.$store.dispatch('companysubs/storeCompanySubs', { form: this.form })
      }
    },
    onCancel () {
      this.$router.go(-1)
    },
    updateSomething (val) {
      this.form.endDate = val
    },
    getListCompanies () {
      this.$store.dispatch('companies/getCompaniesData', {}).then(res => {
        this.optionCompanies = res.data
      })
    },
    getListLicences () {
      this.$store.dispatch('licensetype/getActiveLicenseType').then(res => {
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
    this.getListCompanies()
    this.getListLicences()
  }
}
</script>
