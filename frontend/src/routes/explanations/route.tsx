import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Explanation } from "@/types/models";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2, Plus } from "lucide-react";
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
  const navigate = Route.useNavigate();
  const [isAdding, setIsAdding] = useState(false);

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

  const onAdd = async () => {
    if (isAdding || !query.trim()) return;
    
    const searchTerm = query.trim().toLowerCase();
    const exists = explanations.some(exp => exp.word.toLowerCase() === searchTerm);
    
    if (!exists) {
      try {
        setIsAdding(true);
        const data = await createExplanation({
          word: searchTerm,
        });
        await navigate({
          to: "/explanations/$explanationId",
          params: { explanationId: data._id },
        });
      } catch (error) {
        console.error('Failed to create explanation:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const onSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const searchTerm = e.currentTarget.value.trim().toLowerCase();
      
      // Check if word exists in current results
      const exists = explanations.some(exp => exp.word.toLowerCase() === searchTerm);
      
      if (!exists) {
        try {
          const data = await createExplanation({
            word: searchTerm,
          });
          await navigate({
            to: "/explanations/$explanationId",
            params: { explanationId: data._id },
          });
        } catch (error) {
          console.error('Failed to create explanation:', error);
        }
      }
    }
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
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Sök"
                onChange={onSearch}
                onKeyDown={onSearchKeyDown}
                value={query}
                className="border rounded-full px-6 py-3 text-base shadow-sm focus:ring-2 focus:ring-pink-500 w-80"
              />
              <Button 
                size="icon"
                disabled={!query.trim() || isAdding}
                onClick={onAdd}
                className="rounded-full h-12 w-12 flex items-center justify-center"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
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
    </div>
  );
}
