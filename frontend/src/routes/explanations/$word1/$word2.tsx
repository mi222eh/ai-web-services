import { createFileRoute } from "@tanstack/react-router";
import { NuanceAnalysis } from "../../../components/nuance-analysis";

export const Route = createFileRoute("/explanations/$word1/$word2")({
  component: RouteComponent,
});

function RouteComponent() {
  const { word1, word2 } = Route.useParams();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Nyansanalys</h1>
      <NuanceAnalysis word1={word1} word2={word2} />
    </div>
  );
} 