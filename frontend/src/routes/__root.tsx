import { Link, Outlet, useLocation, createRootRoute } from "@tanstack/react-router"
import "../app.css"

function RootComponent() {
  const location = useLocation()
  const isHome = location.pathname === "/"

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link
              to="/"
              className={`mr-6 flex items-center space-x-2 ${
                isHome ? "text-foreground" : "text-foreground/60 hover:text-foreground/80"
              }`}
            >
              <span className="hidden font-bold sm:inline-block">AI Web Services</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/explanations"
                className={
                  location.pathname === "/explanations"
                    ? "text-foreground"
                    : "text-foreground/60 hover:text-foreground/80"
                }
              >
                Förklaringar
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
