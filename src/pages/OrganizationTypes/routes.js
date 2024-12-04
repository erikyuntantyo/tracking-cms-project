export default {
  path: 'organization-types',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Organization Types',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Organization Type',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Organization Type',
        requiresAuth: true
      }
    }
  ]
}
