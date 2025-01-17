import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  LoaderFunction,
  RouterProvider,
} from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

import {
  CanviApp,
  CircleApp,
  DimenApp,
  EyeGenApp,
  NavigationApp,
  NoiseApp,
  VisdioApp,
  AApp,
  CApp,
  IApp,
  SApp,
  Zer0App,
} from './components/apps'

import { ErrorBoundary } from './components/debug/ErrorBoundry'

import './index.scss'
import { TonesApp } from './components/apps/TonesApp'

import { ColorSchemeProvider } from './contexts/ColorSchemeContext'

const getTitleLoader = (title: string): LoaderFunction => {
  return (): null => {
    document.title = title

    return null
  }
}

const withErrorBoundary = (app: JSX.Element, appName?: string): JSX.Element => (
  <ErrorBoundary app={appName}>
    <ColorSchemeProvider>{app}</ColorSchemeProvider>
  </ErrorBoundary>
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
      path: '/tones',
      loader: getTitleLoader('TONES'),
      element: withErrorBoundary(<TonesApp />, 'Tones'),
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
    {
      path: '/noise',
      loader: getTitleLoader('NOISE'),
      element: withErrorBoundary(<NoiseApp />, 'NOISE'),
    },
    {
      path: '/canvi',
      loader: getTitleLoader('CANVI'),
      element: withErrorBoundary(<CanviApp />, 'CANVI'),
    },
    {
      path: '/dimen',
      loader: getTitleLoader('DIMEN'),
      element: withErrorBoundary(<DimenApp />, 'DIMEN'),
    },
    {
      path: '/a',
      loader: getTitleLoader('A'),
      element: withErrorBoundary(<AApp />, 'A'),
    },
    {
      path: '/s',
      loader: getTitleLoader('S'),
      element: withErrorBoundary(<SApp />, 'S'),
    },
    {
      path: '/c',
      loader: getTitleLoader('c'),
      element: withErrorBoundary(<CApp />, 'C'),
    },
    {
      path: '/i',
      loader: getTitleLoader('i'),
      element: withErrorBoundary(<IApp />, 'I'),
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_relativeSplatPath: true,
    },
  },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
    <Analytics />
  </React.StrictMode>,
)
