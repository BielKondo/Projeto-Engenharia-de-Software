import { z } from "zod";

// Regex para senha forte: mínimo 8, uma maiúscula, uma minúscula, um número
const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email obrigatório")
    .email("Email inválido")
    .toLowerCase(),
  senha: z.string().min(1, "Senha obrigatória"),
});

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
      .regex(
        SENHA_FORTE_REGEX,
        "Senha precisa ter maiúscula, minúscula e número",
      ),
    confirmacaoSenha: z.string(),
    dataNascimento: z
      .string()
      .min(1, "Data de nascimento obrigatória")
      .refine((s) => {
        const d = new Date(s);
        if (isNaN(d.getTime())) return false;
        const hoje = new Date();
        const idade = hoje.getFullYear() - d.getFullYear();
        const aniversarioPassou =
          hoje.getMonth() > d.getMonth() ||
          (hoje.getMonth() === d.getMonth() && hoje.getDate() >= d.getDate());
        const idadeReal = aniversarioPassou ? idade : idade - 1;
        return idadeReal >= 16 && idadeReal <= 120;
      }, "Você precisa ter pelo menos 16 anos"),
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

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
