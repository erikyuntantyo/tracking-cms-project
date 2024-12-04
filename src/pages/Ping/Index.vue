<template>
  <q-page class="q-pa-sm">
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'BroadcastsIndex',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  }
}
</script>
