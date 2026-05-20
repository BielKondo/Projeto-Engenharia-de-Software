/**
 * INPUT MONETÁRIO COM PREVIEW
 * ============================================================
 * Componente reutilizável para campos de valor (R$, $, €).
 *
 * O usuário digita o número simples (ex: "10000" ou "1234.5"). Abaixo do
 * campo aparece em tempo real o valor formatado no idioma escolhido:
 *
 *   pt-BR:  10000      →  = R$ 10.000,00
 *   en-US:  10000      →  = $10,000.00
 *   es-ES:  10000      →  = 10.000,00 €
 *
 * Esse preview ajuda o usuário a entender ordens de grandeza grandes
 * (diferença entre R$ 10.000 e R$ 100.000 é fácil de errar com zeros).
 *
 * O valor numérico é exposto via prop onChange (number); a string digitada
 * é controlada externamente via value/onValueChange (string).
 */
"use client";

import { useI18n } from "@/state/i18n";
import { classNames } from "@/utils/format";

interface Props {
  /** Texto bruto digitado pelo usuário (controlado externamente) */
  value: string;
  /** Callback chamado com a string bruta digitada (sem formatação) */
  onValueChange: (s: string) => void;
  placeholder?: string;
  /** Se preenchido, marca o campo com borda de erro */
  erro?: string;
  /** Texto adicional abaixo do preview (ex: "Saldo disponível: R$ 1.000") */
  ajuda?: string;
  /** Mostra o preview formatado abaixo (default: true) */
  mostrarPreview?: boolean;
  className?: string;
  /** Permite passar outras props nativas do input */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "className" | "placeholder"
  >;
}

export function MoneyInput({
  value,
  onValueChange,
  placeholder = "0",
  erro,
  ajuda,
  mostrarPreview = true,
  className,
  inputProps,
}: Props) {
  const { formatarMoeda } = useI18n();

  // Sanitiza: aceita apenas dígitos e UM separador decimal (ponto ou vírgula).
  // Internamente normaliza para o formato JS (ponto).
  const handleChange = (raw: string) => {
    // Permite vazio
    if (raw === "") {
      onValueChange("");
      return;
    }
    // Remove tudo que não é dígito, ponto ou vírgula
    let limpo = raw.replace(/[^\d.,]/g, "");
    // Se tem vírgula E ponto, mantém só o último separador (assume que o
    // último é o decimal)
    const ultimaVirgula = limpo.lastIndexOf(",");
    const ultimoPonto = limpo.lastIndexOf(".");
    if (ultimaVirgula >= 0 && ultimoPonto >= 0) {
      // Remove o separador mais antigo (provavelmente milhares)
      const indexMaisAntigo = Math.min(ultimaVirgula, ultimoPonto);
      limpo = limpo.slice(0, indexMaisAntigo) + limpo.slice(indexMaisAntigo + 1);
    }
    // Normaliza vírgula para ponto (formato interno consistente)
    limpo = limpo.replace(",", ".");
    // Permite no máximo um ponto
    const partes = limpo.split(".");
    if (partes.length > 2) {
      limpo = partes[0] + "." + partes.slice(1).join("");
    }
    onValueChange(limpo);
  };

  // Converte o texto digitado num número para preview
  const numero = parseFloat(value);
  const numeroValido = !isNaN(numero) && numero > 0;

  return (
    <div className={className}>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={classNames(
          "w-full bg-navy-800 border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors",
          erro
            ? "border-down focus:ring-down/20 focus:border-down"
            : "border-rule focus:border-brand focus:ring-brand/20",
        )}
        {...inputProps}
      />

      {/* Preview formatado abaixo do campo */}
      {mostrarPreview && numeroValido && (
        <div className="text-[11px] text-brand mt-1.5 font-medium">
          = {formatarMoeda(numero)}
        </div>
      )}

      {/* Texto de ajuda opcional (ex: "Saldo disponível: R$ 1.000") */}
      {!erro && ajuda && (
        <div className="text-[11px] text-ink-muted mt-1">{ajuda}</div>
      )}

      {/* Mensagem de erro */}
      {erro && <div className="text-xs text-down mt-1">{erro}</div>}
    </div>
  );
}
