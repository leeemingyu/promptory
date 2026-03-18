import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

type RouteContext = {
  params:
    | {
        path?: string[];
      }
    | Promise<{
        path?: string[];
      }>;
};

async function proxyRequest(request: Request, context: RouteContext) {
  if (!API_URL) {
    return new Response("API_URL is not configured.", { status: 500 });
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const resolvedParams = await Promise.resolve(context.params);
  const path = (resolvedParams.path ?? []).join("/");
  const base = API_URL.replace(/\/+$/, "");
  const targetUrl = new URL(`${base}/${path}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("content-length");
  headers.set("authorization", `Bearer ${session.access_token}`);

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("set-cookie");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
