import { Synonym } from "@/types/models";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/synonyms/$synonymId")({
  component: RouteComponent,
  loader: async (args) => {
    return fetch("/api/synonyms/" + args.params.synonymId).then((res) =>
      res.json()
    ) as Promise<Synonym>;
  },
});

function RouteComponent() {
  const synonym = Route.useLoaderData();

  return (
    <div className="container border-2 border-gray-400 p-8 mt-8">
      <h1>Fras: {synonym.word}</h1>
      <p>Synonymer: {synonym.synonyms.join(", ")}</p>
      <p>
        Förklaring:{" "}
        <span dangerouslySetInnerHTML={{ __html: synonym.explanation }}></span>
      </p>
    </div>
  );
}
