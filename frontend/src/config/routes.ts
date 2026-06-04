/**
 * Route configuration and utilities
 */

import { ReactNode } from 'react'

export interface RouteConfig {
  path: string
  label: string
  protected: boolean
}

export const routes: Record<string, RouteConfig> = {
  HOME: {
    path: '/',
    label: 'Home',
    protected: false,
  },
  AUTH: {
    path: '/auth',
    label: 'Auth',
    protected: false,
  },
  LOGIN: {
    path: '/login',
    label: 'Login',
    protected: false,
  },
  REGISTER: {
    path: '/register',
    label: 'Register',
    protected: false,
  },
  DASHBOARD: {
    path: '/dashboard',
    label: 'Dashboard',
    protected: true,
  },
}

export const isProtectedRoute = (path: string): boolean => {
  return Object.values(routes).some((route) => route.path === path && route.protected)
}
