export default {
  path: 'vehicles',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Vehicle Management',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Vehicle',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Vehicle',
        requiresAuth: true
      }
    }
  ]
}
