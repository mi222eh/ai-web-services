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
import { Explanation } from "@/types/models";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Trash2, History } from "lucide-react";
import { useState } from "react";
import { fetchExplanationById, updateExplanation, deleteExplanation } from "@/api/explanations";

export const Route = createFileRoute("/explanations/$explanationId")({
  component: RouteComponent,
  loader: async (args) => {
    return fetchExplanationById(args.params.explanationId);
  },
});

function RouteComponent() {
  const explanation = Route.useLoaderData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const entry = explanation.entries[explanation.entries.length - 1];

  const onRetry = async () => {
    setIsLoading(true);
    try {
      await updateExplanation(explanation._id);
      await Route.router?.invalidate();
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExplanation(explanation._id);
      await Route.router?.invalidate();
      await navigate({ to: "/explanations" });
    } finally {
      setIsDeleting(false);
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
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          {showHistory ? (
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
                  {entry.synonyms.map((c) => (
                    <Badge key={c} className="mr-2">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col mt-4">
                <span>Förklaring:</span>
                <span dangerouslySetInnerHTML={{ __html: entry.explanation }}></span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={onRetry} disabled={isLoading || isDeleting}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Försök igen
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)} 
            disabled={isLoading || isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
