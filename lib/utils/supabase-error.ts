// supabase-js não repassa o corpo da resposta de erro das Edge Functions em
// error.message (só um texto genérico tipo "non-2xx status code") — o corpo
// real vem em error.context, que é o Response cru.
export async function resolveFunctionError(error: unknown): Promise<Error> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: Response }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (body?.error) return new Error(body.error as string);
      } catch {
        // corpo não era JSON, cai no fallback abaixo
      }
    }
  }
  return error instanceof Error ? error : new Error("Erro desconhecido");
}
