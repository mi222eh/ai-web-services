import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: () => {
    const { auth } = Route.useRouteContext()
    return (
      <div>
        <Outlet />
      </div>
    )
  },
})
