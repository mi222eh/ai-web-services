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
});

export const Route = createFileRoute("/explanations")({
  component: RouteComponent,
  validateSearch: zodValidator(searchParam),
  loaderDeps: (opts) => ({ query: opts.search.query }),
  beforeLoad: (ctx) => {
    return {
      getExplanations: async () => {
        const response = await fetchExplanations();
        let list: Explanation[] = response;
        return list;
      },
    };
  },
  loader: async (args) => {
    let list: Explanation[] = await fetchExplanations();
    if (!list) list = [];
    if (args.deps.query) {
      const query = args.deps.query.toLowerCase();
      // Fuzzy search with Levenshtein distance
      list = list
        .filter((explanation) => {
          const word = explanation.word.toLowerCase();
          const content =
            explanation.entries[0]?.explanation.toLowerCase() || "";

          // Check for exact substring matches first
          if (word.includes(query) || content.includes(query)) {
            return true;
          }

          // Fall back to fuzzy matching
          const wordDistance = levenshteinDistance(query, word);
          const contentDistance = levenshteinDistance(query, content);

          // Allow matches within reasonable distance threshold
          const threshold = Math.max(2, Math.floor(query.length / 3));
          return wordDistance <= threshold || contentDistance <= threshold;
        })
        .sort((a, b) => {
          // Sort by word relevance
          const distA = levenshteinDistance(query, a.word.toLowerCase());
          const distB = levenshteinDistance(query, b.word.toLowerCase());
          return distA - distB;
        });
    }
    return list;
  },
});

function RouteComponent() {
  const explanations = Route.useLoaderData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const searchQuery = Route.useSearch().query;

  const onOpenAdd = () => setIsAddOpen(true);
  const navigate = Route.useNavigate();

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    navigate({
      search: {
        query: e.target.value.toLowerCase(),
      },
    });
  };

  const onWordClick = (word: Explanation) => {
    navigate({
      to: "/explanations/$explanationId",
      params: { explanationId: word._id },
    });
  };

  return (
    <div className="p-4">
      <div className="p-2 flex gap-2 text-lg justify-center items-center">
        <Outlet />
      </div>

      <div>
        <div className="w-full justify-center justify-items-center flex-col">
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
          <ul className="gap-4 flex-col justify-items-center w-fit mt-4">
            {explanations.map((explanation) => (
              <li key={explanation._id} className="w-full pt-2">
                <button
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                  onClick={() => onWordClick(explanation)}
                >
                  {explanation.word}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {isAddOpen && (
          <AddExplanationDialog
            isAddOpen={isAddOpen}
            onOpenChange={(isOpen) => setIsAddOpen(isOpen)}
          />
        )}
      </div>
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
