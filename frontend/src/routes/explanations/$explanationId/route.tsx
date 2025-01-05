import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explanations/$explanationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/explanations/$id"!</div>
}
