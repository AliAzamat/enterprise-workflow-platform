// ONE typed client for the gateway. Every component talks to the platform
// through this — no component hardcodes a URL or rebuilds a fetch. The auth
// token is attached here, once, for every request.
const ENDPOINT = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:8000/graphql";

export async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  // GraphQL returns 200 with an `errors` array — surface it, don't ignore it.
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}
