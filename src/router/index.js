import HomeView from '../views/HomeView.vue'

// vite-ssg creates the router (memory history while pre-rendering, web history
// in the browser), so this module only exports the route table and options.
export const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/projects', name: 'projects', component: () => import('../views/ProjectsView.vue') },
  { path: '/projects/:slug', name: 'project', component: () => import('../views/ProjectDetailView.vue'), props: true },
  { path: '/blog', name: 'blog', component: () => import('../views/BlogIndexView.vue') },
  { path: '/blog/:slug', name: 'post', component: () => import('../views/BlogPostView.vue'), props: true },
  { path: '/open-source', name: 'oss', component: () => import('../views/OssIndexView.vue') },
  { path: '/open-source/kotlin-artisan', name: 'oss-artisan', component: () => import('../views/OssArtisanView.vue') },
  { path: '/contact', name: 'contact', component: () => import('../views/ContactView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]

export function scrollBehavior(to, from, saved) {
  if (saved) return saved
  if (to.hash) return { el: to.hash, behavior: 'smooth' }
  if (to.path === from.path) return false // query-only change (e.g. project filters)
  return { top: 0 }
}
