import { createRouter, createWebHistory } from 'vue-router'
import showfile from '../view/showfile.vue'
import history from '../view/history.vue'
import CreateDocument from '../view/createdocument.vue'
import ChecklistEditor from '../view/checklist.vue'; // 导入新组件
import Login from '../view/Login.vue'
import Register from '../view/Register.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        // 新增: 标记此页面为“访客”页面，已登录用户访问时应重定向
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        // 新增: 标记此页面为“访客”页面
        meta: { requiresGuest: true }
    },
    {
        path: '/documents',
        name: 'MyDocuments',
        component: history,
        // 修改: 标记此页面需要授权
        meta: {
            title: 'My Documents',
            requiresAuth: true
        }
    },
    {
        path: '/document/checklist',
        name: 'DocumentChecklist',
        component: ChecklistEditor,
        // 修改: 标记此页面需要授权
        meta: {
            title: 'Edit Document Checklist',
            requiresAuth: true
        }
    },
    {
        path: '/create', // 将创建页面的路由从'/'改为'/create'
        name: 'CreateDocument',
        component: CreateDocument,
        // 修改: 标记此页面需要授权
        meta: {
            title: 'Create New Document',
            requiresAuth: true
        }
    },
    {
        path: '/showfile/:id?',
        name: 'ShowFile',
        component: showfile,
        // 修改: 标记此页面需要授权
        meta: {
            title: 'Document Viewer',
            requiresAuth: true
        }
    },
    {
        // 将根路径重定向到创建文档页
        path: '/',
        redirect: '/create'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]
import { useAuthStore } from '../store/auth'

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
    void from;

    // 在守卫内部获取 auth store
    const authStore = useAuthStore();

    const isAuthenticated = authStore.isAuthenticated;

    // 1. 如果目标路由需要授权，但用户未登录
    if (to.meta.requiresAuth && !isAuthenticated) {
        // 重定向到登录页，并附带一个 'redirect' 查询参数
        // 以便登录后能返回到他们想去的页面
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    }
    // 2. 如果目标路由是为访客准备的（如登录/注册页），但用户已登录
    else if (to.meta.requiresGuest && isAuthenticated) {
        // 将已登录的用户重定向到主页
        next('/');
    }
    // 3. 其他所有情况，正常放行
    else {
        next();
    }
});
export default router
