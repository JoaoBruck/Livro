export type EvidenceId = "A-01" | "D-01" | "T-01" | "T-02" | "T-03" | "B-12";
export type CharacterId = "DERICK" | "LEROY";
export type EvidenceSide = "front" | "back";
export type EvidencePuzzleKind =
  | "memory"
  | "carbon-recovery"
  | "source-thread"
  | "seat-reconstruction"
  | "folio-reassembly"
  | "timeline";

export type EvidenceField = {
  id: string;
  label: string;
  side: EvidenceSide;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
  requiresLight?: boolean;
  rejection: string;
};

export type EvidenceDefinition = {
  id: EvidenceId;
  title: string;
  shortTitle: string;
  origin: string;
  front: string;
  back: string;
  frontAlt: string;
  backAlt: string;
  landscape?: boolean;
  puzzleKind: EvidencePuzzleKind;
  transcriptFront: string[];
  transcriptBack: string[];
  prompt: string;
  instruction: string;
  fields: EvidenceField[];
  successFeedback: string;
  observations: Partial<Record<CharacterId, string[]>>;
};

export const EVIDENCE_ORDER: EvidenceId[] = ["A-01", "D-01", "T-01", "T-02", "T-03", "B-12"];

export const EVIDENCE: Record<EvidenceId, EvidenceDefinition> = {
  "A-01": {
    id: "A-01",
    title: "Fotografia da festa",
    shortTitle: "Fotografia",
    origin: "Casa-Lar de Candeia // 12/08/2017",
    front: "/images/myu-old-photo.webp",
    back: "/documents/a01-back.webp",
    landscape: true,
    puzzleKind: "memory",
    frontAlt: "Fotografia da festa de 2017. Alana está na extremidade esquerda com uma jaqueta amarela amarrada à cintura. Vicente aparece parcialmente na borda com um molho de chaves. Derick segura Meia; Leroy tem uma bandeirinha no cabelo.",
    backAlt: "Verso envelhecido da fotografia, com 12/08 escrito à mão.",
    transcriptFront: [
      "Fotografia colorida da festa da Casa-Lar.",
      "Alana aparece na extremidade esquerda, com uma jaqueta amarela amarrada à cintura.",
      "Vicente aparece parcialmente na borda esquerda, segurando um molho de chaves.",
      "Derick segura Meia enquanto ela lambe seu rosto. Leroy está atrás das crianças com uma bandeirinha presa no cabelo.",
    ],
    transcriptBack: ["Anotação manuscrita central: 12/08."],
    prompt: "A fotografia não precisa ser resolvida.",
    instruction: "Ela permanece na gaveta como memória e peça de comparação. Vire, aproxime e volte a ela quando outro registro der significado à cor.",
    fields: [
      { id: "jacket", label: "Jaqueta amarela de Alana", side: "front", x: 1.5, y: 50, width: 25, height: 38, required: true, rejection: "A jaqueta oferece cor e material comparáveis a um vestígio." },
      { id: "keys", label: "Molho de chaves de Vicente", side: "front", x: 0.5, y: 43, width: 10, height: 20, rejection: "As chaves localizam Vicente na fotografia, mas não identificam a data nem um material coletável." },
      { id: "flag", label: "Bandeirinha no cabelo de Leroy", side: "front", x: 59, y: 2, width: 12, height: 13, rejection: "A bandeirinha explica uma lembrança da festa; não sustenta a comparação documental." },
      { id: "date", label: "Data manuscrita 12/08", side: "back", x: 31, y: 36, width: 39, height: 26, required: true, rejection: "A anotação fixa a fotografia no mesmo dia dos registros." },
    ],
    successFeedback: "A frente fornece um material possível; o verso fixa o dia. A fotografia apoia a hipótese, mas ainda não identifica a origem da fibra.",
    observations: {
      DERICK: [
        "A foto não começou como prova. Não obriga ela a confessar antes da hora.",
        "A data não está do mesmo lado que os rostos.",
        "Se outra folha falar de material, volta aqui. Cor parecida ainda não é identidade.",
      ],
      LEROY: [
        "Tem coisa nesta foto que eu lembrava sem olhar. Isso não torna nenhuma delas prova.",
        "Vira a fotografia antes de decidir o que ela consegue fixar.",
        "Guarda a cor e o dia. O resto precisa vir de uma fonte que não seja a minha memória.",
      ],
    },
  },
  "D-01": {
    id: "D-01",
    title: "Solicitação de transporte assistencial",
    shortTitle: "Transporte",
    origin: "Histórico de Derick // segunda via carbonada",
    front: "/documents/d01-front.webp",
    back: "/documents/d01-back.webp",
    puzzleKind: "carbon-recovery",
    frontAlt: "Segunda via verde de um formulário assistencial em nome de Derick, emitido em 14 de agosto de 2017. A justificativa informa que a van institucional estava indisponível desde 12 de agosto por colisão. Uma referência a lápis no rodapé foi quase apagada.",
    backAlt: "Verso da segunda via carbonada. Sob luz oblíqua, três trechos da pressão invertida podem ser recuperados: 44, 2180 e TO, nesta ordem visual.",
    transcriptFront: [
      "Rede de Cuidado de Candeia. Formulário TA-04. Protocolo TA-17125-08. Segunda via do beneficiário.",
      "Emitido em 14/08/2017 pela Casa-Lar de Candeia.",
      "Beneficiário: DERICK, 10 anos. Documento anterior à adoção.",
      "Consulta ambulatorial em 15/08/2017, às 08h30. Modalidade solicitada: veículo terceirizado.",
      "Justificativa: veículo institucional indisponível desde 12/08; avaria por colisão; substituição necessária para não interromper o atendimento.",
      "Pagamento: patrocinador cadastrado. Recibo e comprovante anexos.",
      "No rodapé, uma referência acrescentada a lápis foi quase apagada; restam sulcos no papel.",
    ],
    transcriptBack: [
      "Verso da segunda via carbonada. Não há novo registro.",
      "Sob luz oblíqua, a pressão aparece invertida em três trechos, da esquerda para a direita: 44, 2180 e TO.",
    ],
    prompt: "Recupere o que foi apagado sem adivinhar o código.",
    instruction: "A borracha levou o grafite, não a deformação da segunda via. A referência precisa ser reconstruída no sentido em que foi escrita.",
    fields: [
      { id: "beneficiary", label: "Beneficiário: Derick", side: "front", x: 8, y: 24, width: 55, height: 7, rejection: "O nome explica por que a folha está no arquivo de Derick, não por que ela se liga à estrada." },
      { id: "appointment", label: "Consulta: 15/08, 08h30", side: "front", x: 8, y: 34, width: 46, height: 9, rejection: "A consulta explica a necessidade do transporte; ainda não identifica o acontecimento que tirou a van de circulação." },
      { id: "collision", label: "Van indisponível por colisão desde 12/08", side: "front", x: 8, y: 48, width: 84, height: 13, required: true, rejection: "A justificativa fixa a colisão e o dia em que a van deixou de operar." },
      { id: "sponsor", label: "Patrocinador cadastrado", side: "front", x: 8, y: 64, width: 57, height: 8, rejection: "O pagador pertence ao reembolso, mas não cria uma ligação com outro sistema de registro." },
      { id: "occurrence", label: "Anotação a lápis: OT-0812-44", side: "front", x: 65, y: 80, width: 27, height: 10, required: true, requiresLight: true, rejection: "O código foi acrescentado à mão e pode reaparecer fora do arquivo assistencial." },
    ],
    successFeedback: "A colisão explica a substituição da van; OT-0812-44 fornece a ponte para outro arquivo. Separadas, as duas marcas são fracas. Juntas, permitem procurar a ocorrência certa.",
    observations: {
      DERICK: [
        "Meu nome só explica onde a cópia foi parar. O que me incomoda é o trabalho no rodapé.",
        "Apagaram a coisa visível. O papel ainda está marcado.",
        "Se a escrita atravessou a folha, eu desconfiaria do sentido antes de desconfiar das letras.",
      ],
      LEROY: [
        "A referência entrou depois do formulário. A mão e a impressão não têm o mesmo peso.",
        "Borracha tira grafite. Não tira o que a ponta fez no papel.",
        "Eu não juntaria o primeiro fragmento que aparece. Primeiro descobriria como ele foi impresso.",
      ],
    },
  },
  "T-01": {
    id: "T-01",
    title: "Espelho da ocorrência OT-0812-44",
    shortTitle: "Ocorrência",
    origin: "Unidade rodoviária // cópia de despacho",
    front: "/documents/t01-front.webp",
    back: "/documents/t01-back.webp",
    puzzleKind: "source-thread",
    frontAlt: "Fotocópia cinza de uma ocorrência rodoviária de 12 de agosto de 2017. O campo de ocupação registra uma pessoa segundo declaração de M. Gouveia e remete a um complemento operacional no verso.",
    backAlt: "Verso de fotocópia com um complemento operacional: a cabine não foi conferida no atendimento inicial porque o lado direito estava contra a proteção da via.",
    transcriptFront: [
      "Ocorrência OT-0812-44. Data: 12/08/2017. Rota 9, quilômetro 41.",
      "Primeiro acionamento às 18h29; equipe no local às 19h08.",
      "Veículo 1: van da Casa-Lar de Candeia. Condutor: Vicente Braga.",
      "Ocupação informada: 01. Origem do dado: declaração de M. Gouveia, responsável presente.",
      "O campo principal não informa se a contagem foi conferida no interior da cabine.",
      "Veículo 2 não localizado; evasão anterior à chegada da equipe.",
      "Vicente foi localizado fora da van, ferido, e removido pela equipe médica.",
    ],
    transcriptBack: [
      "Complemento operacional: cabine não conferida no atendimento inicial.",
      "Motivo: lado direito contra a proteção da via; acesso adiado até a remoção.",
      "Carimbo de encaminhamento à unidade local.",
    ],
    prompt: "Descubra de onde o número ‘01’ realmente veio.",
    instruction: "Costure a afirmação à sua fonte e, depois, ao teste que deveria confirmá-la. Informações apenas próximas na página não formam uma cadeia.",
    fields: [
      { id: "call", label: "Primeiro acionamento: 18h29", side: "front", x: 8, y: 27, width: 27, height: 8, rejection: "O horário é operacional e será útil na cronologia, mas não explica a origem da contagem." },
      { id: "location", label: "Rota 9, km 41", side: "front", x: 59, y: 18, width: 33, height: 8, rejection: "O local foi registrado pela equipe; o problema desta análise é como o número de pessoas entrou na folha." },
      { id: "occupants", label: "Ocupação informada: 01", side: "front", x: 61, y: 38, width: 31, height: 10, required: true, rejection: "O próprio rótulo chama o número de informação, não de constatação." },
      { id: "source", label: "Fonte: declaração de M. Gouveia", side: "front", x: 8, y: 57, width: 84, height: 8, required: true, rejection: "A folha identifica quem forneceu a contagem." },
      { id: "not-checked", label: "Cabine não conferida no atendimento inicial", side: "back", x: 11, y: 22, width: 78, height: 28, required: true, rejection: "Sem acesso à cabine, a equipe não confirmou a declaração por observação direta." },
      { id: "second-vehicle", label: "Segundo veículo não localizado", side: "front", x: 8, y: 48, width: 84, height: 8, rejection: "A fuga explica a incompletude da colisão, mas não a contagem declarada dentro da van." },
    ],
    successFeedback: "O formulário não comprova uma pessoa dentro da van. Ele preserva uma declaração de Gouveia que a equipe não conseguiu conferir.",
    observations: {
      LEROY: [
        "O formulário parece seguro justamente onde usa a palavra mais vaga.",
        "Um número não aparece sozinho. Alguém o disse ou alguém o contou.",
        "Eu separaria quem forneceu a versão de quem teve condição de conferir.",
      ],
      DERICK: [
        "‘Um’ chama atenção. ‘Informada’ devia chamar mais.",
        "Antes de acreditar na quantidade, pergunta de quem ela era.",
        "Depois pergunta se alguém além dessa pessoa conseguiu olhar.",
      ],
    },
  },
  "T-02": {
    id: "T-02",
    title: "Inspeção do sistema de retenção",
    shortTitle: "Cinto",
    origin: "Núcleo de perícia veicular // folha técnica",
    front: "/documents/t02-front.webp",
    back: "/documents/t02-back.webp",
    puzzleKind: "seat-reconstruction",
    frontAlt: "Folha técnica azul e branca da inspeção da van. Um diagrama orientado pelo sentido de marcha marca R2 no quadrante F/D. Em campos separados aparecem pretensionador acionado, faixa com marcas de carga e coleta T-19.",
    backAlt: "Verso da folha técnica com lista de calibração do equipamento e assinatura parcial, sem resultado novo sobre a van.",
    transcriptFront: [
      "Inspeção em 13/08/2017, às 09h40. Van da Casa-Lar de Candeia. Ocorrência OT-0812-44.",
      "Ponto R2 — quadrante F/D na grade orientada pelo sentido de marcha.",
      "Pretensionador: acionado.",
      "Faixa: deformação longitudinal e marcas compatíveis com carga durante o evento.",
      "Coleta T-19: microvestígios retirados do alojamento inferior do fecho.",
      "Ressalva: acionamento isolado pode ocorrer por configuração, objeto afivelado ou dano anterior. Interpretar os achados em conjunto.",
    ],
    transcriptBack: ["Controle de calibração do equipamento fotográfico e da escala métrica. Sem resultado adicional sobre ocupação."],
    prompt: "Reconstrua a posição que o relatório dissolveu em quatro campos.",
    instruction: "Localize a posição no diagrama. Depois encaixe cada achado em sua função: mecanismo, efeito físico e vestígio coletado.",
    fields: [
      { id: "diagram", label: "Ponto R2 no diagrama", side: "front", x: 24, y: 29, width: 24, height: 25, rejection: "O diagrama localiza a inspeção, mas precisa do nome técnico da posição." },
      { id: "position", label: "R2 — quadrante F/D", side: "front", x: 53, y: 24, width: 39, height: 8, required: true, rejection: "A grade precisa ser convertida em uma posição dentro da van." },
      { id: "pretensioner", label: "Pretensionador acionado", side: "front", x: 53, y: 33, width: 39, height: 8, required: true, rejection: "O acionamento é um elo, mas o próprio laudo proíbe usá-lo sozinho." },
      { id: "load", label: "Faixa com marcas de carga", side: "front", x: 53, y: 42, width: 39, height: 10, required: true, rejection: "As marcas registram força sobre a faixa durante o evento." },
      { id: "sample", label: "Coleta T-19 no fecho", side: "front", x: 53, y: 53, width: 39, height: 9, required: true, rejection: "T-19 permite seguir o vestígio para fora da inspeção veicular." },
      { id: "limitation", label: "Ressalva técnica", side: "front", x: 8, y: 65, width: 84, height: 13, rejection: "A ressalva impede uma conclusão precipitada. Ela não substitui os quatro elos materiais pedidos." },
    ],
    successFeedback: "A posição, o acionamento, a carga e a coleta formam uma cadeia. Ela sustenta uma nova pergunta sobre o assento dianteiro direito, mas ainda não identifica quem esteve ali.",
    observations: {
      LEROY: [
        "O laudo oferece uma desculpa para uma peça isolada. Não oferece a mesma desculpa para tudo.",
        "Eu começaria pelo lugar. Sem lugar, o resto vira uma lista.",
        "Esses achados não fazem o mesmo trabalho. Um acontece, outro fica, outro é levado embora.",
      ],
      DERICK: [
        "O desenho chama por código o que o texto chama por posição.",
        "Se você empilhar tudo como ‘sinal de passageiro’, não provou nada.",
        "Dá uma função diferente para cada tira. A que sobra talvez só esteja ali para parecer importante.",
      ],
    },
  },
  "T-03": {
    id: "T-03",
    title: "Triagem de vestígios e controle de anexos",
    shortTitle: "Índice",
    origin: "Laboratório regional // cópia parcial",
    front: "/documents/t03-front.webp",
    back: "/documents/t03-back.webp",
    puzzleKind: "folio-reassembly",
    frontAlt: "Cópia de laboratório com código de barras da amostra T-19 e uma tabela de anexos fora de ordem. Uma faixa de toner encobre parte do item entre 4-A e 4-C. O inventário local contém as folhas 17 e 19 a 22.",
    backAlt: "Verso da cópia de laboratório com registro parcial de saída do item 4-B, uma folha, às 08h16, sem assinatura de conferência. Depois da reconstrução, a marca T-19 permanece legível na mesma orientação ao virar a folha.",
    transcriptFront: [
      "Laboratório Regional de Materiais. Cadeia LR-17-0813-611. Amostra T-19.",
      "Origem declarada: alojamento inferior do fecho dianteiro direito. Descrição de triagem: microfibras amarelas.",
      "As linhas do índice foram reproduzidas fora de ordem: 4-D, 4-A, 4-C e uma linha 4-B parcialmente coberta pelo toner.",
      "4-A — termo de coleta — folha 17 — incorporado.",
      "4-B — comparação físico-química da T-19 — número da folha encoberto — movimento abreviado como REM.",
      "4-C — registro fotográfico — folhas 19 a 21 — incorporado.",
      "4-D — liberação do veículo — folha 22 — incorporado.",
      "Inventário da cópia local: folhas 17, 19, 20, 21 e 22. Total: 5 folhas.",
      "A frente não contém confirmação assinada do recebimento.",
    ],
    transcriptBack: [
      "Registro parcial no verso: saída 4-B; 01 folha; 15/08/2017 às 08h16; destino unidade local.",
      "Campo de recebimento sem assinatura de conferência.",
      "Depois da relação documental, T-19 permanece na mesma orientação da frente. Isso não corresponde ao sangramento normal da impressão.",
    ],
    prompt: "Remonte o volume que alguém devolveu fora de ordem.",
    instruction: "A ordem impressa não merece confiança. Faça códigos, numeração física e movimento da folha contarem a mesma história; depois confirme quem assumiu o recebimento.",
    fields: [
      { id: "sample", label: "Cabeçalho da amostra T-19", side: "front", x: 8, y: 17, width: 24, height: 8, rejection: "O código identifica a amostra, mas não demonstra que o laudo comparativo foi produzido." },
      { id: "yellow", label: "Triagem: microfibras amarelas", side: "front", x: 66, y: 17, width: 26, height: 8, rejection: "A cor permite comparação posterior; o problema desta análise é o ciclo de vida da folha 18." },
      { id: "row-a", label: "4-A — folha 17", side: "front", x: 8, y: 31, width: 84, height: 7, rejection: "O 4-A está presente e apenas estabelece o começo da sequência." },
      { id: "row-b", label: "4-B — folha 18 — remetido", side: "front", x: 8, y: 38, width: 84, height: 8, required: true, rejection: "A linha nomeia o exame, atribui a folha 18 e registra sua remessa." },
      { id: "row-c", label: "4-C — folhas 19–21", side: "front", x: 8, y: 46, width: 84, height: 8, rejection: "O 4-C reaparece depois da lacuna; sozinho, apenas mostra que parte do conjunto chegou." },
      { id: "inventory", label: "Inventário local: 17, 19, 20, 21, 22", side: "front", x: 8, y: 63, width: 84, height: 10, required: true, rejection: "O inventário da cópia confirma materialmente o salto da folha 17 para a 19." },
      { id: "dispatch", label: "Remessa registrada sem conferência assinada", side: "back", x: 13, y: 20, width: 74, height: 32, required: true, rejection: "A movimentação demonstra envio e deixa a recepção local sem confirmação." },
    ],
    successFeedback: "O índice diz o que era a folha 18, o inventário prova que ela não está na cópia e a remessa prova que saiu do laboratório. A ausência agora tem percurso.",
    observations: {
      LEROY: [
        "Quem mexeu nisto não arrancou só papel. Mexeu na ordem para a falta parecer erro de cópia.",
        "Há dois jeitos de ordenar esse volume. Se ambos apontarem para o mesmo buraco, não é impressão sua.",
        "Uma folha pode faltar aqui e ainda ter deixado movimento em outro lugar.",
      ],
      DERICK: [
        "Uma lacuna sozinha é bagunça. Três bagunças que apontam para o mesmo ponto são outra coisa.",
        "Não confia na posição das linhas. Confia no sistema que deveria determinar a posição.",
        "Se ela saiu de uma bandeja, alguém devia ter assumido quando entrou na outra.",
      ],
    },
  },
  "B-12": {
    id: "B-12",
    title: "Caderno da busca — página 1",
    shortTitle: "Caderno",
    origin: "Casa-Lar de Candeia // anotação de Leroy",
    front: "/documents/b12-front.webp",
    back: "/documents/b12-back.webp",
    puzzleKind: "timeline",
    frontAlt: "Página pautada e muito manuseada do caderno de busca. Entre listas riscadas, registra Alana não localizada às 17h22, papel no trinco do portão às 17h41 e Vicente saindo com a van às 17h46.",
    backAlt: "Verso pautado com pressão de escrita, marcas de dobra e palavras incompletas da página seguinte.",
    transcriptFront: [
      "12 de agosto — busca. Página escrita por Leroy aos 14 anos.",
      "17h22 — Alana não localizada.",
      "17h27 — dormitórios e banheiros; repetir o quarto de cima.",
      "17h34 — pátio e ruas próximas.",
      "17h41 — fundos; portão encostado; papel dobrado no trinco.",
      "17h46 — Vicente sai com a van.",
      "Lista posterior, parcialmente riscada: escola, terminal, praça, canal, Sônia e Augusto, rua da escola — repetir.",
    ],
    transcriptBack: ["Verso sem novo horário. Há pressão de palavras da página seguinte, vinco e manchas de manuseio."],
    prompt: "Delimite o tempo que nenhuma versão oficial consegue preencher.",
    instruction: "Nem toda hora delimita silêncio. Use uma marca produzida durante a busca e outra que já não dependa da versão de quem estava com a van.",
    fields: [
      { id: "missing", label: "17h22 — Alana não localizada", side: "front", x: 15, y: 13, width: 70, height: 7, rejection: "Essa linha abre a busca, mas ainda registra apenas uma ausência." },
      { id: "rooms", label: "17h27 — dormitórios e banheiros", side: "front", x: 15, y: 20, width: 70, height: 7, rejection: "É uma etapa de procura dentro da casa, sem deslocamento identificável para fora." },
      { id: "gate", label: "17h41 — papel no trinco do portão", side: "front", x: 15, y: 31, width: 74, height: 10, required: true, rejection: "O papel no trinco transforma a ausência em vestígio de saída." },
      { id: "departure", label: "17h46 — Vicente sai com a van", side: "front", x: 15, y: 42, width: 72, height: 8, required: true, rejection: "A saída da van cria o primeiro movimento que pode ser comparado com um relógio externo." },
      { id: "places", label: "Lista de locais da busca", side: "front", x: 15, y: 53, width: 74, height: 22, rejection: "Os locais registram tentativas, mas não preservam uma hora confiável para fechar o intervalo." },
    ],
    successFeedback: "A van sai às 17h46; o primeiro acionamento externo ocorre às 18h29. Restam quarenta e três minutos que a versão oficial não preenche.",
    observations: {
      DERICK: [
        "‘Ela sumiu’ não tem minuto. Um veículo saindo tem.",
        "Chegada de patrulha e começo do socorro não são a mesma hora.",
        "Eu usaria um limite que Leroy viu e outro que não depende da versão de Vicente.",
      ],
      LEROY: [
        "Eu anotei ausência, procura e movimento como se fossem equivalentes. Não são.",
        "Uma ponta está no que eu vi. A outra precisa existir sem a minha memória.",
        "O registro de fora começa antes de alguém uniformizado aparecer na estrada.",
      ],
    },
  },
};

export type RelationDefinition = {
  id: "same-occurrence" | "time-gap" | "passenger-trace" | "yellow-material";
  documents: [EvidenceId, EvidenceId];
  title: string;
  question: string;
  summary: string;
  required: boolean;
};

export const RELATIONS: RelationDefinition[] = [
  {
    id: "same-occurrence",
    documents: ["D-01", "T-01"],
    title: "Um número atravessa dois sistemas",
    question: "Quais folhas provam que o reembolso médico e a colisão pertencem ao mesmo acontecimento?",
    summary: "OT-0812-44 liga a substituição do transporte de Derick à ocorrência da van da Casa-Lar.",
    required: true,
  },
  {
    id: "time-gap",
    documents: ["B-12", "T-01"],
    title: "O intervalo sem relato",
    question: "Quais folhas delimitam o tempo entre a saída de Vicente e o primeiro pedido de socorro?",
    summary: "Vicente saiu às 17h46; a primeira chamada entrou às 18h29. Há quarenta e três minutos sem versão independente.",
    required: true,
  },
  {
    id: "passenger-trace",
    documents: ["T-02", "T-03"],
    title: "O vestígio interrompido",
    question: "Quais folhas seguem o assento dianteiro direito até o exame que desapareceu?",
    summary: "O cinto dianteiro direito registrou carga e originou a T-19; a comparação dessa amostra ocupa a folha 18 ausente.",
    required: true,
  },
  {
    id: "yellow-material",
    documents: ["A-01", "T-03"],
    title: "Amarelo não é identidade",
    question: "Que relação visual apoia a hipótese sobre Alana sem transformar cor em identificação?",
    summary: "A fotografia mostra a jaqueta amarela; a triagem registra microfibras amarelas. A relação é compatível, não conclusiva.",
    required: false,
  },
];

export function findRelation(first: EvidenceId, second: EvidenceId) {
  return RELATIONS.find(({ documents }) => (
    (documents[0] === first && documents[1] === second) ||
    (documents[0] === second && documents[1] === first)
  ));
}
