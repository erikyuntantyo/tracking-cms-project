<template>
  <q-page class="q-pa-sm">
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'ArticlesIndex',
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  }
}
</script>
