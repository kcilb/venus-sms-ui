import type {NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw} from 'vue-router';
import {useCommonUtility} from "src/utility/common";

const utility = useCommonUtility();

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{path: 'login', component: () => import('pages/auth/UserAuth.vue')},
      {
        path: 'password-change',
        component: () => import('pages/auth/PasswordChange.vue'),
        beforeEnter: [isChangePassword]
      }],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: () => import('pages/admin/DashBoard.vue')}
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];


function isAuthenticated(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  try {
    if (!utility.isAuthenticated() || utility.isPasswordChange()) {
      next('/auth/login');
    } else {
      next();
    }
  } catch (err) {
    next('/auth/login');
  }

}


function isChangePassword(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  try {
    if (!utility.isPasswordChange()) {
      next('/auth/login');
    } else {
      next();
    }
  } catch (err) {
    next('/auth/login');
  }
}

export default routes;
