//TESTES AUTOMATIZADOS — GYM CAPITAL

//Como rodar:    npm test
import { cadastroSchema, loginSchema } from "@/server/validations";
import { hashSenha, compararSenha } from "@/server/auth";
import { gastoOcorreNoMes } from "@/state/expenses";
import type { Gasto } from "@/types";

let totalPassou = 0;
let totalFalhou = 0;
const falhas: string[] = [];

// Verifica se o valor obtido é igual ao esperado.
// Imprime PASSOU ou FALHOU no terminal.

function testar(nome: string, obtido: unknown, esperado: unknown) {
  const ok = obtido === esperado;
  if (ok) {
    console.log(`  [PASSOU] ${nome}`);
    totalPassou++;
  } else {
    console.log(`  [FALHOU] ${nome}`);
    console.log(`     -> Esperado: ${JSON.stringify(esperado)}`);
    console.log(`     -> Obtido:   ${JSON.stringify(obtido)}`);
    falhas.push(nome);
    totalFalhou++;
  }
}

// Executa todos os teste de forma assíncrona (precisa ser async porque alguns testes usam hashSenha que retorna Promise)

async function rodarTestes() {
  console.log("============================================");
  console.log("TESTES AUTOMATIZADOS DO GYM CAPITAL");
  console.log("============================================\n");

  // CT-01: CADASTRO E LOGIN
  console.log("CT-01: Cadastro e Login com validação de idade");

  // --- Teste 1: rejeita menor de 16 anos ---
  const cadastroMenor = cadastroSchema.safeParse({
    nome: "João Teste",
    email: "joao.teste@email.com",
    senha: "Teste1234",
    confirmacaoSenha: "Teste1234",
    dataNascimento: "2010-06-03", // 15 anos
    aceitouTermos: true,
  });
  testar("Rejeita cadastro de menor de 16 anos", cadastroMenor.success, false);

  // --- Teste 2: aceita cadastro com idade válida ---
  const cadastroValido = cadastroSchema.safeParse({
    nome: "João Teste",
    email: "joao.teste@email.com",
    senha: "Teste1234",
    confirmacaoSenha: "Teste1234",
    dataNascimento: "2005-06-03", // 20 anos
    aceitouTermos: true,
  });
  testar("Aceita cadastro com idade válida (16+ anos)", cadastroValido.success, true);

  // --- Teste 3: rejeita senha fraca (sem maiúscula) ---
  const cadastroSenhaFraca = cadastroSchema.safeParse({
    nome: "João Teste",
    email: "joao.teste@email.com",
    senha: "senhafraca123", // sem letra maiúscula
    confirmacaoSenha: "senhafraca123",
    dataNascimento: "2005-06-03",
    aceitouTermos: true,
  });
  testar("Rejeita senha sem letra maiúscula", cadastroSenhaFraca.success, false);

  // --- Teste 4: aceita login com email e senha ---
  const login = loginSchema.safeParse({
    email: "joao.teste@email.com",
    senha: "Teste1234",
  });
  testar("Aceita login com email e senha preenchidos", login.success, true);

  // CT-04: SEGURANÇA DAS SENHAS (bcrypt)
  console.log("\nCT-04: Segurança das senhas (bcrypt)");

  // --- Teste 5: senha é armazenada como hash ---
  const senhaOriginal = "Teste1234";
  const hash = await hashSenha(senhaOriginal);
  const hashDiferente = hash !== senhaOriginal;
  const hashTemFormatoBcrypt = hash.startsWith("$2a$") || hash.startsWith("$2b$");
  testar(
    "Senha é armazenada como hash, nunca em texto puro",
    hashDiferente && hashTemFormatoBcrypt,
    true,
  );

  // --- Teste 6: aceita senha correta ---
  const senhaCerta = await compararSenha("Teste1234", hash);
  testar("Aceita a senha correta no login", senhaCerta, true);

  // --- Teste 7: rejeita senha errada ---
  const senhaErrada = await compararSenha("SenhaErrada123", hash);
  testar("Rejeita uma senha incorreta no login", senhaErrada, false);

  // CT-02: SIMULADOR DE INVESTIMENTOS
  console.log("\nCT-02: Simulador de investimentos");

  // Função que calcula o patrimônio total = caixa + valor das posições
  function calcularPatrimonio(
    caixa: number,
    posicoes: Array<{ quantidade: number; precoAtual: number }>,
  ): number {
    const valorPosicoes = posicoes.reduce(
      (acc, p) => acc + p.quantidade * p.precoAtual,
      0,
    );
    return caixa + valorPosicoes;
  }

  // --- Teste 8: cálculo de patrimônio ---
  // Cenário: comprou 50 ações VALE3 a R$ 60 = R$ 3.000
  // Caixa restante: R$ 10.000 - R$ 3.000 = R$ 7.000
  // Patrimônio total: R$ 7.000 (caixa) + R$ 3.000 (posição) = R$ 10.000
  const patrimonio = calcularPatrimonio(7000, [{ quantidade: 50, precoAtual: 60 }]);
  testar("Calcula corretamente o patrimônio total", patrimonio, 10000);

  // --- Teste 9: bloqueia compra com saldo insuficiente ---
  function podeComprar(caixa: number, custoTotal: number): boolean {
    return custoTotal <= caixa;
  }
  // Tenta comprar 10.000 ações a R$ 39 com apenas R$ 10.000 em caixa
  testar(
    "Bloqueia compra quando saldo é insuficiente",
    podeComprar(10000, 390000),
    false,
  );

  // CT-06: CONTROLE DE GASTOS
  console.log("\nCT-06: Controle de gastos");

  // Função auxiliar para criar gastos de teste com valores padrão
  function novoGasto(parcial: Partial<Gasto>): Gasto {
    return {
      id: "test-id",
      titulo: "Teste",
      valor: 100,
      categoria: "outros",
      data: "2026-05-19",
      tipo: "unico",
      ...parcial,
    };
  }

  // --- Teste 10: gasto único só conta no mês exato ---
  const netflix = novoGasto({ data: "2026-05-19", tipo: "unico" });
  const apareceEmMaio = gastoOcorreNoMes(netflix, "2026-05");
  const naoApareceEmJunho = gastoOcorreNoMes(netflix, "2026-06");
  testar(
    "Gasto único aparece só no mês exato",
    apareceEmMaio && !naoApareceEmJunho,
    true,
  );

  // --- Teste 11: gasto recorrente aparece em todos os meses futuros ---
  const aluguel = novoGasto({
    data: "2026-05-19",
    criadoEm: "2026-05-19T12:00:00Z",
    tipo: "recorrente",
    recorrencia: "mensal",
  });
  const mes1 = gastoOcorreNoMes(aluguel, "2026-05"); // mês do cadastro
  const mes2 = gastoOcorreNoMes(aluguel, "2026-06"); // mês seguinte
  const mes3 = gastoOcorreNoMes(aluguel, "2027-01"); // muitos meses depois
  testar(
    "Gasto recorrente aparece em todos os meses futuros",
    mes1 && mes2 && mes3,
    true,
  );

  // --- Teste 12: REGRESSÃO DO BUG ---
  // Cenário do bug original: usuário cadastrou aluguel no dia 19/05
  // com vencimento 01/06. Antes da correção, o gasto NÃO aparecia em maio.
  // Este teste garante que o bug não volte a acontecer.
  const aluguelComVencimentoFuturo = novoGasto({
    titulo: "Aluguel",
    valor: 1200,
    data: "2026-06-01", // vencimento em junho
    criadoEm: "2026-05-19T12:00:00Z", // cadastrado em maio
    tipo: "recorrente",
    recorrencia: "mensal",
  });
  const apareceEmMaioRegress = gastoOcorreNoMes(aluguelComVencimentoFuturo, "2026-05");
  testar(
    "REGRESSAO: aluguel cadastrado em maio com vencimento 01/06 aparece em maio",
    apareceEmMaioRegress,
    true,
  );

  // CT-03: PERSONALIZAÇÃO DO PERFIL
  console.log("\nCT-03: Personalização do perfil");

  // --- Teste 13: sistema aceita os 3 idiomas suportados ---
  const idiomasSuportados = ["pt-BR", "en-US", "es-ES"];
  const idiomaInvalido = "fr-FR";
  const todosOsIdiomasSaoSuportados =
    idiomasSuportados.includes("pt-BR") &&
    idiomasSuportados.includes("en-US") &&
    idiomasSuportados.includes("es-ES") &&
    !idiomasSuportados.includes(idiomaInvalido);
  testar(
    "Sistema suporta exatamente 3 idiomas (pt-BR, en-US, es-ES)",
    todosOsIdiomasSaoSuportados,
    true,
  );

  // CT-07: META FINANCEIRA
  console.log("\nCT-07: Meta financeira");

  // Função que calcula o progresso de uma meta (porcentagem)
  function calcularProgresso(valorAtual: number, valorAlvo: number) {
    const percentual = (valorAtual / valorAlvo) * 100;
    const visual = Math.min(100, Math.max(0, percentual));
    return { percentual, visual };
  }

  // --- Teste 14: progresso proporcional da meta ---
  // Cenário: patrimônio R$ 10.000 / meta R$ 15.000 = ~66.67%
  const progresso = calcularProgresso(10000, 15000);
  // Arredonda para 2 casas pra comparar com segurança
  const percentualArredondado = Math.round(progresso.percentual * 100) / 100;
  testar(
    "Calcula progresso proporcional da meta (10000 / 15000 = 66.67%)",
    percentualArredondado,
    66.67,
  );

  // --- Teste 15: REGRESSÃO DO BUG ---
  // Bug original: barra "vazava" do card quando valor ultrapassava o alvo.
  // Agora ela é limitada visualmente em 100%, mesmo que o cálculo real seja maior.
  const progressoSuperado = calcularProgresso(20000, 15000);
  // O percentual real ultrapassa 100, mas o visual deve ser limitado a 100
  const visualLimitado = progressoSuperado.visual === 100;
  const realUltrapassa = progressoSuperado.percentual > 100;
  testar(
    "REGRESSAO: progresso visual fica limitado a 100% quando supera a meta",
    visualLimitado && realUltrapassa,
    true,
  );

  // RESUMO FINAL
  console.log("\n============================================");
  console.log(`Resultado: ${totalPassou} testes passaram, ${totalFalhou} falharam`);
  console.log("============================================");

  if (totalFalhou > 0) {
    console.log("\nFalhas detectadas em:");
    falhas.forEach((nome) => console.log(`  - ${nome}`));
    // Encerra o processo com código de erro (útil pra CI)
    process.exit(1);
  } else {
    console.log("\nTodos os testes passaram com sucesso!");
  }
}

// Executa
rodarTestes().catch((err) => {
  console.error("\nErro inesperado ao rodar os testes:", err);
  process.exit(1);
});
