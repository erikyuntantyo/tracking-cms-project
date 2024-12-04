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
              v-model="$v.form.subscriptions.company.$model"
              :options="optionCompanies"
              :option-value="opt => Object(opt) === opt && '_id' in opt ? opt._id : null"
              :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : null"
              label="Company Name *"
              readonly
              lazy-rules
              emit-value
              map-options
              :rules="[
                val => $v.form.subscriptions.company.required || 'Please choose something'
              ]"
            />
            <q-select
              v-model="$v.form.subscriptions.license.$model"
              :options="optionLicences"
              :option-value="opt => Object(opt) === opt && '_id' in opt ? opt._id : null"
              :option-label="opt => Object(opt) === opt && 'name' in opt ? opt.name : null"
              label="Licence Type *"
              readonly
              lazy-rules
              emit-value
              map-options
              :rules="[
                val => $v.form.subscriptions.license.required || 'Please choose something'
              ]"
            />
            <el-transfer
              filterable
              :filter-method="filterMethod"
              filter-placeholder="Choose Vehicle"
              v-model="value"
              :data="data"
              :titles="['Unassigned Vehicles', 'Assigned Vehicles']"
            />
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
        subscriptions: {
          _id: '',
          company: '',
          license: '',
          licenseNo: '',
          endDate: ''
        },
        vehicles: []
      },
      optionCompanies: [],
      optionLicences: [],
      data: [],
      value: []
    }
  },
  validations: {
    form: {
      subscriptions: {
        company: { required },
        license: { required },
        licenseNo: { required }
      }
    }
  },
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (this.$v.form.$error) {
        this.$q.notify('Please review fields again.')
      } else {
        this.form.vehicles = []
        const mappingData = this.data.map(function (item) { return item.key })
        const portNetFalse = mappingData.filter(x => !this.value.includes(x))
        const portNetTrue = this.value
        portNetTrue.forEach((vehicle, index) => {
          this.form.vehicles.push({
            _id: vehicle,
            portNet: true
          })
        })
        portNetFalse.forEach((vehicle, index) => {
          this.form.vehicles.push({
            _id: vehicle,
            portNet: false
          })
        })
        this.$store.dispatch('vehiclesubs/updateVehicleSubs', { form: this.form })
      }
    },
    onCancel () {
      this.$router.go(-1)
    },
    getDetail () {
      this.$store.dispatch('companysubs/getDetailCompanySubs', { id: this.$route.params.id }).then(res => {
        this.form.subscriptions._id = res._id
        this.form.subscriptions.company = res.company
        this.form.subscriptions.license = res.license
        this.form.subscriptions.licenseNo = res.licenseNo
        this.form.subscriptions.endDate = res.endDate
        this.getListVehicle(res.company, res.license)
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
    filterMethod (query, item) {
      return item.initial.toLowerCase().indexOf(query.toLowerCase()) > -1
    },
    getListVehicle (companyId, licenseId) {
      this.$store.dispatch('vehicle/getVehicleForSubscription', {
        company: companyId,
        license: licenseId
      }).then(res => {
        res.forEach((vehicle, index) => {
          this.data.push({
            label: vehicle.vehicleNo,
            key: vehicle._id,
            initial: vehicle.vehicleNo
          })
          if (vehicle.licenseList) {
            vehicle.licenseList.forEach((v) => {
              if (v.idLicense === licenseId) {
                if (v.portNet === true) {
                  this.value.push(vehicle._id)
                }
              }
            })
          }
        })
      })
    },
    manageTransfer () {
      this.states.forEach((city, index) => {
        this.data.push({
          label: city,
          key: this.initials[index],
          initial: this.initials[index]
        })
      })
      this.value = ['IL', 'MD']
    }
  },
  mounted () {
    this.getDetail()
    this.getListCompanies()
    this.getListLicences()
    // this.manageTransfer()
  }
}
</script>
<style scoped>
.col >>> [class*="el-transfer-panel"] {
  width: 250px;
}

.col >>> [class*="el-button--primary"] {
  background-color: #b71c1c !important;
  border-color: #c62828 !important;
}

.col >>> .is-checked [class*="el-checkbox__inner"] {
  background-color: #b71c1c !important;
  border-color: #c62828 !important;
}

.col >>> [class*="el-checkbox__input"].is-indeterminate span[class*="el-checkbox__inner"] {
  background-color: #b71c1c !important;
  border-color: #c62828 !important;
}

.col >>> [class*="el-checkbox__input"].is-checked + [class*="el-checkbox__label"] {
  color: #b71c1c !important;
}

.col >>> [class*="el-transfer-panel__item"]:hover {
  color: #b71c1c !important;
}

.col >>> [class*="el-checkbox__inner"]:hover {
  border-color: #b71c1c !important;
}

.col >>> [class*="el-input__inner"]:focus {
  border-color: #b71c1c !important;
}
</style>
