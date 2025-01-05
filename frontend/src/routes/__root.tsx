import * as React from "react";
import {
  Link,
  Outlet,
  createRootRoute,
  linkOptions,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const links = [
  linkOptions({
    to: "/synonyms",
    label: "Synonymer",
  }),
  // linkOptions({
  //   to: "/explanations",
  //   label: "Förklaringar",
  // }),
];

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="p-2 flex gap-2 text-lg justify-center items-center">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeProps={{
              className: "font-bold text underline",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <hr />
      <div className="flex justify-center items-center p-4">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
