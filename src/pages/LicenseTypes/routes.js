export default {
  path: 'license-types',
  component: () => import('./Index'),
  meta: {
    title: 'License Types',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'License Types',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create License Type',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit License Type',
        requiresAuth: true
      }
    }
  ]
}
