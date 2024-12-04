<template>
  <q-form
    ref="myForm"
    class="q-gutter-md"
    @submit="$emit('submit')"
  >
    <q-input
      color="red-9"
      autocomplete="new-password"
      label="Old Password *"
      :type="isOldPwd ? 'password' : 'text'"
      lazy-rules
      :value="oldPassword"
      @input="$emit('update:oldPassword', $event)"
      :rules="[
        val => !!val || 'Please type something'
      ]"
    >
      <template #append>
        <q-icon
          :name="isOldPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isOldPwd = !isOldPwd"
        />
      </template>
    </q-input>

    <q-input
      color="red-9"
      autocomplete="new-password"
      label="New Password *"
      :type="isNewPwd ? 'password' : 'text'"
      lazy-rules
      :value="password"
      @input="$emit('update:password', $event)"
      :rules="[
        val => !!val || 'Please type something',
        val => val && val.length >= 8 || 'Minimum password is 8 character'
      ]"
    >
      <template #append>
        <q-icon
          :name="isNewPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isNewPwd = !isNewPwd"
        />
      </template>
    </q-input>

    <q-input
      color="red-9"
      autocomplete="new-password"
      label="Confirm Password *"
      :type="isConfirmPwd ? 'password' : 'text'"
      lazy-rules
      :value="passwordConfirmation"
      @input="$emit('update:passwordConfirmation', $event)"
      :rules="[
        val => !!val || 'Please type something',
        val => val === this.password || 'Password confirmation doesn\'t match'
      ]"
    >
      <template #append>
        <q-icon
          :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isConfirmPwd = !isConfirmPwd"
        />
      </template>
    </q-input>

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
  data () {
    return {
      isOldPwd: true,
      isNewPwd: true,
      isConfirmPwd: true
    }
  },
  props: {
    oldPassword: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    passwordConfirmation: {
      type: String,
      required: true
    }
  },
  methods: {
    resetForm () {
      // this.$refs.myForm.reset()
      // this.$refs.myForm.resetValidation()
      this.$refs.myForm.resetValidation()
    }
  }
}
</script>
