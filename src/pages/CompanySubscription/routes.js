export default {
  path: 'company-subscription',
  component: () => import('./Index'),
  meta: {
    title: 'Company Subscriptions',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Company Subscriptions',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Add'),
      meta: {
        title: 'Create Company Subscriptions',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Company Subscriptions',
        requiresAuth: true
      }
    }
  ]
}
