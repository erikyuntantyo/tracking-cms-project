export default {
  path: 'message-history',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Message History',
        requiresAuth: true
      }
    }
  ]
}
