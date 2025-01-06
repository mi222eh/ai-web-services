import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Explanation } from '@/types/models'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

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
  const [isLoading, setIsLoading] = useState(false)

  const entry = explanation.entries[explanation.entries.length - 1]

  const onRetry = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/explanations/' + explanation._id, {
        method: 'PUT',
      })
      Route.router?.invalidate()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4 w-80">
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
      <CardFooter>
        <Button onClick={onRetry} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Uppdatera
        </Button>
      </CardFooter>
    </Card>
  )
}
