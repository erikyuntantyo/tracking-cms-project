export default {
  path: 'ping',
  component: () => import('./Index'),
  meta: {
    title: 'Ping',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Ping',
        requiresAuth: true
      }
    }
  ]
}
