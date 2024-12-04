export default {
  path: 'vehicle-subscription',
  component: () => import('./Index'),
  meta: {
    title: 'Vehicle Subscriptions ',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Vehicle Subscriptions',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Vehicle Subscriptions',
        requiresAuth: true
      }
    }
  ]
}
