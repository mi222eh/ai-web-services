import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Explanation } from "@/types/models";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useExplanations, useCreateExplanation } from "@/api/explanations";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const searchParam = z.object({
  query: z.string().default("").catch(""),
  page: z.number().default(1).catch(1),
  limit: z.number().default(10).catch(10),
});

export const Route = createFileRoute("/explanations")({
  component: RouteComponent,
  validateSearch: zodValidator(searchParam),
});

function RouteComponent() {
  const { page, limit, query } = Route.useSearch();
  const navigate = Route.useNavigate();
  const skip = (page - 1) * limit;

  const { data, isLoading } = useExplanations(skip, limit, query);
  const createMutation = useCreateExplanation();

  const explanations = data?.items ?? [];
  const total = data?.total ?? 0;
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
    if (createMutation.isPending || !query.trim()) return;
    
    const searchTerm = query.trim().toLowerCase();
    const exists = explanations.some(exp => exp.word.toLowerCase() === searchTerm);
    
    if (!exists) {
      try {
        const data = await createMutation.mutateAsync({
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
  };

  const onSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const searchTerm = e.currentTarget.value.trim().toLowerCase();
      
      // Check if word exists in current results
      const exists = explanations.some(exp => exp.word.toLowerCase() === searchTerm);
      
      if (!exists) {
        try {
          const data = await createMutation.mutateAsync({
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
                disabled={!query.trim() || createMutation.isPending}
                onClick={onAdd}
                className="rounded-full h-12 w-12 flex items-center justify-center"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <ul className="w-full space-y-2">
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => (
                <li key={`loading-${index}`} className="py-2 flex justify-center">
                  <Skeleton className="h-6 w-3/4 animate-pulse" />
                </li>
              ))
            ) : (
              <>
                {explanations.map((explanation) => (
                  <li key={explanation._id}>
                    <button
                      className="text-pink-500 hover:text-pink-700 cursor-pointer w-full text-center py-2"
                      onClick={() => onWordClick(explanation)}
                    >
                      {explanation.word}
                      {explanation.entries.length === 0 && (
                        <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />
                      )}
                    </button>
                  </li>
                ))}
                {/* Skeleton items for empty spaces */}
                {Array.from({ length: skeletonCount }).map((_, index) => (
                  <li key={`skeleton-${index}`} className="py-2 flex justify-center">
                    <Skeleton className="h-6 w-3/4 animate-pulse" />
                  </li>
                ))}
              </>
            )}
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
