import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Explanation } from '@/types/models'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explanations/$explanationId')({
  component: RouteComponent,
  loader: async (args) => {
    return fetch('/api/explanations/' + args.params.explanationId).then((res) =>
      res.json(),
    ) as Promise<Explanation>
  },
})

function RouteComponent() {
  const explanation = Route.useLoaderData()

  const entry = explanation.entries[0]

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{explanation.word}</CardTitle>
      </CardHeader>
      <CardContent>

        <div className='flex flex-col'>
          <span>Synonymer:</span>
          <div className='flex flex-wrap'>
            {entry.synonyms.map(c => <Badge key={c} className="mr-2">{c}</Badge>)}
          </div>
        </div>
        <div className='flex flex-col mt-4'>
          <span>Förklaring:</span>
          <span dangerouslySetInnerHTML={{ __html: entry.explanation }}></span>
        </div>
      </CardContent>
    </Card>
  )
}
