# MYU — blueprint compartilhado dos capítulos 3 e 4

Estado: divisão autorizada e implementada em 15/09/2026. O 3 termina na memória do corpo; o 4 continua o restaurante, o confronto e a ligação. Esta distribuição prevalece sobre descrições históricas do capítulo único.

## Núcleo

| Campo | Definição |
| --- | --- |
| Posição na obra | Após a recuperação da Folha 42 no A-07 do Capítulo 2. |
| Ação central | Ler, inspecionar, guardar e comparar poucos documentos dentro da própria progressão da prosa. |
| Função narrativa | Transformar a reconstrução burocrática de 2017 numa investigação realizada pelo leitor, sem separar livro e ARG. |
| Evidência exclusiva | A permanência impossível de `T-19` na mesma orientação ao virar T-03, visível apenas ao leitor depois da relação com T-02. |
| Consequência | Uma contradição verificável leva Derick e Leroy à casa do antigo delegado; a regra criada após a conversa sobre a ruptura é violada durante o interrogatório e produz simultaneamente uma pista e novo dano entre eles. |
| Estado de saída | O 3 termina no passado e libera o 4; o 4 termina na ligação de Vicente. O jogo secreto permanece fechado. |

## Estados da experiência

| ID | Estado visível | Ação disponível | Gatilho | Resposta | Próximo estado |
| --- | --- | --- | --- | --- | --- |
| S0 | Prosa | Ler e rolar | Entrada no capítulo | Posição de leitura salva | S1 |
| S1 | Documento inserido entre parágrafos | Abrir, guardar e examinar a folha | Personagem encontra o registro | A folha pode ser apenas recolhida ou pode abrir uma técnica, conforme o contexto narrativo disponível | S2 ou S3 |
| S2 | Documento em foco opcional | Aproximar, arrastar, girar, virar, alterar luz, solicitar observação | Leitor escolhe examinar | Retorno claro sem resolver a técnica automaticamente | S2 ou S3 |
| S3 | Técnica documental e cadeado | Executar a operação própria daquela ocultação | A cena finalmente fornece a pergunta certa | Tentativa incorreta explica a falha do método; acerto persiste e libera a prosa seguinte | S0 ou S4 |
| S3A | Observação de personagem | Solicitar níveis 1, 2 e 3 | Pedido voluntário | Orientação gradual sem punição, exibida em diálogo-jogo elevado sobre a página | S2 ou S3 |
| S4 | Gaveta física de evidências | Tirar uma folha, folhear, virar, examinar ou guardar | Roda do mouse percorre a gaveta no desktop; arraste horizontal percorre a pilha no celular; toque pega a folha; teclado equivalente | Posição, lado, folha ativa e ordem persistem após recarga | S0 ou S5 |
| S5 | Convergência na varanda | Conferir os vínculos já demonstrados em momentos diferentes | A remontagem de T-03 termina | A mesa resume código, intervalo e percurso sem impor um sexto formulário | S6 |
| S6 | Contradição identificada | Continuar a cena | Três relações centrais registradas por técnicas distintas | Prosa mostra interpretação e decisão | S7 |
| S7 | Casa do antigo delegado | Consultar ou apresentar evidência já guardada | Contradição conduz à visita | Reação confirma conhecimento ocultado sem confissão total | S8 |
| S8 | Final do capítulo | Retomar depois ou seguir quando houver novo desbloqueio | Ligação de Vicente | Estado completo preservado | Fim do 4 |

## Persistência local

Separar três domínios para que um reinício não apague os outros:

- `myu-reading-progress-v1`: capítulo, âncora textual, deslocamento e percentual de leitura;
- desbloqueios já existentes: `myu-capitulo-2`, `myu-capitulo-3`, `myu-capitulo-4` e `myu-arg-a07`;
- investigação compartilhada dos capítulos 3 e 4: `myu-chapter3-investigation-v3`, contendo documentos descobertos, técnicas ativadas, dados próprios de cada método, lados examinados, observações solicitadas, relações identificadas, consequência material e posição/lado/empilhamento das folhas soltas.
- aparência de leitura: `myu-reading-theme-v1`, independente dos desbloqueios e da investigação.

O reinício da investigação afeta os métodos dos dois capítulos, preservando leitura, aparência e acesso. A migração `myu-chapter-split-v1` usa âncoras estáveis e não reinicia evidências.

## Documento integrado

### Manuseio da folha — revisão visual novel

- A grade de comandos foi removida. A folha vira por uma aba no canto; lupa, luz, giro, retirada, foco e transcrição aparecem numa faixa de pequenos controles circulares, inspirados no vinil já usado por Myu.
- A lupa aproxima imediatamente e revela o ajuste de escala e a centralização. Pinça, arraste, dois toques, teclado e transcrição continuam disponíveis.
- Derick e Leroy ficam junto da folha. Tocar no retrato abre uma observação; trocar de personagem ou reabrir a conversa recupera a última fala solicitada. Somente “Outra observação” avança nos níveis seguintes.
- A conversa usa os retratos e as falas existentes, com uma voz por vez. O laranja de Derick e o azul de Leroy identificam cada personagem. Não há falas novas, pontuação ou alterações dos enigmas.
- A mesma interface atende aos documentos na prosa e na gaveta, incluindo material apenas recolhido. Foco e diálogo devolvem o teclado ao controle de origem.
- Verificação nesta revisão: lupa, giro, centralização, frente/verso, luz, transcrição, observações graduais e persistência, foco/Escape, retirada e inspeção pela gaveta, e largura de 390 px. Corrigida também uma margem herdada da mesa que criava transbordamento horizontal em tela estreita.
- Figma e GitHub foram solicitados. As integrações constaram instaladas, mas suas ferramentas não foram expostas à sessão. Esta revisão é preservada no Git do Site; não representa uma exportação para Figma ou um envio para GitHub.

### Áreas de resolução — revisão 2D

- Quatro cenas de investigação sobre uma mesa em pixel art. A ampliação é opcional, fecha por botão ou Escape e preserva o espaço e o foco de leitura. As imagens originais continuam disponíveis fora da cena, com transcrição.
- D-01: impressão carbonada inclinada, luz que acompanha o ponteiro, inspeção por toque/teclado, inversão e anotação. O rascunho da referência persiste no mesmo registro de investigação.
- B-12: duas páginas de caderno, horários editáveis em 24 horas, ajuste minuto a minuto e marcações temporais. A duração é uma hipótese até a conferência dos dois limites.
- T-02: esquema orientado da van, marca R2 e tiras em uma faixa de peças. Escolher uma tira e tocar numa anotação encaixa; tocar numa anotação preenchida sem tira na mão retira. No celular, pegar uma tira traz os encaixes de volta à vista.
- T-03: folhas sobrepostas em sequência, arrastáveis pela aba ou ordenáveis pelas setas. Destinos só ficam disponíveis após remontagem. A conferência do verso permanece necessária, sem antecipar o resíduo sobrenatural.
- Em tela estreita, as páginas e o esquema se reorganizam, mantendo controles de pelo menos 44 px. Não há limite de tempo, punição por erro ou dependência exclusiva de arraste.
- Soluções, relações, cadeados, observações e chaves de progresso existentes preservados. Não há alteração da prosa nesta rodada.
- Verificação: carbono com erro de lado, descoberta, rascunho após recarga e solução; caderno com edição dos dois horários e solução; anexos com arraste real, reordenação por botão, erro sem verso e solução; van resolvida em viewport de 390 px, sem transbordamento horizontal.

- Usar imagem real e legível, não HTML estilizado para imitar papel.
- Inserir no ponto exato em que o personagem o abre.
- Não abrir em tela cheia automaticamente.
- Manter o parágrafo seguinte imediatamente abaixo.
- Oferecer foco opcional, pinça, arraste ampliado e saída simples.
- A gaveta não funciona como modal: ela abre sobre a borda da página como uma pilha física. No desktop, permite retirar múltiplas folhas, movê-las livremente, empilhá-las e devolvê-las. No celular, mantém uma folha grande e legível na mão; gesto lateral percorre a pilha e evita miniaturas impossíveis de manipular.
- O documento inserido na prosa não recebe painel externo escuro: a própria folha é a superfície principal, com ferramentas secundárias em uma faixa compacta.
- T-02 e T-03 aparecem primeiro como material recolhido, sem interromper a narrativa. Suas técnicas só são ativadas mais tarde, quando a memória de Alana e a decisão de visitar Gouveia criam perguntas que justificam examiná-las.
- Cada ocultação exige uma resolução diferente: pressão e inversão do carbono em D-01; leitura de apoio em T-01 (fio opcional, sem bloqueio); sincronização de dois relógios em B-12; reconstrução espacial e funcional em T-02; remontagem de fólios, bandeja de remessa e conferência do verso em T-03.
- A partir de uma técnica obrigatória não resolvida, o restante do capítulo não é renderizado e um cadeado diegético ocupa a passagem. Tentativas incorretas recebem retorno específico ao procedimento; o acerto persiste. Não usar radio buttons, letras A/B/C, cartões de resposta ou cinco variações da mesma marcação.
- Os cinco registros administrativos têm famílias visuais distintas e versos próprios: segunda via carbonada, fotocópia rodoviária, folha técnica quadriculada, controle laboratorial e página manuscrita de caderno. A diferença visual comunica origem e manuseio, não apenas decoração.
- Manter navegação e rolagem vertical utilizáveis.
- Fornecer descrição estrutural e transcrição acessível opcional.
- Não repetir na prosa o conteúdo integral da imagem.

## Observações

1. Nível 1 aponta uma estranheza, sem nomear o campo correto.
2. Nível 2 sugere um princípio de investigação.
3. Nível 3 restringe o método, mas não fornece sequência, valor, posição ou destino.

Quando Derick e Leroy estiverem juntos, a interface poderá permitir escolher quem observar. As duas respostas podem mostrar raciocínios diferentes, mas não criar soluções incompatíveis.

As observações surgem numa caixa-jogo própria de Myu: uma camada escura que salta visualmente do papel, com um disco de vinil sobreposto à borda. O selo central usa laranja queimado para Derick e azul-petróleo para Leroy. Retratos de rosto derivados das fichas atuais mudam de expressão nos três níveis sem alterar o design do personagem nem encobrir o texto.

## Falha e retomada

- Não há game over, cronômetro ou perda de documento.
- Toda tentativa incorreta recebe retorno compreensível.
- A ajuda pode ser solicitada sem punição.
- O leitor pode fechar o site e retomar depois.
- Um documento que falhe ao carregar mantém alternativa textual acessível e permite nova tentativa.

## Consequência dramática da ruptura

- A conversa no restaurante revela o passado, mas não produz reconciliação, perdão aceito ou promessa de reaproximação.
- A lembrança é contestada: Leroy recupera ações concretas e Derick corrige a interpretação que ele lhes atribui.
- O elo temático é físico. A lembrança da tentativa de erguer Derick consciente precede o relato de Alana. A aproximação não transforma o trauma numa desculpa aceita para o controle.
- A conversa que combina a visita fica fora de cena, após um indício no restaurante. A armadilha só se revela ao ser executada; a cobrança de Derick depois da visita explicita a condição que Leroy aceitou à mesa: deixar Gouveia terminar de falar.
- Leroy rompe a condição com `Prisão de quem?`. A pergunta é útil para a investigação e danosa para a relação, impedindo que a cena vire uma lição simples sobre quem estava certo.
- A cobrança ocorre ainda na mesma noite. Eles seguem juntos por necessidade e chegam ao fim sem retirar a acusação nem fechar o conflito.

## Manifestação sobrenatural

- Depois de o leitor relacionar T-02 e T-03, `T-19` permanece legível e na mesma orientação no verso de T-03.
- O efeito retoma a amostra material já estabelecida, não acrescenta símbolo independente e não resolve a investigação.
- Os personagens não recebem essa informação e o leitor de tela recebe uma descrição equivalente em estado ao vivo.
- Não há glitch genérico, jumpscare, tela vermelha, rosto ou silhueta de Executioner.

## Cadeia documental definitiva

| ID | Origem | Função |
| --- | --- | --- |
| A-01 | Fotografia física da Casa-Lar | Apoia a hipótese sobre a jaqueta amarela sem identificar a fibra. |
| D-01 | Histórico médico-administrativo de Derick | Liga a indisponibilidade da van ao número OT-0812-44. |
| T-01 | Cópia de ocorrência preservada por Ravi | Registra horários e o único ocupante apenas como declarado por Gouveia. |
| T-02 | Inspeção veicular preservada por Ravi | Registra carga no cinto dianteiro direito e a coleta T-19. |
| T-03 | Triagem e índice de anexos preservados por Ravi | Prova a existência e a ausência local do Anexo 4-B. |
| B-12 | Fotografia do caderno da busca feita por Leroy | Fixa a saída da van às 17h46 para comparação com 18h29. |

A armadilha final também é definitiva: Derick oferece `algodão` como composição falsa; Gouveia corrige para `poliéster`, revelando ter lido o 4-B que negou ter recebido.

Esta edição usa três retratos de observação para Derick e três para Leroy, derivados das fichas atuais e limitados a variações de expressão. Eles não substituem arte narrativa nem estabelecem roupa ou aparência nova. Não há sons.

## Verificação obrigatória

Testar antes de considerar a experiência concluída:

1. computador com mouse e teclado;
2. celular vertical com toque, pinça e arraste;
3. recarga e retomada no meio da prosa e de cada técnica;
4. redução de movimento;
5. zoom das menores inscrições;
6. diálogo junto às quatro bordas;
7. carbono, fio, relógios, assento e fólios em tela pequena;
8. caminho sem observação, com cada nível e com tentativa incorreta;
9. reinício exclusivo da investigação;
10. falha de carregamento de uma imagem.

## Distribuição atual e verificação da divisão

| Capítulo | Momento | Ação obrigatória |
| --- | --- | --- |
| 3 | Arquivo médico, casa de Derick | Recuperar pressão carbonada, iluminar e inverter a referência D-01. |
| 3 | Jantar, antes da conversa sobre a ruptura | Sincronizar os relógios B-12 e T-01. |
| 4 | Mesa, após a reação à memória | Reconstruir posição, mecanismo, carga e amostra em T-02. |
| 4 | Varanda, Gouveia evita reconhecer a triagem | Remontar T-03 e localizar o exame antes de perguntar pelo recebimento. |

A segunda investigação do 4 foi deslocada para o confronto, evitando dois bloqueios quase consecutivos no restaurante. A conclusão não acusa antecipadamente Gouveia de retirar a folha. `tests/chapter-split.test.mjs` cobre a sequência, a separação narrativa, as âncoras e a migração de todos os pontos antigos. A validação desta edição usa testes de lógica, renderização das rotas e build. A lista de cenários com interação física acima continua sendo um roteiro de QA; não representa testes de navegador executados nesta revisão.
