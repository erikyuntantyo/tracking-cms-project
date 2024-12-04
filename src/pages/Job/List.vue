<template>
  <div>
    <filter-input
      :trip-id.sync="filter.tripId"
      :booking-n.sync="filter.bookingN"
      :container-number.sync="filter.containerNumber"
      :ucr-n.sync="filter.ucrN"
      :seal-number.sync="filter.sealNumber"
      :trailer-number.sync="filter.trailerNumber"
      :type-size.sync="filter.typeSize"
      :truck-number.sync="filter.truckNumber"
      :job-type.sync="filter.jobType"
      :depot-name.sync="filter.depotName"
      :job-status.sync="filter.jobStatus"
      :company.sync="filter.company"
      :created-at.sync="filter.createdAt"
      :job-start-date.sync="filter.jobStartDate"
      :job-end-date.sync="filter.jobEndDate"
      class="q-mb-sm"
    />

    <q-table
      :columns="columns"
      :data="data"
      row-key="_id"
      :loading="loading"
      @request="onRequest"
      :filter="filter"
      :pagination.sync="pagination"
      :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
      :visible-columns="visibleColumns"
      class="my-sticky-header-table table-height"
    >
      <template #body-cell-action="row">
        <td class="text-center">
          <q-btn
            flat
            round
            icon="remove_red_eye"
            @click="detailJob(row.row)"
          >
            <q-tooltip>Detail</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="$router.push(`/jobs/edit/${row.row._id}`)"
            v-if="['in progress', 'start pickup', 'completed pickup', 'start delivery', 'completed delivery'].includes(row.row.jobStatus) && $can('update', 'Jobs')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <span
            class="q-pl-md"
            v-if="['new', 'in progress', 'start pickup', 'completed pickup', 'start delivery', 'completed delivery'].includes(row.row.jobStatus) && $can('update', 'Jobs')"
          >
            <q-btn
              color="negative"
              label="Reject"
              @click="patchingJob(row.row._id, 'rejected')"
            />
          </span>
        </td>
      </template>

      <template #top>
        <div class="row">
          <div class="q-gutter-sm row">
            <q-btn
              padding="sm md"
              outline
              label="Refresh"
              @click="onRequest({ pagination })"
            />
            <q-btn
              v-if="enableSBButton"
              padding="sm md"
              outline
              label="get depot bookings"
              @click="pullBookings()"
            />
          </div>
          <div
            v-if="$q.screen.gt.xs"
            class="col-12"
          >
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="action"
              label="Action"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="tripId"
              label="Trip Id"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="bookingN"
              label="Booking Id"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="containerNumber"
              label="Cntr No"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="ucrN"
              label="UCR No"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="sealNumber"
              label="Seal No"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="trailerNumber"
              label="Trailer No"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="typeSize"
              label="Type size"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="truckNumber"
              label="Veh No"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="jobType"
              label="Job Type"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="depotName"
              label="Depot"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="jobStatus"
              label="Status"
            />
            <q-toggle
              v-if="cdasAdmin"
              v-model="visibleColumns"
              color="red"
              val="company"
              label="Company"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="createdAt"
              label="Date created"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="jobStartDate"
              label="Start Time"
            />
            <q-toggle
              v-model="visibleColumns"
              color="red"
              val="jobEndDate"
              label="End Time"
            />
          </div>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="dialogDetail">
      <!-- Detail for Smart Bookings -->
      <q-card
        style="max-width: 1200px;width: 700px;height: auto;"
        v-if="forSb"
      >
        <q-card-section>
          <div class="text-h6 text-center">
            {{ detail.jobType }} {{ (detail.bookingN) ? detail.bookingN : '' }} {{ detail.typeSize }}
          </div>
          <div class="text-h6 text-center">
            {{ detail.truckNumber }}
          </div>
          <div
            class="text-center"
            style="margin-top: 10px;"
          >
            {{ changeFormatDateTime(detail.createdAt) }}
          </div>
          <q-space />
          <q-btn
            class="absolute-right"
            icon="close"
            flat
            v-close-popup
          />
        </q-card-section>
        <q-card-section>
          <div class="row fit">
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="120px">
                    <strong>Status</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>
                    <span
                      v-if="detail.jobStatus"
                      :class="'font-status-' + detail.jobStatus.replace(/\s+/g, '-')"
                    >
                      {{ detail.jobStatus === 'in progress' ? 'Started' : detail.jobStatus }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td width="120px">
                    <strong>Booking No</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ detail.bookingN }}</td>
                </tr>
                <tr>
                  <td width="120px">
                    <strong>UCR No</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ detail.ucrN }}</td>
                </tr>
                <tr>
                  <td width="120px">
                    <strong>Container No</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ (!detail.containerNumber) ? detail.batchNumber : detail.containerNumber }}</td>
                </tr>

                <!-- OLD display -->
                <tr class="hidden">
                  <td width="120px">
                    <strong>Trip Id</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ detail.tripId }}</td>
                </tr>
                <tr class="hidden">
                  <td><strong>Weight</strong></td>
                  <td>:</td>
                  <td>{{ detail.weight }}</td>
                </tr>
                <tr class="hidden">
                  <td><strong>Survey</strong></td>
                  <td>:</td>
                  <td>
                    <q-icon
                      v-if="!detail.survey"
                      name="remove_circle"
                      size="sm"
                      color="red"
                    />
                    <q-icon
                      v-if="detail.survey === 'YES'"
                      name="check_circle"
                      size="sm"
                      color="green"
                    />
                    <q-icon
                      v-if="detail.survey === 'NO'"
                      name="cancel"
                      size="sm"
                      color="purple"
                    />
                  </td>
                </tr>
                <tr class="hidden">
                  <td><strong>TT Timing</strong></td>
                  <td>:</td>
                  <td>
                    {{ detail.tt || '-' }}
                  </td>
                </tr>
              </table>
            </div>
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="120px">
                    <strong>Depot</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ detail.depotName }}</td>
                </tr>
                <tr>
                  <td width="120px">
                    <strong>Booking Start</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ formatDate(detail.bookingSlotStartDt) }}</td>
                </tr>
                <tr>
                  <td width="120px">
                    <strong>Booking End</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ formatDate(detail.bookingSlotEndDt) }}</td>
                </tr>

                <!-- OLD datas -->
                <tr class="hidden">
                  <td width="180px">
                    <strong>PSA Location</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ (detail.psaLocation) ? detail.psaLocation : '-' }}</td>
                </tr>
                <tr
                  class="hidden"
                  v-if="detail.pickupLocation"
                >
                  <td><strong>Pickup Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.pickupLocation }}</td>
                </tr>
                <tr
                  class="hidden"
                  v-if="detail.deliveryLocation"
                >
                  <td><strong>Destination Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.deliveryLocation }}</td>
                </tr>
                <tr
                  class="hidden"
                  v-if="detail.psaInstruction"
                >
                  <td style="color: red;">
                    <strong>PSA Instruction</strong>
                  </td>
                  <td>:</td>
                  <td>{{ detail.psaInstruction }}</td>
                </tr>
              </table>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="col">
            <div class="text-h6 text-center">
              Assigned Vehicle Histories
            </div>
            <q-table
              :columns="columns_detail"
              :data="detail.logVehicleN"
              :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Detail for OET -->
      <q-card
        style="max-width: 1200px;width: 700px;height: auto;"
        v-else-if="detail.source === 'OET' && !detail.area_id"
      >
        <q-card-section>
          <div class="text-h6 text-center">
            {{ detail.jobType }} {{ detail.tripId }}
          </div>
          <div class="text-h6 text-center">
            {{ detail.truckNumber }}
          </div>
          <div
            class="text-center"
            style="margin-top: 10px;"
          >
            {{ changeFormatDateTime(detail.createdAt) }}
          </div>
          <q-space />
          <q-btn
            class="absolute-right"
            icon="close"
            flat
            v-close-popup
          />
        </q-card-section>
        <q-card-section>
          <div class="row fit">
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="180px">
                    <strong>Status</strong>
                  </td>
                  <td width="20px">
                    :
                  </td>
                  <td>
                    <span
                      v-if="detail.jobStatus"
                      :class="'font-status-' + detail.jobStatus.replace(/\s+/g, '-')"
                    >
                      {{ detail.jobStatus === 'in progress' ? 'Started' : detail.jobStatus }}
                    </span>
                  </td>
                </tr>
                <tr v-if="detail.pickupLocation">
                  <td><strong>Pickup Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.pickupLocation }}</td>
                </tr>
                <tr v-if="detail.deliveryLocation">
                  <td><strong>Destination Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.deliveryLocation }}</td>
                </tr>
                <tr v-if="detail.workOrder">
                  <td><strong>Order No</strong></td>
                  <td>:</td>
                  <td>{{ detail.workOrder }}</td>
                </tr>
                <tr v-if="detail.weight">
                  <td><strong>Tare Weight</strong></td>
                  <td>:</td>
                  <td>{{ detail.weight }}</td>
                </tr>
                <tr v-if="detail.ucrN">
                  <td><strong>Release No</strong></td>
                  <td>:</td>
                  <td>{{ detail.ucrN }}</td>
                </tr>
                <tr v-if="detail.vesselM">
                  <td><strong>Vessel</strong></td>
                  <td>:</td>
                  <td>{{ detail.vesselM }}</td>
                </tr>
                <tr v-if="detail.containerRemark">
                  <td><strong>Container Remark</strong></td>
                  <td>:</td>
                  <td>{{ detail.containerRemark }}</td>
                </tr>
              </table>
            </div>
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="180px">
                    <strong>Container No</strong>
                  </td>
                  <td width="20px">
                    :
                  </td>
                  <td>{{ (detail.containerNumber) ? detail.containerNumber : '-' }}</td>
                </tr>
                <tr>
                  <td><strong>Seal Number</strong></td>
                  <td>:</td>
                  <td>{{ detail.sealNumber ? detail.sealNumber : '-' }}</td>
                </tr>
                <tr>
                  <td><strong>Trailer Number</strong></td>
                  <td>:</td>
                  <td>{{ detail.trailerNumber ? detail.trailerNumber : '-' }}</td>
                </tr>
                <tr v-if="detail.voyageN">
                  <td><strong>Voyage</strong></td>
                  <td>:</td>
                  <td>{{ detail.voyageN }}</td>
                </tr>
                <tr v-if="detail.typeSize">
                  <td><strong>ISO code</strong></td>
                  <td>:</td>
                  <td>{{ detail.typeSize }}</td>
                </tr>
                <tr v-if="detail.totalCntrQty">
                  <td><strong>Total Container</strong></td>
                  <td>:</td>
                  <td>{{ detail.totalCntrQty }}</td>
                </tr>
                <tr v-if="detail.pickupAddress">
                  <td><strong>Pickup Address</strong></td>
                  <td>:</td>
                  <td>{{ detail.pickupAddress }}</td>
                </tr>
                <tr v-if="detail.deliveryAddress">
                  <td><strong>Delivery Address</strong></td>
                  <td>:</td>
                  <td>{{ detail.deliveryAddress }}</td>
                </tr>
                <tr v-if="detail.laden">
                  <td><strong>Laden</strong></td>
                  <td>:</td>
                  <td>{{ detail.laden }}</td>
                </tr>
              </table>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Detail for Portnet -->
      <q-card
        style="max-width: 1200px;width: 700px;height: auto;"
        v-else
      >
        <q-card-section>
          <div class="text-h6 text-center">
            {{ detail.jobType }} {{ (!detail.containerNumber) ? detail.batchNumber : detail.containerNumber }} {{ detail.typeSize }}
          </div>
          <div class="text-h6 text-center">
            {{ detail.truckNumber }}
          </div>
          <div
            class="text-center"
            style="margin-top: 10px;"
          >
            {{ changeFormatDateTime(detail.createdAt) }}
          </div>
          <q-space />
          <q-btn
            class="absolute-right"
            icon="close"
            flat
            v-close-popup
          />
        </q-card-section>
        <q-card-section>
          <div class="row fit">
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="120px">
                    <strong>Status</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>
                    <span
                      v-if="detail.jobStatus"
                      :class="'font-status-' + detail.jobStatus.replace(/\s+/g, '-')"
                    >
                      {{ detail.jobStatus === 'in progress' ? 'Started' : detail.jobStatus }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Weight</strong></td>
                  <td>:</td>
                  <td>{{ detail.weight }}</td>
                </tr>
                <tr>
                  <td><strong>Survey</strong></td>
                  <td>:</td>
                  <td>
                    <q-icon
                      v-if="!detail.survey"
                      name="remove_circle"
                      size="sm"
                      color="red"
                    />
                    <q-icon
                      v-if="detail.survey === 'YES'"
                      name="check_circle"
                      size="sm"
                      color="green"
                    />
                    <q-icon
                      v-if="detail.survey === 'NO'"
                      name="cancel"
                      size="sm"
                      color="purple"
                    />
                  </td>
                </tr>
                <tr>
                  <td><strong>TT Timing</strong></td>
                  <td>:</td>
                  <td>
                    {{ detail.tt || '-' }}
                  </td>
                </tr>
              </table>
            </div>
            <div class="col">
              <table class="table-job-detail">
                <tr>
                  <td width="180px">
                    <strong>PSA Location</strong>
                  </td>
                  <td width="40px">
                    :
                  </td>
                  <td>{{ (detail.psaLocation) ? detail.psaLocation : '-' }}</td>
                </tr>
                <tr v-if="detail.pickupLocation">
                  <td><strong>Pickup Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.pickupLocation }}</td>
                </tr>
                <tr v-if="detail.deliveryLocation">
                  <td><strong>Destination Location</strong></td>
                  <td>:</td>
                  <td>{{ detail.deliveryLocation }}</td>
                </tr>
                <tr v-if="detail.psaInstruction">
                  <td style="color: red;">
                    <strong>PSA Instruction</strong>
                  </td>
                  <td>:</td>
                  <td>{{ detail.psaInstruction }}</td>
                </tr>
              </table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="chooseCompany"
    >
      <q-card style="width: 700px;">
        <q-card-section>
          <div class="text-h6">
            Select a company to get depot bookings
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            outlined
            dense
            label="Company"
            v-model="companySelected"
            :options="optionCompany"
            @filter="onFilterCompanies"
            use-input
            clearable
            color="red-9"
            class="col-4"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
            <!-- <q-tooltip class="bg-red text-white">
              Some text as content of Tooltip
            </q-tooltip> -->
          </q-select>
        </q-card-section>

        <q-card-actions
          align="right"
          class="bg-white text-teal"
        >
          <q-btn
            flat
            padding="sm lg"
            color="red-9"
            label="Cancel"
            v-close-popup
          />
          <q-btn
            padding="sm lg"
            unelevated
            color="red-9"
            text-color="red-1"
            label="OK"
            @click="pullBookings"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import mixin from '../../mixins/filter'
import FilterInput from './FilterInput'
import _ from 'lodash'

export default {
  name: 'JobsList',

  components: {
    FilterInput
  },

  mixins: [mixin],

  data () {
    return {
      dialogDetail: false,
      detail: {
        jobType: '',
        containerNumber: '',
        batchNumber: '',
        typeSize: '',
        truckNumber: '',
        tripId: ''
      },
      filter: {
        containerNumber: '',
        company: null,
        tripId: '',
        typeSize: '',
        truckNumber: '',
        jobType: '',
        jobStatus: { label: 'New', value: 'new' },
        createdAt: null,
        jobStartDate: null,
        jobEndDate: null
      },
      visibleColumns: [
        'action',
        'tripId',
        'containerNumber',
        'typeSize',
        'truckNumber',
        'jobType',
        'jobStatus',
        'company',
        'createdAt',
        'jobStartDate', // new
        'jobEndDate' // new
      ],
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'tripId', field: 'tripId', label: 'Trip Id', align: 'left', sortable: true },
        { name: 'bookingN', field: 'bookingN', label: 'Booking Id', align: 'left', sortable: true },
        { name: 'containerNumber', field: row => (!row.containerNumber) ? row.batchNumber : row.containerNumber, label: 'Cntr No', align: 'left', sortable: true },
        { name: 'ucrN', field: 'ucrN', label: 'UCR No', align: 'left', sortable: true },
        { name: 'sealNumber', field: 'sealNumber', label: 'Seal No', align: 'left', sortable: true },
        { name: 'trailerNumber', field: 'trailerNumber', label: 'Trailer No', align: 'left', sortable: true },
        { name: 'typeSize', field: 'typeSize', label: 'Type size', align: 'left', sortable: true },
        { name: 'truckNumber', field: 'truckNumber', label: 'Veh No', align: 'left', sortable: true },
        { name: 'jobType', field: row => row.jobType ? row.jobType : '-', label: 'Job Type', align: 'center', sortable: true },
        { name: 'depotName', field: 'depotName', label: 'Depot', align: 'left', sortable: true },
        { name: 'jobStatus', field: 'jobStatus', label: 'Status', align: 'left', sortable: true },
        // { name: 'company', field: this.companyField, label: 'Company', align: 'left' },
        { name: 'createdAt', field: row => this.createdAtField(row), label: 'Date created', align: 'left', sortable: true },
        { name: 'jobStartDate', field: row => row.jobStartDate ? this.formatDate(row.jobStartDate) : this.checkMultipleTripId(row.tripId, row.jobType), label: 'Start time', align: 'center', sortable: true },
        { name: 'jobEndDate', field: row => this.formatDate(row.jobEndDate), label: 'End time', align: 'center', sortable: true }
        // { name: 'company', field: this.companyField, label: 'Company', align: 'left' }
      ],
      columns_detail: [
        { name: 'assignAt', field: row => this.formatDate(row.assignAt), label: 'Assigned At', align: 'left', sortable: true },
        { name: 'vehicleN', field: 'vehicleN', label: 'Vehicle', align: 'left', sortable: true }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'updatedAt',
        descending: true,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false,
      chooseCompany: false,
      companySelected: '',
      optionCompany: [],
      cdasAdmin: false,
      user: {
        company: ''
      },
      forSb: false,
      enableSBButton: false
    }
  },

  async created () {
    await this.onRequest({
      pagination: this.pagination
    })

    this.enableSBButton = process.env.SHOW_SB_BUTTON[process.env.NODE_ENV]
  },
  async mounted () {
    const isCdas = await this.isCdas()

    if (isCdas) {
      this.columns.splice(12, 0, { name: 'company', field: this.companyField, label: 'Company', align: 'left' })
      this.cdasAdmin = isCdas
    }

    await this.userInfo()
  },
  sockets: {
    async 'jobs created' (data) {
      this.onRequest({
        pagination: this.pagination
      })
      this.$q.notify({
        color: 'positive',
        message: 'New Job Created',
        position: 'top'
      })
    },
    async 'jobs patched' (data) {
      this.onRequest({
        pagination: this.pagination
      })
      this.$q.notify({
        color: 'positive',
        message: 'Job Updated',
        position: 'top'
      })
    },
    async 'jobs removed' (data) {
      this.onRequest({
        pagination: this.pagination
      })
      this.$q.notify({
        color: 'positive',
        message: 'Job Updated',
        position: 'top'
      })
    }
  },
  methods: {
    ...mapActions('jobs', {
      findJobs: 'find',
      patchJob: 'patch'
    }),

    ...mapGetters({
      getAuthUser: 'auth/user'
    }),

    ...mapActions('roles-acl', {
      getRole: 'get'
    }),

    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()
      const organizationQuery = await this.filterForJob()

      this.findJobs({
        query: {
          $populate: ['company'],
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          ...organizationQuery,
          ...filterParams
        }
      })
        .then(async res => {
          this.loading = false

          this.data = res.data
          this.pagination = pagination
          this.pagination.rowsNumber = res.total
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to fetch data',
            icon: 'error',
            position: 'top'
          })
        })
    },
    changeFormatDateTime (datetime) {
      return this.$moment(datetime).format('YYYY-MM-DD HH:mm')
    },
    createdAtField (row) {
      return this.$moment(row.createdAt).format('YYYY-MM-DD HH:mm')
    },
    formatDate (date) {
      const dateReturn = (date) ? this.$moment(date).format('YYYY-MM-DD HH:mm') : '-'
      return dateReturn
    },
    companyField (row) {
      return (row.company && row.company.name) || ''
    },
    async getFilterValue () {
      const string = ['tripId', 'containerNumber', 'typeSize', 'truckNumber', 'jobType', 'bookingN', 'ucrN', 'sealNumber', 'trailerNumber', 'depotName']
      const options = ['company', 'jobStatus']
      const dateFields = ['createdAt', 'jobStartDate', 'jobEndDate']
      const filter = {}
      const user = this.getAuthUser()
      const userRoles = process.env.USER_ROLES[process.env.NODE_ENV]

      await string.map(v => {
        if (this.filter[v]) {
          if ((user.roleAcl === userRoles.transporterDriver) && v === 'truckNumber') {
            const vehicleNo = this.getVehicleDriver()

            filter.$and = [
              { truckNumber: { $regex: this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
              { truckNumber: vehicleNo }
            ]
          } else if (v === 'containerNumber') {
            filter.$or = [
              { containerNumber: { $regex: this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
              { batchNumber: { $regex: this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
            ]
          } else {
            filter[v] = { $regex: this.filter[v].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
          }
        }
      })

      await options.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v].value
      })

      await dateFields.map(v => {
        if (this.filter[v]) {
          typeof this.filter[v] === 'string'
            ? filter[v] = { $gte: this.$moment(this.filter[v], 'DD/MM/YYYY').startOf('day').toDate(), $lte: this.$moment(this.filter[v], 'DD/MM/YYYY').endOf('day').toDate() }
            : filter[v] = { $gte: this.$moment(this.filter[v].from, 'DD/MM/YYYY').startOf('day').toDate(), $lte: this.$moment(this.filter[v].to, 'DD/MM/YYYY').endOf('day').toDate() }
        }
      })

      if (filter.jobStartDate && filter.jobEndDate) {
        filter.$or = [
          { jobStartDate: filter.jobStartDate },
          { jobEndDate: filter.jobEndDate }
        ]
        delete filter.jobStartDate
        delete filter.jobEndDate
      }

      return filter
    },
    detailJob (row) {
      this.dialogDetail = true
      this.forSb = row.jobType === 'DC' || row.jobType === 'DR'
      row.jobType = (row.jobType) ? row.jobType : '-'
      this.detail = row
    },

    async isCdas () {
      return this.getAuthUser().group === undefined
    },
    onFilterCompanies (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2
      }

      this.$store.dispatch('groups/find', { paginate: false, query })
        .then(({ data }) => {
          update(() => {
            this.optionCompany = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    async userInfo () {
      this.user = this.getAuthUser()
      this.cdasAdmin = await this.getStatusAdmin()
    },
    async pullBookings () {
      if (!this.cdasAdmin) {
        this.cdasAdmin = await this.getStatusAdmin()
      }

      let companyId = (this.user.company) ? this.user.company : ''

      if (this.cdasAdmin) {
        (this.chooseCompany) ? this.chooseCompany = false : this.chooseCompany = true

        companyId = this.companySelected.value
      }

      if ((this.cdasAdmin && !this.chooseCompany) || !this.cdasAdmin) {
        this.$axios.post('/sb-bookings', null, {
          params: {
            company: companyId
          }
        }).then(res => {
          const data = res.data

          if (data.success && (data.bookings.length > 0)) {
            this.$q.notify({
              color: 'positive',
              message: 'Pulling data Success',
              position: 'top'
            })
            this.filter.company = this.companySelected

            const pagination = this.pagination

            this.onRequest({ pagination })

            // value reset process
            this.companySelected = ''
          } else {
            this.$q.notify({
              color: 'negative',
              message: 'No new booking data',
              icon: 'error',
              position: 'top'
            })

            // value reset process
            this.companySelected = ''
          }
        }).catch(err => {
          this.$q.notify({
            color: 'negative',
            message: `Pulling data ${err}`,
            icon: 'error',
            position: 'top'
          })

          // value reset process
          this.companySelected = ''
        })
      }
    },
    patchingJob (idJobProcess, status) {
      this.patchJob([idJobProcess, {
        jobStatus: status
      }]).then(res => {
        this.$q.notify({
          color: 'positive',
          message: `Success Job ${(status === 'rejected') ? 'Rejected' : 'Completed'}`,
          position: 'top'
        })

        const pagination = this.pagination

        this.onRequest({ pagination })
      }).catch(err => {
        if (err) {
          this.$q.notify({
            message: err.message,
            icon: 'error',
            color: 'negative'
          })
        } else {
          this.$q.notify({
            message: 'There was an error completed the job. If this issue persists, contact support.',
            icon: 'error',
            color: 'negative'
          })
        }
      })
    },
    async getStatusAdmin () {
      const user = this.user
      const roleAcl = user.roleAcl._id ? user.roleAcl : await this.getRole(this.user.roleAcl)

      return roleAcl.forCdas
    },
    checkMultipleTripId (ids, type) {
      let response = '-'
      if (!ids) return response
      const multipleDatas = _.filter(this.data, { tripId: ids, jobType: type })

      if (multipleDatas.length > 1) {
        response = _.find(multipleDatas, 'jobStartDate')
        response = (response) ? this.formatDate(response.jobStartDate) : '-'
      }

      return response
    }
  }
}
</script>
<style>
  .font-status-new,
  .font-status-cancel,
  .font-status-widrawn,
  .font-status-rejected,
  .font-status-not-dispatched {
    color: red;
    font-weight: bold;
    text-transform: capitalize;
  }

  .font-status-completed {
    color: green;
    font-weight: bold;
    text-transform: capitalize;
  }

  .font-status-in-progress,
  .font-status-start-pickup,
  .font-status-completed-pickup,
  .font-status-start-delivery,
  .font-status-completed-delivery {
    color: orange;
    font-weight: bold;
    text-transform: capitalize;
  }
</style>
