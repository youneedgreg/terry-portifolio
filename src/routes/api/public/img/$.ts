import { createFileRoute } from "@tanstack/react-router";
import { getFileUrl } from "@/integrations/appwrite/client";

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const url = getFileUrl(path);
        return Response.redirect(url, 302);
      },
    },
  },
});
