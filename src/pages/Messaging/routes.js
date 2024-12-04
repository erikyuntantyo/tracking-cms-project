export default {
  path: '/messaging',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./Index'),
      meta: {
        title: 'Messaging',
        requiresAuth: true
      }
    }
  ]
}
