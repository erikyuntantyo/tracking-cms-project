export default {
  path: 'broadcasts',
  component: () => import('./Index'),
  meta: {
    title: 'Broadcasts',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Broadcasts',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Broadcast',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Broadcast',
        requiresAuth: true
      }
    }
  ]
}
