import { createRouter, createWebHistory } from 'vue-router'
import showfile from '../view/showfile.vue'
import history from '../view/history.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: showfile,
        meta: {
            title: 'Document Editor'
        }
    },
    {
        path: '/documents',
        name: 'MyDocuments',
        component: history,
        meta: {
            title: 'My Documents'
        }
    },
    {
        path: '/showfile/:id?',
        name: 'ShowFile',
        component: showfile,
        meta: {
            title: 'Document Viewer'
        }
    },

    // 重定向未匹配的路由到首页
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = `${to.meta.title} - DocuGen`
    }
    next()
})

export default router