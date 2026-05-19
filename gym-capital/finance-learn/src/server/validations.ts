/**
 * VALIDAÇÃO DE FORMULÁRIOS (LOGIN, CADASTRO E EDIÇÃO DE PERFIL)
 * ============================================================
 * Usamos Zod para garantir que os dados que chegam ao servidor
 * via POST/PUT estão no formato esperado. Se algo estiver errado,
 * retornamos uma mensagem clara para o usuário.
 *
 * Estes schemas são usados:
 *   - No FRONTEND, antes de enviar (validação rápida)
 *   - No BACKEND, ao receber (segurança real)
 */
import { z } from "zod";

/** Mínimo 8 chars, com maiúscula, minúscula e número */
const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/** Idade mínima permitida no app */
export const IDADE_MINIMA = 16;
export const IDADE_MAXIMA = 120;

/**
 * Valida se uma data ISO representa uma idade dentro dos limites permitidos.
 * Considera se o aniversário do ano atual já passou.
 */
function dataNascimentoValida(s: string): boolean {
  const d = new Date(s);
  if (isNaN(d.getTime())) return false;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const aniversarioPassou =
    hoje.getMonth() > d.getMonth() ||
    (hoje.getMonth() === d.getMonth() && hoje.getDate() >= d.getDate());
  if (!aniversarioPassou) idade--;
  return idade >= IDADE_MINIMA && idade <= IDADE_MAXIMA;
}

/** Schema usado no endpoint /api/auth/login */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Email inválido")
    .toLowerCase(),
  senha: z.string().min(1, "Senha obrigatória"),
});

/** Schema usado no endpoint /api/auth/cadastro */
export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(80, "Nome muito longo")
      .regex(/^[\p{L}\s'-]+$/u, "Nome só pode conter letras e espaços"),
    email: z
      .string()
      .min(1, "Email obrigatório")
      .email("Email inválido")
      .toLowerCase(),
    senha: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(SENHA_FORTE_REGEX, "Senha precisa ter maiúscula, minúscula e número"),
    confirmacaoSenha: z.string(),
    dataNascimento: z
      .string()
      .min(1, "Data de nascimento obrigatória")
      .refine(
        dataNascimentoValida,
        `Você precisa ter pelo menos ${IDADE_MINIMA} anos`,
      ),
    cpf: z
      .string()
      .optional()
      .refine((s) => !s || /^\d{11}$/.test(s.replace(/\D/g, "")), {
        message: "CPF deve ter 11 dígitos",
      }),
    aceitouTermos: z.literal(true, {
      errorMap: () => ({
        message: "Você precisa aceitar os termos para continuar",
      }),
    }),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: "Senhas não conferem",
    path: ["confirmacaoSenha"],
  });

/**
 * Schema usado no endpoint PUT /api/auth/me (editar perfil).
 * Senha NÃO entra aqui — caso queira editar senha, criar endpoint separado.
 */
export const editarPerfilSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(80, "Nome muito longo")
    .regex(/^[\p{L}\s'-]+$/u, "Nome só pode conter letras e espaços"),
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Email inválido")
    .toLowerCase(),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .refine(
      dataNascimentoValida,
      `Você precisa ter pelo menos ${IDADE_MINIMA} anos`,
    ),
  idioma: z.enum(["pt-BR", "en-US", "es-ES"]).optional(),
  moeda: z.enum(["BRL", "USD", "EUR"]).optional(),
  avatarUrl: z
    .string()
    .max(2_000_000, "Imagem muito grande (máximo ~1.5MB)")
    .nullable()
    .optional(),
});

/**
 * Schema usado no endpoint PUT /api/auth/senha (alterar senha).
 */
export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual obrigatória"),
    novaSenha: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(SENHA_FORTE_REGEX, "Senha precisa ter maiúscula, minúscula e número"),
    confirmacaoSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmacaoSenha, {
    message: "Senhas não conferem",
    path: ["confirmacaoSenha"],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>;
