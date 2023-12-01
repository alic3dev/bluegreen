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

import './index.scss'

const getTitleLoader = (title: string): LoaderFunction => {
  return (): null => {
    document.title = title

    return null
  }
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      loader: getTitleLoader('BLUEGREEN'),
      element: <NavigationApp />,
    },
    {
      path: '/eye-gen',
      loader: getTitleLoader('EYE GEN'),
      element: <EyeGenApp />,
    },
    {
      path: '/visdio',
      loader: getTitleLoader('VISDIO'),
      element: <VisdioApp />,
    },
    {
      path: '/zer0',
      loader: getTitleLoader('ZER0'),

      element: <Zer0App />,
    },
    {
      path: '/circle',
      loader: getTitleLoader('CIRCLE'),
      element: <CircleApp />,
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
    <RouterProvider router={router} />
  </React.StrictMode>,
)
