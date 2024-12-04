<template>
  <div>
    <div class="row items-center no-wrap">
      <q-icon
        left
        name="account_circle"
        size="2em"
        class="q-pr-sm"
      />
      <div
        class="text-left"
        style="line-height: 15px;"
      >
        <div>{{ user }}</div>
        <div
          class="text-caption"
          style="opacity: 0.6;"
        >
          {{ role }}
        </div>
      </div>
    </div>

    <q-menu>
      <q-list style="min-width: 150px;">
        <q-item
          to="/profile"
          clickable
          active-class="text-red-10"
          v-close-popup
        >
          <q-item-section>Profile</q-item-section>
        </q-item>

        <q-item
          clickable
          v-close-popup
          active-class="text-red-10"
          @click="$emit('logout')"
        >
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
  props: {
    user: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: ''
    }
  }
}
</script>
