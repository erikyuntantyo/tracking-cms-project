export default {
  path: 'organization-users',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Organization Users',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Organization User',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Organization User',
        requiresAuth: true
      }
    }
  ]
}
