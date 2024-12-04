<template>
  <q-form
    ref="form"
    @submit="$emit('submit')"
    class="q-gutter-md"
  >
    <q-input
      :value="fullname"
      label="Fullname"
      color="red-9"
      @input="$emit('update:fullname', $event)"
    />

    <q-input
      :value="username"
      label="Username"
      readonly
      color="red-9"
    />

    <div>
      <div class="q-field__label text-caption q-mb-xs">
        Mobile *
      </div>
      <vue-tel-input
        :value="mobile"
        mode="international"
        required
        valid-characters-only
        disabled-fetching-country
        default-country="sg"
        @input="$emit('update:mobile', $event)"
      />
    </div>

    <q-input
      type="email"
      :value="email"
      label="E-mail"
      color="red-9"
      @input="$emit('update:email', $event)"
    />

    <div>
      <div class="q-field__label text-caption q-mb-sm">
        2FA Notification Channel *
      </div>
      <div class="q-col-gutter-md">
        <q-radio
          :value="preferredComm"
          dense
          val="email"
          label="E-Mail"
          color="red-9"
          class="q-mt-none"
          :disable="!email"
          @input="$emit('update:preferredComm', $event)"
        />

        <q-radio
          :value="preferredComm"
          dense
          val="sms"
          label="SMS"
          color="red-9"
          class="q-mt-none"
          @input="$emit('update:preferredComm', $event)"
        />

        <q-radio
          :value="preferredComm"
          dense
          val="push"
          label="Push Notification"
          color="red-9"
          class="q-mt-none"
          @input="$emit('update:preferredComm', $event)"
        />
      </div>
    </div>

    <q-select
      v-if="group"
      :value="group"
      label="Group"
      :options="[]"
      readonly
      color="red-9"
    />

    <q-select
      v-if="company"
      :value="company"
      label="Company"
      :options="[]"
      readonly
      color="red-9"
    />

    <q-select
      :value="roleAcl"
      label="Role"
      :options="[]"
      readonly
      color="red-9"
    />

    <div class="text-right q-mt-lg">
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
</template>

<script>
export default {
  name: 'ProfileDetail',
  props: {
    fullname: { type: String, default: '' },
    username: {
      type: String,
      required: true
    },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    preferredComm: {
      type: String,
      required: true
    },
    group: {
      type: Object,
      default: null
    },
    company: {
      type: Object,
      default: null
    },
    roleAcl: {
      type: Object,
      default: null
    }
  }
}
</script>
