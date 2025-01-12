import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Trash2, History, X } from "lucide-react";
import { useState } from "react";
import { useExplanation, useUpdateExplanation, useDeleteExplanation } from "@/api/explanations";

export const Route = createFileRoute("/explanations/$explanationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { explanationId } = Route.useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: explanation, isLoading } = useExplanation(explanationId);
  const updateMutation = useUpdateExplanation();
  const deleteMutation = useDeleteExplanation();

  if (isLoading || !explanation) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const entry = explanation.entries[explanation.entries.length - 1];

  const onRetry = async () => {
    try {
      await updateMutation.mutateAsync(explanation._id);
    } catch (error) {
      console.error('Failed to update explanation:', error);
    }
  };

  const onDelete = async () => {
    try {
      await deleteMutation.mutateAsync(explanation._id);
      await navigate({ to: "/explanations" });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna åtgärd kan inte ångras. Detta kommer permanent ta bort förklaringen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="p-4 max-w-3xl mx-auto w-full shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b dark:border-gray-700">
          <CardTitle className="text-3xl font-bold text-pink-600 dark:text-pink-400">{explanation.word}</CardTitle>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/explanations" })}
            className="ml-auto"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {explanation.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-pink-500 dark:text-pink-400" />
              <p className="text-lg text-gray-500 dark:text-gray-400">Genererar förklaring...</p>
            </div>
          ) : showHistory ? (
            <div className="space-y-6">
              {explanation.entries.map((historyEntry, index) => (
                <div key={index} className="p-4 rounded-lg border border-pink-100 bg-pink-50/50 dark:border-pink-900/50 dark:bg-pink-950/10">
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">Synonymer</h3>
                      <div className="flex flex-wrap gap-2">
                        {historyEntry.synonyms.map((c) => (
                          <Badge key={c} variant="secondary" className="px-3 py-1 text-base dark:bg-gray-700">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">Förklaring</h3>
                      <div className="text-gray-600 leading-relaxed dark:text-gray-300" dangerouslySetInnerHTML={{ __html: historyEntry.explanation }}></div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-pink-600 dark:text-pink-400">Version {explanation.entries.length - index}</div>
                </div>
              )).reverse()}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Synonymer</h3>
                <div className="flex flex-wrap gap-2">
                  {entry?.synonyms.map((c) => (
                    <Badge key={c} variant="secondary" className="px-3 py-1 text-base dark:bg-gray-700">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Förklaring</h3>
                <div className="text-gray-600 leading-relaxed dark:text-gray-300" dangerouslySetInnerHTML={{ __html: entry?.explanation }}></div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3 pt-4 border-t mt-4 dark:border-gray-700">
          <Button 
            onClick={onRetry} 
            disabled={updateMutation.isPending || deleteMutation.isPending || explanation.entries.length === 0}
            size="lg"
            className="font-semibold"
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Försök igen
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)} 
            disabled={updateMutation.isPending || deleteMutation.isPending}
            size="lg"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <Trash2 className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
