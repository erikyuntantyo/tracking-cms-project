export default {
  path: 'jobs',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Job',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Job',
        requiresAuth: true
      }
    }
  ]
}
