<template>
  <q-page padding>
    <div style="max-width: 1280px; margin: 0 auto;">
      <q-card>
        <q-card-section class="q-pa-lg">
          <q-form
            ref="form"
            @submit="onSubmit"
            class="q-gutter-md"
          >
            <div>
              <div class="q-field__label text-caption q-mb-xs">
                <strong>Time to send 1st reminder before job-expiry</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  ref="daysJobReminder"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobReminder.days"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  :rules="[
                    isJobReminder
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Days
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="hoursJobReminder"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobReminder.hours"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="23"
                  :rules="[
                    isHours,
                    isJobReminder
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Hours
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="minutesJobReminder"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobReminder.minutes"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="59"
                  :rules="[
                    isMinutes,
                    isJobReminder
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Minutes
                    </div>
                  </template>
                </q-input>
              </div>

              <q-checkbox
                v-model="allowMultipleReminder"
                color="red-10"
                label="Allow multiple reminder"
                :true-value="true"
                :false-value="false"
                style="margin-left: -10px;"
              />

              <div>
                <div class="q-field__label text-caption q-mb-xs">
                  <strong>Time to send multiple reminder after 1st reminder</strong>
                </div>
                <div class="row q-col-gutter-md q-mt-sm">
                  <q-input
                    ref="daysMultiReminderInterval"
                    dense
                    outlined
                    bottom-slots
                    v-model="multiReminderInterval.days"
                    type="number"
                    color="red-9"
                    class="col-lg-4 col-sm-5 col-xs-12"
                    :rules="[
                      isMultiReminderInterval
                    ]"
                  >
                    <template #before>
                      <div class="text-caption">
                        Days
                      </div>
                    </template>
                  </q-input>

                  <q-input
                    ref="hoursMultiReminderInterval"
                    dense
                    outlined
                    bottom-slots
                    v-model="multiReminderInterval.hours"
                    type="number"
                    color="red-9"
                    class="col-lg-4 col-sm-5 col-xs-12"
                    max="23"
                    :rules="[
                      isHours,
                      isMultiReminderInterval
                    ]"
                  >
                    <template #before>
                      <div class="text-caption">
                        Hours
                      </div>
                    </template>
                  </q-input>

                  <q-input
                    ref="minutesMultiReminderInterval"
                    dense
                    outlined
                    bottom-slots
                    v-model="multiReminderInterval.minutes"
                    type="number"
                    color="red-9"
                    class="col-lg-4 col-sm-5 col-xs-12"
                    max="59"
                    :rules="[
                      isMinutes,
                      isMultiReminderInterval
                    ]"
                  >
                    <template #before>
                      <div class="text-caption">
                        Minutes
                      </div>
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Time to cancel the job-expiry</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  ref="daysJobCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobCancel.days"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  :rules="[
                    isJobCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Days
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="hoursJobCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobCancel.hours"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="23"
                  :rules="[
                    isHours,
                    isJobCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Hours
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="minutesJobCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="jobCancel.minutes"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="59"
                  :rules="[
                    isMinutes,
                    isJobCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Minutes
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Grace to cancel the smartbooking job-expiry</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  ref="daysJobGraceCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="graceSb.days"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  :rules="[
                    isJobGraceCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Days
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="hoursJobGraceCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="graceSb.hours"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="23"
                  :rules="[
                    isHours,
                    isJobGraceCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Hours
                    </div>
                  </template>
                </q-input>

                <q-input
                  ref="minutesJobGraceCancel"
                  dense
                  outlined
                  bottom-slots
                  v-model="graceSb.minutes"
                  type="number"
                  color="red-9"
                  class="col-lg-4 col-sm-5 col-xs-12"
                  max="59"
                  :rules="[
                    isMinutes,
                    isJobGraceCancel
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Minutes
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Distance of each vehicle displacement</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  v-model="trackingDistance"
                  type="number"
                  color="red-9"
                  class="col-lg-3 col-sm-4 col-xs-12"
                  min="1"
                  :rules="[
                    val => !!val || 'Please type something',
                    isDistance
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Distance
                    </div>
                  </template>
                  <template #after>
                    <div class="text-caption">
                      Meters
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Tracking interval</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  type="number"
                  min="0"
                  v-model="trackingInterval"
                  color="red-9"
                  class="col-lg-3 col-sm-4 col-xs-12"
                  :rules="[
                    v => (!!v && v > 0) || 'Value must be greather than 0'
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Interval
                    </div>
                  </template>
                  <template #after>
                    <div class="text-caption">
                      Seconds
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Map auto refresh interval</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  type="number"
                  min="0"
                  v-model="mapAutoRefreshInterval"
                  color="red-9"
                  class="col-lg-3 col-sm-4 col-xs-12"
                  :rules="[
                    v => (!!v && v > 0) || 'Value must be greather than 0'
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Interval
                    </div>
                  </template>
                  <template #after>
                    <div class="text-caption">
                      Seconds
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Hide jobs in mobile app that are older than this number of days</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  type="number"
                  v-model="hideJob"
                  min="0"
                  color="red-9"
                  class="col-lg-2 col-sm-3 col-xs-12"
                  :rules="[
                    v => (!!v && v > 0) || 'Value must be greather than 0'
                  ]"
                >
                  <template #before>
                    <div
                      class="text-caption"
                      style="margin-right: 18px;"
                    >
                      Days
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Radius distance to check entry/exit depot</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  v-model="radiusDistance"
                  type="number"
                  color="red-9"
                  class="col-lg-3 col-sm-4 col-xs-12"
                  min="1"
                  :rules="[
                    val => !!val || 'Please type something',
                    isDistance
                  ]"
                >
                  <template #before>
                    <div class="text-caption">
                      Distance
                    </div>
                  </template>
                  <template #after>
                    <div class="text-caption">
                      Meters
                    </div>
                  </template>
                </q-input>
              </div>

              <div class="q-field__label text-caption q-mb-xs">
                <strong>Limit request failed</strong>
              </div>
              <div class="row q-col-gutter-md q-mt-sm">
                <q-input
                  dense
                  outlined
                  bottom-slots
                  v-model="limitRequestFailed"
                  type="number"
                  color="red-9"
                  class="col-lg-2 col-sm-3 col-xs-12"
                  min="1"
                  :rules="[
                    val => !!val || 'Please type something',
                    limitRequestFailed
                  ]"
                >
                  <template #after>
                    <div class="text-caption">
                      Request
                    </div>
                  </template>
                </q-input>
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
                v-if="$can('update', 'System Settings')"
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
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SystemSettings',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  components: {
  },
  data () {
    return {
      allowMultipleReminder: false,
      jobReminder: {
        days: 1,
        hours: 1,
        minutes: 1
      },
      jobCancel: {
        days: 1,
        hours: 1,
        minutes: 1
      },
      graceSb: {
        days: 1,
        hours: 1,
        minutes: 1
      },
      multiReminderInterval: {
        days: 1,
        hours: 0,
        minutes: 0
      },
      trackingDistance: 1,
      mapAutoRefreshInterval: 15,
      trackingInterval: 10,
      hideJob: 7,
      radiusDistance: 500,
      limitRequestFailed: 3
    }
  },
  created () {
    this.getSystemSettings()
  },
  methods: {
    async getSystemSettings () {
      this.$store.dispatch('settings/getSetting')
        .then(res => {
          if (res.total > 0) {
            this.jobReminder = res.data[0].jobReminder
            this.jobCancel = res.data[0].jobCancel
            this.graceSb = res.data[0].graceSb
            this.trackingDistance = res.data[0].trackingDistance
            this.allowMultipleReminder = res.data[0].allowMultipleReminder
            this.radiusDistance = res.data[0].radiusDistance
            if (res.data[0].hideJob) this.hideJob = res.data[0].hideJob
            if (res.data[0].multiReminderInterval) this.multiReminderInterval = res.data[0].multiReminderInterval
            if (res.data[0].mapAutoRefreshInterval) this.mapAutoRefreshInterval = res.data[0].mapAutoRefreshInterval
            if (res.data[0].trackingInterval) this.trackingInterval = res.data[0].trackingInterval / 1000
            if (res.data[0].limitRequestFailed) this.limitRequestFailed = res.data[0].limitRequestFailed
          }
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
    async onSubmit () {
      const jobReminder = this.jobReminder
      const jobCancel = this.jobCancel
      const graceSb = this.graceSb
      const trackingDistance = this.trackingDistance
      const multiReminderInterval = this.multiReminderInterval
      const allowMultipleReminder = this.allowMultipleReminder
      const { mapAutoRefreshInterval, trackingInterval } = this
      const hideJob = this.hideJob
      const radiusDistance = this.radiusDistance
      const limitRequestFailed = this.limitRequestFailed

      this.$store.dispatch('settings/manage', {
        jobReminder,
        jobCancel,
        graceSb,
        trackingDistance,
        multiReminderInterval,
        allowMultipleReminder,
        mapAutoRefreshInterval,
        trackingInterval: trackingInterval * 1000,
        hideJob,
        radiusDistance,
        limitRequestFailed
      })
        .then(res => {
          this.$q.notify({
            color: 'positive',
            message: 'System settings update successfully',
            icon: 'done',
            position: 'top'
          })
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to update System settings',
            icon: 'error',
            position: 'top'
          })
        })
    },
    isJobReminder () {
      if (this.jobReminder.days > 0 || this.jobReminder.hours > 0 || this.jobReminder.minutes > 0) {
        this.$refs.daysJobReminder.resetValidation()
        this.$refs.hoursJobReminder.resetValidation()
        this.$refs.minutesJobReminder.resetValidation()
        return true
      } else {
        return 'One of the field values ​​must be more than 0'
      }
    },
    isJobCancel () {
      if (this.jobCancel.days > 0 || this.jobCancel.hours > 0 || this.jobCancel.minutes > 0) {
        this.$refs.daysJobCancel.resetValidation()
        this.$refs.hoursJobCancel.resetValidation()
        this.$refs.minutesJobCancel.resetValidation()
        return true
      } else {
        return 'One of the field values ​​must be more than 0'
      }
    },
    isJobGraceCancel () {
      if (this.graceSb.days > 0 || this.graceSb.hours > 0 || this.graceSb.minutes > 0) {
        this.$refs.daysJobGraceCancel.resetValidation()
        this.$refs.hoursJobGraceCancel.resetValidation()
        this.$refs.minutesJobGraceCancel.resetValidation()
        return true
      } else {
        return 'One of the field values ​​must be more than 0'
      }
    },
    isMultiReminderInterval () {
      if (this.multiReminderInterval.days > 0 || this.multiReminderInterval.hours > 0 || this.multiReminderInterval.minutes > 0) {
        this.$refs.daysMultiReminderInterval.resetValidation()
        this.$refs.hoursMultiReminderInterval.resetValidation()
        this.$refs.minutesMultiReminderInterval.resetValidation()
        return true
      } else {
        return 'One of the field values ​​must be more than 0'
      }
    },
    isHours (val) {
      return (val > 23) ? 'Hours maximum value is 23' : true
    },
    isMinutes (val) {
      return (val > 59) ? 'Minutes maximum value is 59' : true
    },
    isDistance (val) {
      return (val < 1) ? 'Distance minimum value is 1' : true
    }
  }
}
</script>
