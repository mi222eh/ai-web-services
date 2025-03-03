/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as AboutImport } from './routes/about'
import { Route as AuthImport } from './routes/_auth'
import { Route as ExplanationsRouteImport } from './routes/explanations/route'
import { Route as IndexImport } from './routes/ind./routes/explanations/route
import { Route as ExplanationsExplanationIdRouteImport } from './routes/explanations/$explanationId/route'
import { Route as ExplanationsWord1Word2Import } from './routes/explanations/$word1/$word2'
import { Route as ExplanationsNuancesExplanationId1ExplanationId2RouteImport } from './routes/explanations/nuances/$explanationId1/$explanationId2/route'
import { Route as ExplanationsNuancesExplanationId1ExplanationId2IndexImport } from './routes/explanations/nuances/$explanationId1/$explanationId2/index'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const ExplanationsRouteRoute = ExplanationsRouteImport.update({
  id: '/explanations',
  path: '/explanations',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ExplanationsExplanationIdRouteRoute =
  ExplanationsExplanationIdRouteImport.update({
    id: '/$explanationId',
    path: '/$explanationId',
    getParentRoute: () => ExplanationsRouteRoute,
  } as any)

const ExplanationsWord1Word2Route = ExplanationsWord1Word2Import.update({
  id: '/$word1/$word2',
  path: '/$word1/$word2',
  getParentRoute: () => ExplanationsRouteRoute,
} as any)

const ExplanationsNuancesExplanationId1ExplanationId2RouteRoute =
  ExplanationsNuancesExplanationId1ExplanationId2RouteImport.update({
    id: '/nuances/$explanationId1/$explanationId2',
    path: '/nuances/$explanationId1/$explanationId2',
    getParentRoute: () => ExplanationsRouteRoute,
  } as any)

const ExplanationsNuancesExplanationId1ExplanationId2IndexRoute =
  ExplanationsNuancesExplanationId1ExplanationId2IndexImport.update({
    id: '/',
    path: '/',
    getParentRoute: () =>
      ExplanationsNuancesExplanationId1ExplanationId2RouteRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/explanations': {
      id: '/explanations'
      path: '/explanations'
      fullPath: '/explanations'
      preLoaderRoute: typeof ExplanationsRouteImport
      parentRoute: typeof rootRoute
    }
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/explanations/$explanationId': {
      id: '/explanations/$explanationId'
      path: '/$explanationId'
      fullPath: '/explanations/$explanationId'
      preLoaderRoute: typeof ExplanationsExplanationIdRouteImport
      parentRoute: typeof ExplanationsRouteImport
    }
    '/explanations/$word1/$word2': {
      id: '/explanations/$word1/$word2'
      path: '/$word1/$word2'
      fullPath: '/explanations/$word1/$word2'
      preLoaderRoute: typeof ExplanationsWord1Word2Import
      parentRoute: typeof ExplanationsRouteImport
    }
    '/explanations/nuances/$explanationId1/$explanationId2': {
      id: '/explanations/nuances/$explanationId1/$explanationId2'
      path: '/nuances/$explanationId1/$explanationId2'
      fullPath: '/explanations/nuances/$explanationId1/$explanationId2'
      preLoaderRoute: typeof ExplanationsNuancesExplanationId1ExplanationId2RouteImport
      parentRoute: typeof ExplanationsRouteImport
    }
    '/explanations/nuances/$explanationId1/$explanationId2/': {
      id: '/explanations/nuances/$explanationId1/$explanationId2/'
      path: '/'
      fullPath: '/explanations/nuances/$explanationId1/$explanationId2/'
      preLoaderRoute: typeof ExplanationsNuancesExplanationId1ExplanationId2IndexImport
      parentRoute: typeof ExplanationsNuancesExplanationId1ExplanationId2RouteImport
    }
  }
}

// Create and export the route tree

interface ExplanationsNuancesExplanationId1ExplanationId2RouteRouteChildren {
  ExplanationsNuancesExplanationId1ExplanationId2IndexRoute: typeof ExplanationsNuancesExplanationId1ExplanationId2IndexRoute
}

const ExplanationsNuancesExplanationId1ExplanationId2RouteRouteChildren: ExplanationsNuancesExplanationId1ExplanationId2RouteRouteChildren =
  {
    ExplanationsNuancesExplanationId1ExplanationId2IndexRoute:
      ExplanationsNuancesExplanationId1ExplanationId2IndexRoute,
  }

const ExplanationsNuancesExplanationId1ExplanationId2RouteRouteWithChildren =
  ExplanationsNuancesExplanationId1ExplanationId2RouteRoute._addFileChildren(
    ExplanationsNuancesExplanationId1ExplanationId2RouteRouteChildren,
  )

interface ExplanationsRouteRouteChildren {
  ExplanationsExplanationIdRouteRoute: typeof ExplanationsExplanationIdRouteRoute
  ExplanationsWord1Word2Route: typeof ExplanationsWord1Word2Route
  ExplanationsNuancesExplanationId1ExplanationId2RouteRoute: typeof ExplanationsNuancesExplanationId1ExplanationId2RouteRouteWithChildren
}

const ExplanationsRouteRouteChildren: ExplanationsRouteRouteChildren = {
  ExplanationsExplanationIdRouteRoute: ExplanationsExplanationIdRouteRoute,
  ExplanationsWord1Word2Route: ExplanationsWord1Word2Route,
  ExplanationsNuancesExplanationId1ExplanationId2RouteRoute:
    ExplanationsNuancesExplanationId1ExplanationId2RouteRouteWithChildren,
}

const ExplanationsRouteRouteWithChildren =
  ExplanationsRouteRoute._addFileChildren(ExplanationsRouteRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/explanations': typeof ExplanationsRouteRouteWithChildren
  '': typeof AuthRoute
  '/about': typeof AboutRoute
  '/login': typeof LoginRoute
  '/explanations/$explanationId': typeof ExplanationsExplanationIdRouteRoute
  '/explanations/$word1/$word2': typeof ExplanationsWord1Word2Route
  '/explanations/nuances/$explanationId1/$explanationId2': typeof ExplanationsNuancesExplanationId1ExplanationId2RouteRouteWithChildren
  '/explanations/nuances/$explanationId1/$explanationId2/': typeof ExplanationsNuancesExplanationId1ExplanationId2IndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/explanations': typeof ExplanationsRouteRouteWithChildren
  '': typeof AuthRoute
  '/about': typeof AboutRoute
  '/login': typeof LoginRoute
  '/explanations/$explanationId': typeof ExplanationsExplanationIdRouteRoute
  '/explanations/$word1/$word2': typeof ExplanationsWord1Word2Route
  '/explanations/nuances/$explanationId1/$explanationId2': typeof ExplanationsNuancesExplanationId1ExplanationId2IndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/explanations': typeof ExplanationsRouteRouteWithChildren
  '/_auth': typeof AuthRoute
  '/about': typeof AboutRoute
  '/login': typeof LoginRoute
  '/explanations/$explanationId': typeof ExplanationsExplanationIdRouteRoute
  '/explanations/$word1/$word2': typeof ExplanationsWord1Word2Route
  '/explanations/nuances/$explanationId1/$explanationId2': typeof ExplanationsNuancesExplanationId1ExplanationId2RouteRouteWithChildren
  '/explanations/nuances/$explanationId1/$explanationId2/': typeof ExplanationsNuancesExplanationId1ExplanationId2IndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/explanations'
    | ''
    | '/about'
    | '/login'
    | '/explanations/$explanationId'
    | '/explanations/$word1/$word2'
    | '/explanations/nuances/$explanationId1/$explanationId2'
    | '/explanations/nuances/$explanationId1/$explanationId2/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/explanations'
    | ''
    | '/about'
    | '/login'
    | '/explanations/$explanationId'
    | '/explanations/$word1/$word2'
    | '/explanations/nuances/$explanationId1/$explanationId2'
  id:
    | '__root__'
    | '/'
    | '/explanations'
    | '/_auth'
    | '/about'
    | '/login'
    | '/explanations/$explanationId'
    | '/explanations/$word1/$word2'
    | '/explanations/nuances/$explanationId1/$explanationId2'
    | '/explanations/nuances/$explanationId1/$explanationId2/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ExplanationsRouteRoute: typeof ExplanationsRouteRouteWithChildren
  AuthRoute: typeof AuthRoute
  AboutRoute: typeof AboutRoute
  LoginRoute: typeof LoginRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ExplanationsRouteRoute: ExplanationsRouteRouteWithChildren,
  AuthRoute: AuthRoute,
  AboutRoute: AboutRoute,
  LoginRoute: LoginRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/explanations",
        "/_auth",
        "/about",
        "/login"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/explanations": {
      "filePath": "explanations/route.tsx",
      "children": [
        "/explanations/$explanationId",
        "/explanations/$word1/$word2",
        "/explanations/nuances/$explanationId1/$explanationId2"
      ]
    },
    "/_auth": {
      "filePath": "_auth.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/explanations/$explanationId": {
      "filePath": "explanations/$explanationId/route.tsx",
      "parent": "/explanations"
    },
    "/explanations/$word1/$word2": {
      "filePath": "explanations/$word1/$word2.tsx",
      "parent": "/explanations"
    },
    "/explanations/nuances/$explanationId1/$explanationId2": {
      "filePath": "explanations/nuances/$explanationId1/$explanationId2/route.tsx",
      "parent": "/explanations",
      "children": [
        "/explanations/nuances/$explanationId1/$explanationId2/"
      ]
    },
    "/explanations/nuances/$explanationId1/$explanationId2/": {
      "filePath": "explanations/nuances/$explanationId1/$explanationId2/index.tsx",
      "parent": "/explanations/nuances/$explanationId1/$explanationId2"
    }
  }
}
ROUTE_MANIFEST_END */
