export default {
  path: 'companies',
  component: () => import('./Index'),
  meta: {
    title: 'Companies',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Companies',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Company',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Company',
        requiresAuth: true
      }
    }
  ]
}
