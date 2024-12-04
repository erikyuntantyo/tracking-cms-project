export default {
  path: 'role-modules',
  component: () => import('./Index'),
  meta: {
    title: 'Role Modules',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Role Modules',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Role Module',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Role Module',
        requiresAuth: true
      }
    }
  ]
}
