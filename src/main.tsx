import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  LoaderFunction,
  RouterProvider,
} from 'react-router-dom'

import {
  CircleApp,
  EyeGenApp,
  NavigationApp,
  VisdioApp,
  Zer0App,
} from './components/apps'

import { ErrorBoundary } from './components/debug/ErrorBoundry'

import './index.scss'

const getTitleLoader = (title: string): LoaderFunction => {
  return (): null => {
    document.title = title

    return null
  }
}

const withErrorBoundary = (app: JSX.Element, appName?: string): JSX.Element => (
  <ErrorBoundary app={appName}>{app}</ErrorBoundary>
)

const router = createBrowserRouter(
  [
    {
      path: '/',
      loader: getTitleLoader('BLUEGREEN'),
      element: withErrorBoundary(<NavigationApp />, 'BLUEGREEN'),
    },
    {
      path: '/eye-gen',
      loader: getTitleLoader('EYE GEN'),
      element: withErrorBoundary(<EyeGenApp />, 'EYE GEN'),
    },
    {
      path: '/visdio',
      loader: getTitleLoader('VISDIO'),
      element: withErrorBoundary(<VisdioApp />, 'VISDIO'),
    },
    {
      path: '/zer0',
      loader: getTitleLoader('ZER0'),
      element: withErrorBoundary(<Zer0App />, 'ZER0'),
    },
    {
      path: '/circle',
      loader: getTitleLoader('CIRCLE'),
      element: withErrorBoundary(<CircleApp />, 'CIRCLE'),
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
    },
  },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>,
)
