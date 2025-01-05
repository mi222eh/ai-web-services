import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Synonym } from "@/types/models";
import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Function to calculate Levenshtein distance for fuzzy matching
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

export const Route = createFileRoute("/synonyms")({
  component: RouteComponent,
  validateSearch: zodValidator(searchParam),
  loaderDeps: (opts) => ({ query: opts.search.query }),
  beforeLoad: (ctx) => {
    return {
      getSynonyms: async () => {
        const response = await fetch("/api/synonyms");
        let list: Synonym[] = await response.json();
        return list;
      },
    };
  },
  loader: async (args) => {
    let list: Synonym[] = await fetch("/api/synonyms").then((res) =>
      res.json()
    );
    if (args.deps.query) {
      const query = args.deps.query.toLowerCase();
      // Fuzzy search with Levenshtein distance
      list = list
        .filter((s) => {
          const distance = levenshteinDistance(s.word.toLowerCase(), query);
          // Allow matches within a certain distance threshold (adjust as needed)
          const threshold = Math.max(2, Math.floor(query.length * 0.3));
          return distance <= threshold;
        })
        .sort((a, b) => {
          // Sort by Levenshtein distance to show best matches first
          const distA = levenshteinDistance(a.word.toLowerCase(), query);
          const distB = levenshteinDistance(b.word.toLowerCase(), query);
          return distA - distB;
        });
    }
    return list;
  },
});

function RouteComponent() {
  const synonyms = Route.useLoaderData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Synonym | null>(null);
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

  const onWordClick = (word: Synonym) => {
    setSelectedWord(word);
  };

  return (
    <div className="p-4">
      <div>
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
            {/* Only show the "Add" text if there's a search query */}
            {searchQuery && (
              <button
                onClick={onOpenAdd}
                className="text-pink-500 text-sm hover:text-pink-700 hover:underline cursor-pointer animate-in fade-in duration-200"
              >
                hittar inte? lägg till!
              </button>
            )}
          </div>
          <ul className="gap-4 flex-col justify-items-center w-fit mt-4">
            {synonyms.map((synonym) => (
              <li key={synonym._id} className="w-full pt-2">
                <button
                  className="text-pink-500 hover:text-pink-700 cursor-pointer"
                  onClick={() => onWordClick(synonym)}
                >
                  {synonym.word}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {isAddOpen && (
          <AddSynonymDialog
            isAddOpen={isAddOpen}
            onOpenChange={(isOpen) => setIsAddOpen(isOpen)}
          />
        )}
        {selectedWord && (
          <Dialog
            open={!!selectedWord}
            onOpenChange={() => setSelectedWord(null)}
          >
            <DialogContent className="sm:max-w-md">
              <DialogTitle>{selectedWord.word}</DialogTitle>
              <p className="text-gray-600">Details about the word...</p>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

interface AddSynonymDialogProps {
  isAddOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AddSynonymDialog = (props: AddSynonymDialogProps) => {
  const { isAddOpen, onOpenChange } = props;

  const navigate = Route.useNavigate();
  const router = useRouter();

  const [synonym, setSynonym] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Is Adding:", synonym);
    if (isAdding) return;
    if (synonym.trim() === "") return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/synonyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: synonym.trim() }),
      });
      const data = (await response.json()) as Synonym;
      await router.invalidate();
      await navigate({
        to: "/synonyms/$synonymId",
        params: { synonymId: data._id },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding synonym:", error);
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isAddOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Lägg till synonym</DialogTitle>
        <form onSubmit={onAdd}>
          <div className="grid grid-cols-1 gap-4">
            <label htmlFor="word" className="block mb-2 text-sm font-medium">
              Synonym
            </label>
            <input
              id="word"
              name="word"
              type="text"
              value={synonym}
              onChange={(e) => setSynonym(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:outline-none dark:focus:border-blue-600 dark:focus:ring-blue-600"
            />
            <Button disabled={!synonym || isAdding} type="submit">
              {isAdding && <Loader2 className="animate-spin animate-in" />}
              Lägg till
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
