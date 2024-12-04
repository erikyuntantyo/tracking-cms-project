export default {
  path: 'articles',
  component: () => import('./Index'),
  meta: {
    title: 'Articles',
    requiresAuth: true
  },
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'Articles',
        requiresAuth: true
      }
    },
    {
      path: 'add',
      component: () => import('./Edit'),
      meta: {
        title: 'Create Article',
        requiresAuth: true
      }
    },
    {
      path: 'edit/:id',
      component: () => import('./Edit'),
      meta: {
        title: 'Edit Article',
        requiresAuth: true
      }
    }
  ]
}
