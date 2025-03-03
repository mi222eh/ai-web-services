import { useQuery } from "@tanstack/react-query";
import { analyzeNuances, type SynonymNuance } from "../api/explanations";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface NuanceAnalysisProps {
  explanationId1: string;
  explanationId2: string;
}

export function NuanceAnalysis({ explanationId1, explanationId2 }: NuanceAnalysisProps) {
  const { data: nuance, isLoading, error } = useQuery<SynonymNuance>({
    queryKey: ["nuances", explanationId1, explanationId2],
    queryFn: () => analyzeNuances(explanationId1, explanationId2),
    enabled: !!explanationId1 && !!explanationId2,
  });

  const getFormalityText = (level: SynonymNuance["formality_level"]) => {
    switch (level) {
      case "word1_more_formal":
        return `"${nuance?.word1}" är mer formellt`;
      case "word2_more_formal":
        return `"${nuance?.word2}" är mer formellt`;
      case "equally_formal":
        return "Lika formella";
    }
  };

  const getEmotionalText = (weight: SynonymNuance["emotional_weight"]) => {
    switch (weight) {
      case "word1_stronger":
        return `"${nuance?.word1}" är emotionellt starkare`;
      case "word2_stronger":
        return `"${nuance?.word2}" är emotionellt starkare`;
      case "equally_strong":
        return "Lika stark emotionell laddning";
    }
  };

  if (!explanationId1 || !explanationId2) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="text-xl">Analyserar nyanser...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-xl">Något gick fel</CardTitle>
          <CardDescription>Kunde inte analysera nyanserna mellan orden</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!nuance) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Nyansanalys</CardTitle>
        <CardDescription>
          Jämförelse mellan &quot;{nuance.word1}&quot; och &quot;{nuance.word2}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Nyansskillnader</h3>
          <p className="text-muted-foreground">{nuance.nuance_explanation}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Användningsexempel</h3>
          <ul className="list-disc list-inside space-y-2">
            {nuance.usage_examples.map((example, i) => (
              <li key={i} className="text-muted-foreground">{example}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Kontextskillnader</h3>
          <p className="text-muted-foreground">{nuance.context_differences}</p>
        </div>

        <div className="flex gap-4">
          <div>
            <h3 className="font-semibold mb-2">Formalitetsnivå</h3>
            <Badge variant={
              nuance.formality_level === "word1_more_formal" ? "default" :
              nuance.formality_level === "word2_more_formal" ? "secondary" :
              "outline"
            }>
              {getFormalityText(nuance.formality_level)}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Emotionell styrka</h3>
            <Badge variant={
              nuance.emotional_weight === "word1_stronger" ? "destructive" :
              nuance.emotional_weight === "word2_stronger" ? "secondary" :
              "outline"
            }>
              {getEmotionalText(nuance.emotional_weight)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 