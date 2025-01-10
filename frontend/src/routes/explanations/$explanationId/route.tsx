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
import { Loader2, Trash2, History } from "lucide-react";
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

      <Card className="p-4 max-w-3xl mx-auto w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{explanation.word}</CardTitle>
          <Button 
            variant={showHistory ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 w-8"
          >
            <History className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {explanation.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-gray-500">Genererar förklaring...</p>
            </div>
          ) : showHistory ? (
            <div className="space-y-6">
              {explanation.entries.map((historyEntry, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex flex-col">
                    <span>Synonymer:</span>
                    <div className="flex flex-wrap">
                      {historyEntry.synonyms.map((c) => (
                        <Badge key={c} className="mr-2">{c}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col mt-4">
                    <span>Förklaring:</span>
                    <span dangerouslySetInnerHTML={{ __html: historyEntry.explanation }}></span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Version {explanation.entries.length - index}</div>
                </div>
              )).reverse()}
            </div>
          ) : (
            <div>
              <div className="flex flex-col">
                <span>Synonymer:</span>
                <div className="flex flex-wrap">
                  {entry?.synonyms.map((c) => (
                    <Badge key={c} className="mr-2">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col mt-4">
                <span>Förklaring:</span>
                <span dangerouslySetInnerHTML={{ __html: entry?.explanation }}></span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={onRetry} 
            disabled={updateMutation.isPending || deleteMutation.isPending || explanation.entries.length === 0}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Försök igen
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)} 
            disabled={updateMutation.isPending || deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
