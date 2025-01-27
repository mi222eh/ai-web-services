import { createFileRoute } from '@tanstack/react-router'
import { NuanceAnalysis } from '@/components/nuance-analysis'
import { useExplanation } from '@/api/explanations'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute(
  '/explanations/nuances/$explanationId1/$explanationId2',
)({
  component: CompareComponent,
})

function CompareComponent() {
  const { explanationId1, explanationId2 } = Route.useParams()
  const { data: explanation1, isLoading: isLoading1 } =
    useExplanation(explanationId1)
  const { data: explanation2, isLoading: isLoading2 } =
    useExplanation(explanationId2)

  if (isLoading1 || isLoading2) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full animate-pulse">
          <CardHeader>
            <CardTitle className="text-xl">Laddar ord...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!explanation1 || !explanation2) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-xl">Kunde inte hitta orden</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <NuanceAnalysis
        explanationId1={explanationId1}
        explanationId2={explanationId2}
      />
    </div>
  )
}
