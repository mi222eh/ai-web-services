import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Explanation } from '@/types/models'
import { createFileRoute, redirect, Navigate, Outlet } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { Loader2, Plus, Trash2, ArrowRight } from 'lucide-react'
import { z } from 'zod'
import {
  useExplanations,
  useCreateExplanation,
  useDeleteExplanation,
} from '@/api/explanations'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { toast } from 'react-hot-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const searchParam = z.object({
  query: z.string().default('').catch(''),
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
})

export const Route = createFileRoute('/explanations')({
  component: RouteComponent,
  loader: async ({ context }) => {
    console.log('Explanations loader: checking auth')
    const isAuthenticated = await context.auth.checkAuth()
    console.log('Explanations loader: auth check result', isAuthenticated)

    if (!isAuthenticated) {
      console.log('Explanations loader: not authenticated, redirecting')
      throw redirect({
        to: '/login',
      })
    }
    return null
  },
  validateSearch: zodValidator(searchParam),
  errorComponent: () => {
    console.log('Explanations error: redirecting to login')
    return <Navigate to="/login" />
  },
})

function RouteComponent() {
  const { page, limit, query } = Route.useSearch()
  const navigate = Route.useNavigate()
  const skip = (page - 1) * limit

  const { data, isLoading } = useExplanations(skip, limit, query)
  const createMutation = useCreateExplanation()
  const deleteMutation = useDeleteExplanation()

  const explanations = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Ordet har tagits bort!')
    } catch (error) {
      toast.error('Kunde inte ta bort ordet.')
      console.error('Error deleting explanation:', error)
    }
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    navigate({
      search: {
        query: e.target.value.toLowerCase(),
        page: 1,
        limit,
      },
    })
  }

  const handleCreateExplanation = async () => {
    if (createMutation.isPending || !query.trim()) return

    const searchTerm = query.trim().toLowerCase()
    const exists = explanations.some(
      (exp) => exp.word.toLowerCase() === searchTerm,
    )

    if (!exists) {
      try {
        const data = await createMutation.mutateAsync({
          word: searchTerm,
        })
        // await navigate({
        //   to: '/explanations/$explanationId',
        //   params: { explanationId: data._id },
        // })
      } catch (error) {
        console.error('Failed to create explanation:', error)
      }
    }
  }

  const onSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      await handleCreateExplanation()
    }
  }

  const onNuanceClick = (
    explanation1: Explanation,
    explanation2: Explanation,
  ) => {
    navigate({
      to: '/explanations/nuances/$explanationId1/$explanationId2',
      params: {
        explanationId1: explanation1._id,
        explanationId2: explanation2._id,
      },
    })
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Outlet />

      <div>
        <h1 className="text-3xl font-bold mb-4">Ordförklaringar</h1>
        <div className="flex gap-2 items-center max-w-md">
          <Input
            type="search"
            placeholder="Sök efter ord..."
            value={query}
            onChange={onSearch}
            onKeyDown={onSearchKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleCreateExplanation}
            disabled={!query.trim() || createMutation.isPending}
            className="rounded-full h-10 w-10 flex items-center justify-center"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="animate-pulse group relative overflow-hidden border-border/40 shadow-md hover:shadow-lg transition-all"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="h-6 w-32 bg-muted rounded-md" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded-md" />
                        <div className="h-4 w-2/3 bg-muted rounded-md" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-muted rounded-md" />
                      <div className="h-8 w-8 bg-muted rounded-md" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    <div className="h-4 w-20 bg-muted rounded-md" />
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-muted rounded-md" />
                      <div className="h-8 w-20 bg-muted rounded-md" />
                      <div className="h-8 w-20 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Laddar förklaringar...
                  </div>
                </CardContent>
              </Card>
            ))
          : explanations?.map((explanation) => {
              const isLoading = explanation.entries.length === 0
              if (isLoading) {
                return (
                  <Card
                    key={explanation._id}
                    className="animate-pulse group relative overflow-hidden border-border/40 shadow-md hover:shadow-lg transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1">
                          <CardTitle className="text-xl">
                            {explanation.word}
                          </CardTitle>
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-muted rounded-md" />
                            <div className="h-4 w-2/3 bg-muted rounded-md" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-muted rounded-md" />
                          <div className="h-8 w-8 bg-muted rounded-md" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="space-y-4">
                        <div className="h-4 w-20 bg-muted rounded-md" />
                        <div className="flex gap-2">
                          <div className="h-8 w-20 bg-muted rounded-md" />
                          <div className="h-8 w-20 bg-muted rounded-md" />
                          <div className="h-8 w-20 bg-muted rounded-md" />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Genererar förklaring för "{explanation.word}"...
                      </div>
                    </CardContent>
                  </Card>
                )
              }
              return (
                <Card
                  key={explanation._id}
                  className="group relative overflow-hidden border-border/40 shadow-md hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {explanation.word}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {explanation.entries?.[0]?.explanation}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            navigate({
                              to: '/explanations/$explanationId',
                              params: { explanationId: explanation._id },
                            })
                          }
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ta bort ord?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill ta bort ordet "
                                {explanation.word}"? Detta kan inte ångras.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(explanation._id)}
                              >
                                Ta bort
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  {explanation.entries?.[0]?.synonyms && (
                    <CardContent>
                      <h3 className="font-semibold mb-2">Synonymer</h3>
                      <div className="flex flex-wrap gap-2">
                        {explanation.entries[0].synonyms.map((synonym) => {
                          // Find the explanation ID for the synonym
                          const synonymExplanation = explanations.find(
                            (e) => e.word === synonym,
                          )
                          return (
                            <AlertDialog key={synonym}>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  {synonym}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Vad vill du göra?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {synonymExplanation
                                      ? 'Vill du se nyansskillnader mellan orden?'
                                      : 'Ordet finns inte än. Vill du skapa det?'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  {synonymExplanation ? (
                                    <AlertDialogAction
                                      onClick={() =>
                                        onNuanceClick(
                                          explanation,
                                          synonymExplanation,
                                        )
                                      }
                                    >
                                      Visa nyanser
                                    </AlertDialogAction>
                                  ) : (
                                    <AlertDialogAction
                                      onClick={async () => {
                                        try {
                                          const data =
                                            await createMutation.mutateAsync({
                                              word: synonym,
                                            })
                                          navigate({
                                            to: '/explanations/$explanationId',
                                            params: { explanationId: data._id },
                                          })
                                        } catch (error) {
                                          console.error(
                                            'Failed to create explanation:',
                                            error,
                                          )
                                          toast.error('Kunde inte skapa ordet.')
                                        }
                                      }}
                                    >
                                      Skapa ord
                                    </AlertDialogAction>
                                  )}
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
      </div>
    </div>
  )
}
