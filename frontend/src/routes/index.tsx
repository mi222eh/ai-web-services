import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-2">
      <h3>Välkommen!</h3>
      <p>Här kan du hitta synonymer och förklaringar.</p>
    </div>
  );
}
