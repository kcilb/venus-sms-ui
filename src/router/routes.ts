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
      {path: '', component: () => import('pages/admin/DashBoard.vue'), name: 'Dashboard'},
      {path: 'roles', component: () => import('pages/admin/roles/RoleList.vue'), name: 'RoleList'},
      {
        path: 'role/:action', component: () => import('pages/admin/roles/MaintainRole.vue'), name: 'CreateRole',
        props: true
      },
      {
        path: 'role/:action/:id', component: () => import('pages/admin/roles/MaintainRole.vue'), name: 'EditRole',
        props: true
      },
      {path: 'users', component: () => import('pages/admin/users/UserList.vue'), name: 'UserList'},
      {
        path: 'user/:action', component: () => import('pages/admin/users/MaintainUser.vue'), name: 'CreateUser',
        props: true
      },
      {
        path: 'user/:action/:id', component: () => import('pages/admin/users/MaintainUser.vue'), name: 'EditUser',
        props: true
      },

      {
        path: 'currency',
        component: () => import('pages/admin/sms-currency/SMSCurrencyList.vue'),
        name: 'CurrencyList'
      },
      {
        path: 'currency/:action',
        component: () => import('pages/admin/sms-currency/MaintainSMSCurrency.vue'),
        name: 'CreateCurrency',
        props: true
      },
      {
        path: 'currency/:action/:id',
        component: () => import('pages/admin/sms-currency/MaintainSMSCurrency.vue'),
        name: 'EditCurrency',
        props: true
      },

      {path: 'charges', component: () => import('pages/admin/charges/ChargesActivities.vue'), name: 'RunCharge'},


    ],
    beforeEnter: [isAuthenticated]
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
