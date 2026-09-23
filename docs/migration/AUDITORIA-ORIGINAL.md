# Auditoria do Myu publicado

Fonte obrigatória: https://myu-capitulo-um.http-joao-spam.chatgpt.site — versão 31, commit `d80f71cf1410511fd3366d219b05a98d1e021cd1`. Destino: **JoaoBruck/Livro**, branch `migration/full-myu`. A menção final a `Myu` na mensagem de correção foi tratada como texto remanescente; nenhum protótipo de GitHub ou Figma foi usado.

Esta auditoria antecede a reorganização do código. O site original permanece publicado e seu checkout permanece sem alterações. A migração parte de uma cópia integral, incluindo arquivos não utilizados na interface e documentação editorial. Não há decisão de alterar cânone, respostas ou aparência nesta etapa.

## Fontes e integridade

- `original-files.json`: todos os **117 arquivos rastreados**, com caminho, modo Git, tamanho, SHA-256 e SHA do blob. Total: **23.910.297 bytes**.
- `original-chapters.json`: os quatro arquivos narrativos completos, sem reescrita, incluindo metadados, âncoras, falas, mensagens, artefatos e inserções de documentos.
- `history/`: cópia restaurável dos **36 commits** do projeto oficial, dividida em partes com hashes. Este histórico não deriva de protótipos experimentais.
- Os documentos de continuidade, blueprints, revisões editoriais, imagem de revisão, scripts de geração, código de autenticação e exemplos de banco existentes também fazem parte da preservação.

## Método e limites da evidência

Foram percorridos os quatro capítulos no site publicado, respondidos os enigmas, testados erros, acertos, salvamento parcial, recarga, retorno, gaveta, folhas soltas, transcrições, iluminação, rotação, ampliação e diálogos. Foram usadas entradas reais da interface, sem alterar o armazenamento do navegador para pular bloqueios. Foram auditados também os contratos no código-fonte.

A navegação móvel foi feita no próprio site publicado, enquadrado em 390 e 360 pixels de largura. Isso verifica os breakpoints e a interação com ponteiro/teclado em tela estreita; não equivale a um aparelho Android/iOS físico nem a um teste de pinça multitoque. O retorno foi testado fechando e reabrindo uma aba no mesmo perfil; o processo inteiro do navegador não foi reiniciado.

O original passou em **30 testes automatizados**, incluindo compilação, rotas renderizadas, página secreta fechada, progressão antiga, âncoras, contraste e preferências. Esse resultado foi observado antes da migração.

Foram registrados 85 checkpoints durante a execução. A manutenção automática do ambiente removeu os arquivos temporários das capturas e dos snapshots; a tentativa de recuperação não os encontrou. Os resultados descritos aqui são registros da execução observada, e não screenshots anexados que ainda existam. Não confundir estes registros com testes automatizados reproduzíveis.

A última tentativa de clicar no trecho “A cozinha apagou.” foi recusada pela revisão automática por limite de uso. O disparo visual do apagão ficou sem confirmação manual, embora sua implementação tenha sido inspecionada. A captura final da resolução móvel de T-03 foi solicitada antes dessa recusa, mas seu resultado não foi relido antes da remoção dos arquivos; a conclusão móvel de T-03 não é contada como aprovada. O fluxo completo de T-03 e T-19 foi confirmado em desktop.

## Páginas, cenas e narrativa

| Rota | Conteúdo integral | Acesso e progressão |
| --- | --- | --- |
| `/` | Capítulo 1: 448 blocos, 4.905 palavras, 7 cenas; fotografia, celular, conversa recuperada e ARG do ano | Livre; resposta abre o capítulo 2 |
| `/capitulo-2` | Capítulo 2: 551 blocos, 7.044 palavras, 3 cenas; artefatos narrativos, apagão e A-07 | Depende de `myu-capitulo-2`; A-07 recuperado abre o 3 |
| `/capitulo-3` | Capítulo 3: 503 blocos, 6.131 palavras, 5 cenas; D-01 e B-12 obrigatórios; T-01/T-02/T-03 coletáveis; termina no encontro do corpo | Depende de `myu-capitulo-3`; dois enigmas concluídos permitem o 4 |
| `/capitulo-4` | Capítulo 4: 312 blocos, 3.514 palavras, 4 cenas; T-02 e T-03 obrigatórios; confronto, telefonema, fim aberto | Depende de `myu-capitulo-4`; conclusão preserva investigação aberta |
| `/outro-lado` | Rota reservada; blueprint e componente de passagem existentes | Retorna 404; lançamento está desativado; não há jogo publicado nem entrada secreta liberada |

Total: **1.814 blocos e 21.594 palavras narrativas**, além dos textos de interface, pistas, transcrições e diálogos de investigação mantidos em seus arquivos originais. A contagem não inclui controles de enigmas como palavras do capítulo.

As cenas, seus nomes e âncoras são preservados integralmente nos JSONs. Cenas de capítulo 3: MIRANTE // 12H40; DERICK // CASA; LEROY // COSTA; JANTAR // 19H23; 12 DE AGOSTO // 2017. Cenas de capítulo 4: JANTAR // AINDA À MESA; CASA 112 // NOITE; GOUVEIA // VARANDA; DEPOIS DO PORTÃO.

## Enigmas, estados, respostas e dependências

| Mecânica | Condição exata e estados preservados | Erro, feedback e persistência |
| --- | --- | --- |
| Ano da fotografia | Normalização sem acentos/pontuação, minúsculas; aceita `2017`, `12082017`, `12agosto2017`, `12deagostode2017` | Ano errado: “O ano não corresponde ao registro.” Pista alternável. Acerto recupera foto e conversa, libera 2. Não há contador ou limite de tentativas |
| Celular de Leroy | Foto de 12/08/2017; conversa com Derick; seis resultados em cinco balões, um deles com duas linhas | A abertura visual é estado da visita; a liberação do capítulo 2 persiste. Recarregar não reabre automaticamente o celular |
| A-07 | `sealed → scan → unstable → reconstructing → recovered`; luz encontra quatro impressões, ângulo até 34°; folha 43 revela 42; carta integral de Alana | Ângulo 6–42, contraste 20–90; luz por mouse/ponteiro/setas em passos de 5%. Encontradas e controles persistem parcialmente. Recuperação libera 3 |
| A-07: tempos | Orientações após 14 e 28 segundos; transições de 2.400 e 5.200 ms, ou 350 e 500 ms com movimento reduzido | Reexaminar limpa a tentativa parcial, mas não apaga a recuperação nem relacra capítulo já liberado. Restauração automática depende de `#arg`; abrir arquivo também restaura |
| D-01 / carbono | Verso + luz; três sulcos `44`, `2180`, `TO`; inverter a leitura; referência `OT-0812-44`, normalizada para `OT081244` | Frente, luz apagada, ausência de inversão e código errado têm respostas próprias. Fragmentos, inversão e anotação persistem. Identificar permite prosseguir no 3 |
| B-12 / intervalo | Saída **17h46**, chamada **18h29**, **43 minutos**. Digitação, trilhos e botões de minuto equivalentes | Inicial 17h22/19h08; limites 17h20–19h10; horário inválido tem feedback e restaura rascunho. Tempos parciais persistem. Identificar conclui os bloqueios do 3 |
| T-02 / R2 | Assento dianteiro do passageiro; mecanismo = pretensionador; efeito = carga; vestígio = amostra T-19 | Assento errado, sequência incompleta e calibração como distrator são distintos. Selecionar tira e encaixar; tocar encaixe remove; peça não se duplica. Estado parcial persiste |
| T-03 / volume | Ordem: coleta → comparação → fotografias → liberação; folha 18; bandeja remessa; conferência no verso | Ordem errada, cópia local e frente sem verso têm feedback próprio. Setas e arraste preservados. Ordem/bandeja persistem; lado do inspetor volta à frente após recarga |
| T-01 / rastro de autoria | Código existente para afirmação → origem → falta de conferência; nós distratores; erro desfaz cadeia | **Não é ativável no percurso publicado atual**: inserção está em modo coletar. Manter o algoritmo e manter esse estado de acesso; não abrir caminho novo por conta própria |
| A-01 / fotografia | Documento de memória, frente/verso e transcrições | Não impõe pergunta ou resposta; não converter em quiz |
| Relações | D-01 identificado + T-01 descoberto: ocorrência; B-12 identificado: intervalo; T-02 + T-03 identificados: vestígio | Derivadas automaticamente. T-01 precisa efetivamente ser visto, não apenas existir no capítulo. `yellow-material` permanece definido, sem ativação pelo fluxo atual |
| T-19 | Verso de T-03, após relação do vestígio; marca mantém orientação e registra evento após 650 ms | Funciona no inspetor e na folha solta. `supernaturalSeen` persiste; não cria acesso ao Outro Lado |
| Convergência | Mostra as três relações e a contradição final conforme descobertas | Não exige respostas alternativas A/B/C; respeita dependências e ausência de documentos |

Os enunciados, transcrições, descrições alternativas, respostas de erro, observações e falas são preservados pelo código e pelos dados completos, não pela paráfrase desta tabela.

## Documentos e objetos

| ID | Objeto | Faces e função |
| --- | --- | --- |
| A-01 | Fotografia da festa | Fotografia original e verso; memória, leitura, gaveta |
| D-01 | Solicitação de transporte assistencial | Frente/verso de carbono; enigma de referência |
| T-01 | Registro de ocorrência | Frente/verso; fonte do primeiro registro externo, relações e suporte |
| T-02 | Inspeção do sistema de retenção | Frente/verso; diagrama de assentos, cadeia física e T-19 |
| T-03 | Triagem de vestígios e controle de anexos | Frente/verso; reordenação, remessa e manifestação T-19 |
| B-12 | Caderno da busca — página 1 | Frente/verso; horários e intervalo |

São preservados os PNG/SVG originais e os WebP derivados. `DocumentFaces` mantém as duas faces decodificadas e fallback de imagem. O inventário inclui `blank-back`, imagens antigas/atuais, capa do 2, grupo atual, capa do 4, mesa de investigação, favicon e recursos auxiliares, mesmo quando não usados por uma tela atual.

Existem **52 arquivos públicos: 20 PNG, 16 SVG, 15 WebP e 1 JPG**. Seis retratos de diálogo representam três expressões de Derick e três de Leroy. O JPG da revisão editorial está fora de `public` e também foi preservado.

**Áudio:** não existem faixas, efeitos, player, arquivos de áudio ou pedidos de áudio no projeto publicado auditado. A música descrita na história e as playlists de intenção não são um sistema sonoro implementado. Os vinis são parte da apresentação visual dos personagens.

## Inventário de interações recorrentes

| Sistema | Comportamentos que devem continuar existindo |
| --- | --- |
| Inspetor de documento | Virar pela ponta da folha; indicador de lado; lupa 1×/2×; ajustes de 0,35 até 3,5×; girar 90°; centralizar; iluminação móvel; arrastar imagem; setas para deslocar/luz; duplo toque; pinça implementada; transcrição; pegar folha; ampliar |
| Mesa do enigma | Área própria por técnica; instruções; feedback; situação em exame/resolvida; expansão em portal com espaço reservado; retornar por botão/Escape |
| Conversas | Escolha de Leroy/Derick; três observações graduais por personagem/documento; retratos e vinis; outra observação avança explicitamente; fechar/reabrir conserva nível; textos e cores do original |
| Gaveta | Contagem descobertos/6; contador não examinados; estados novo/visto/marcado; pilha; roda horizontal; arraste móvel; prevenção de clique após gesto; relações; tirar/guardar múltiplas folhas |
| Folhas soltas | Posição, rotação, frente/verso e profundidade persistidos; mouse/teclado; trazer à frente; foco; devolver à gaveta; orientação de T-19 |
| Folhas móveis | Uma folha principal; miniaturas das folhas na mão; gesto horizontal troca folha; gesto vertical para baixo guarda; botões equivalentes; fechamento da gaveta ao pegar |
| Diálogos modais | Escape; foco contido; restauração do foco; `inert` no conteúdo atrás; texto acessível e controles de fechar |
| Reiniciar investigação | Confirmação/cancelamento; limpa investigação 3/4; conserva leitura, capítulos liberados e aparência. Não equivale a apagar tudo |
| Leitura | Índice de capítulos com bloqueios; índice de cenas; links de iniciar/continuar/voltar; estimativa de leitura; âncoras estáveis; progresso por capítulo e capítulo atual |
| Aparência | Quatro temas: claro, escuro, branco, preto; texto 18–28 em passos de 2; serif/sans; espaçamento normal/amplo; largura normal/estreita; foco de leitura; restauração antes da primeira pintura |
| Animação | Virada de documento; luz; retratos/vinis; mesa; folheamento; gaveta; flashes narrativos; reconstrução A-07; estados de revelação; regras para movimento reduzido |
| Responsividade | Breakpoints do CSS original, inclusive 900/760/620/600/480/430/380/360; navegação, mesas e folhas adaptadas; sem substituir interação por formulário genérico |
| Persistência antiga | Migração idempotente da divisão 3/4; redirecionamento de âncoras de textos encurtados; retomada de leitores antigos; chaves e formatos existentes |

## Contratos do navegador

| Chave | Conteúdo e fronteira |
| --- | --- |
| `myu-capitulo-2`, `myu-capitulo-3`, `myu-capitulo-4` | Valor `unlocked`; acesso separado da investigação |
| `myu-capitulo-3-complete`, `myu-capitulo-4-complete` | Conclusão separada por capítulo |
| `myu-arg-a07-progress-v1` | Impressões encontradas, luz, ângulo e contraste |
| `myu-arg-a07` | Valor `recovered` |
| `myu-chapter3-investigation-v3` | Versão 3: descobertos, ativados, examinados, identificados, dados dos enigmas, lados, observações, relações, manifestação e folhas soltas |
| `myu-reading-progress-v1` | Versão 1: capítulo atual e posição de cada capítulo, rota, âncora, deslocamento, progresso e data |
| `myu-reading-theme-v1` | Um dos quatro temas |
| `myu-reading-preferences-v1` | Tamanho, fonte, espaçamento, largura e foco |
| `myu-chapter-split-v1` | Marcador idempotente da migração anterior de capítulos |

Progresso de leitura é atualizado com debounce de 320 ms e no `pagehide`; retomada mede âncoras e aplica deslocamento. Não existe backend de saves ou sincronização de conta. A mudança de repositório não altera o domínio; uma futura mudança de origem exigirá migração explícita dos saves ou manutenção do domínio original.

## Execução observada antes da migração

| Grupo | Resultado observado |
| --- | --- |
| Bloqueios 2/3/4 e menus | Acesso antecipado negado; capítulos liberam pelas condições originais |
| Preferências | Quatro temas, fonte/tamanho/espaçamento/largura/foco; recarga conservou escolhas |
| Fotografia | Erro, pista, acerto, formatos aceitos, foto/conversa e liberação; recarga manteve acesso |
| A-07 | Ângulo incorreto, 2/4 e recarga parcial, 4/4, reconstrução, carta, reexame e acesso conservado |
| D-01 | Erros de método/código, sulcos parciais e recarga, observações, inversão/acerto, zoom/rotação/luz/texto/foco/mesa |
| B-12 | Horários iniciais errados, `99:99`, hipótese parcial e recarga, 43 minutos e avanço |
| T-02 | Assento errado, calibração errada, dois encaixes e recarga, cadeia correta |
| T-03 desktop | Ordem errada, bandeja errada, falta do verso, recarga parcial, acerto, T-19 e convergência |
| Gaveta desktop | Seis documentos, relações, pegar/virar/mover por teclado e arraste, recarga, ampliar/transcrever e guardar |
| Retomar | Fechar aba, reabrir início, continuar capítulo 4 em 84%, âncora de leitura restaurada |
| Reiniciar | Cancelamento conserva estado; confirmação reinicia enigma sem bloquear capítulo 4 |
| 390/360 px | Índice, erro/acerto de fotografia, A-07 completo via setas, D-01 completo, B-12 completo, fala de Derick, fotografia no verso, gesto de guardar, capítulo 4 e T-02 completo |
| 30 testes originais | Aprovados antes da migração, inclusive resposta HTTP 404 de `/outro-lado` |

## Inconsistências registradas sem correção criativa

1. T-01 tem um enigma implementado e mencionado como opcional no planejamento, mas o fluxo publicado só o coleta. Não ativar durante a migração.
2. `yellow-material` tem definição, mas não é registrado automaticamente pelas regras atuais. Não adicionar dependência nova.
3. O celular recuperado do capítulo 1 não se reabre após recarga, embora o capítulo seguinte permaneça desbloqueado. Preservar esse contrato.
4. O verso do inspetor não é retomado após recarga; as faces examinadas e o verso das folhas soltas são persistidos. Não unificar esses estados silenciosamente.
5. A rota Outro Lado e seu planejamento existem, mas o lançamento está fechado. Não remover os arquivos nem apresentar o jogo como publicado.
6. O texto das relações na gaveta parece ter contraste fraco em uma combinação visual observada; conservar primeiro, revisar em etapa visual separada.

## Lacunas de validação, não de conteúdo

- Confirmar manualmente o disparo/saída do apagão e o resultado final de T-03 em tela estreita.
- Confirmar pinça multitoque em dispositivo físico e encerramento completo do navegador.
- Gerar novas evidências visuais da implementação migrada; as capturas temporárias originais foram removidas pelo ambiente.
- Confrontar a branch nova com este inventário, hashes e testes antes de declarar paridade final.

Não existe autorização nesta auditoria para redesenhar a narrativa, publicar sobre o site de referência ou mesclar a migração na `main`.
