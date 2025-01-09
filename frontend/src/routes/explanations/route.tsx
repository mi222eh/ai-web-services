import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Explanation } from "@/types/models";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { createExplanation, fetchExplanations } from "@/api/explanations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const levenshteinDistance = (str1: string, str2: string): number => {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
};

const searchParam = z.object({
  query: z.string().default("").catch(""),
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
});

export const Route = createFileRoute("/explanations")({
  component: RouteComponent,
  validateSearch: zodValidator(searchParam),
  loaderDeps: (opts) => ({ 
    query: opts.search.query,
    page: opts.search.page,
    limit: opts.search.limit,
  }),
  loader: async (args) => {
    const skip = (args.deps.page - 1) * args.deps.limit;
    const response = await fetchExplanations(skip, args.deps.limit, args.deps.query);
    return response;
  },
});

function RouteComponent() {
  const { items: explanations, total } = Route.useLoaderData();
  const { page, limit, query } = Route.useSearch();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = Route.useNavigate();

  const totalPages = Math.ceil(total / limit);

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    navigate({
      search: {
        query: e.target.value.toLowerCase(),
        page: 1, // Reset to first page on new search
        limit,
      },
    });
  };

  const onPageChange = (newPage: number) => {
    navigate({
      search: {
        query,
        page: newPage,
        limit,
      },
    });
  };

  const onOpenAdd = () => setIsAddOpen(true);

  const onWordClick = (word: Explanation) => {
    navigate({
      to: "/explanations/$explanationId",
      params: { explanationId: word._id },
    });
  };

  // Calculate how many skeleton items to show
  const skeletonCount = Math.max(0, limit - explanations.length);

  return (
    <div className="p-4 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="p-2 flex gap-2 text-lg justify-center items-center">
        <Outlet />
      </div>

      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Input
              placeholder="Sök"
              onChange={onSearch}
              className="border rounded-full px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-pink-500 w-64"
            />
            <button
              onClick={onOpenAdd}
              className="text-pink-500 text-sm hover:text-pink-700 hover:underline cursor-pointer animate-in fade-in duration-200"
            >
              hittar inte? lägg till!
            </button>
          </div>
          
          <ul className="w-full space-y-2">
            {explanations.map((explanation) => (
              <li key={explanation._id}>
                <button
                  className="text-pink-500 hover:text-pink-700 cursor-pointer w-full text-center py-2"
                  onClick={() => onWordClick(explanation)}
                >
                  {explanation.word}
                </button>
              </li>
            ))}
            {/* Skeleton items for empty spaces */}
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <li key={`skeleton-${index}`} className="py-2 flex justify-center">
                <Skeleton className="h-6 w-3/4 animate-pulse" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 ? onPageChange(page - 1) : undefined}
                  isActive={page <= 1}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages ? onPageChange(page + 1) : undefined}
                  isActive={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {isAddOpen && (
        <AddExplanationDialog
          isAddOpen={isAddOpen}
          onOpenChange={(isOpen) => setIsAddOpen(isOpen)}
        />
      )}
    </div>
  );
}

interface AddExplanationDialogProps {
  isAddOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddExplanationDialog = (props: AddExplanationDialogProps) => {
  const { isAddOpen, onOpenChange } = props;

  const navigate = Route.useNavigate();
  const router = useRouter();

  const [explanation, setExplanation] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Is Adding:", explanation);
    if (isAdding) return;
    if (explanation.trim() === "") return;

    try {
      setIsAdding(true);
      const data = await createExplanation({
        word: explanation.trim(),
      });
      await router.invalidate();
      await navigate({
        to: "/explanations/$explanationId",
        params: { explanationId: data._id },
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling...
    }
  };

  return (
    <Dialog open={isAddOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Lägg till förklaring</DialogTitle>
        <form onSubmit={onAdd}>
          <div className="grid grid-cols-1 gap-4">
            <label htmlFor="word" className="block mb-2 text-sm font-medium">
              Förklaring
            </label>
            <input
              id="word"
              name="word"
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:outline-none dark:focus:border-blue-600 dark:focus:ring-blue-600"
            />
            <Button disabled={!explanation || isAdding} type="submit">
              {isAdding && <Loader2 className="animate-spin animate-in" />}
              Lägg till
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
