import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explanations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/explanations"!</div>
}
