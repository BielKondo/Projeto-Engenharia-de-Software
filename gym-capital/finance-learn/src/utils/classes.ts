/**
 * CONCATENADOR DE CLASSES CSS
 * ============================================================
 * Aceita vários nomes de classe (incluindo condicionais) e junta
 * num só string, ignorando valores falsos.
 *
 * Exemplo:
 *   classNames("btn", isAtivo && "btn-ativo", null, "padded")
 *   → "btn btn-ativo padded"
 *
 * Útil pra aplicar classes condicionalmente sem `if`s no JSX.
 */
export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
