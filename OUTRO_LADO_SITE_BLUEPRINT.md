# MYU — entrada do jogo no Outro Lado

Estado: página extra aprovada pelo autor em 07/09/2026. Estrutura reservada no
projeto existente; jogo e descoberta ainda não implementados. Não publicado.

## Decisão confirmada

- Fonte: pedido do autor, “pode abrir uma pagina nova assim que descobrirem o
  jogo, uma pagina extra pro outro lado”.
- O jogo terá uma página própria, separada da prosa, no mesmo projeto Sites.
- A descoberta do jogo será o gatilho de entrada nessa página.
- O acesso não deve aparecer previamente no menu comum dos capítulos.
- O autor restringiu o público do jogo aos seus dois amigos. O enigma de entrada
  deve usar referências compartilhadas entre eles e o autor, ainda não fornecidas.
  Não inventar lembranças, piadas internas, nomes ou respostas em nome deles.
- Os capítulos continuam públicos. A restrição vale para o jogo, não para o site
  inteiro. O enigma sozinho não autentica uma pessoa: acesso realmente exclusivo
  exige validação individual no servidor para os dois participantes autorizados,
  inclusive nas rotas e recursos privados do jogo. Não publicar respostas ou
  conteúdo protegido em arquivos públicos antes dessa validação.
- A aprovação da página não define cenas, personagens jogáveis, combates,
  documentos, novas manifestações, mapas ou a solução do enigma.
- Não altera a progressão já aprovada dos Executioners nem antecipa conteúdo
  do Capítulo 5 aos personagens dos capítulos anteriores.

## Preparação técnica

- Destino reservado: `/outro-lado`; título público genérico e `noindex`.
- Enquanto não houver jogo e descoberta finalizados, a rota responde 404 e o
  componente de passagem não exibe link nem navega. Não existe botão de teste
  para o leitor nem pista falsa.
- `OtherSidePassage` fica pronto para ser ligado ao futuro resultado validado
  da descoberta. Ele ainda NÃO é usado por nenhum capítulo ou ARG.
- A implementação proposta navega na mesma aba (`location.assign`), preserva
  o histórico de Voltar e usa o salvamento de leitura já existente em `pagehide`.
  Há link convencional de continuação se a navegação for interrompida.
- Não foi criado armazenamento de jogo nem alterado qualquer progresso de
  leitura, documentos, preferências ou desbloqueios.
- O sinalizador de disponibilidade serve apenas para impedir uma publicação
  prematura. Não é autenticação. Endereço oculto e `noindex` não garantem segredo
  nem impedem divulgação; validação no servidor deve integrar a entrega do jogo
  se o acesso por link compartilhado precisar ser restringido.
- Antes de habilitar, substituir a reserva 404 pelo jogo real e conectar a
  passagem à descoberta aprovada e à sua validação, na mesma atualização.

## Contrato e estados

| Estado | Entrada / ação | Resposta | Conhecimento |
| --- | --- | --- | --- |
| Reservado, atual | Tentativa de URL direta ou resultado de descoberta ainda sem jogo | 404 na página; nenhuma passagem na leitura | Nenhuma revelação |
| Não descoberto, futuro | Leitura normal | Entrada permanece ausente | Nenhuma pista nova criada pela interface |
| Descoberto, futuro | Solução aprovada, validada, com jogo disponível | Abre a página extra na mesma aba | Conteúdo revelado permanece pendente |
| Retorno, futuro | Voltar para a leitura | Usa o progresso independente dos capítulos | Nenhum conhecimento é transmitido aos personagens automaticamente |

## Pendências antes da abertura aos leitores

- Posição e capítulo da descoberta; pistas, ação e solução do enigma.
- Função narrativa específica, protagonista, cenário, recursos e conteúdo do jogo.
- Informação exclusiva do jogador e momento permitido para essa revelação.
- Política de validação de acesso, retorno e salvamento do jogo.
- Referências pessoais não sensíveis para o enigma e forma de identificar os dois
  amigos autorizados. Não substituir controle de acesso por senha em código local.
- Teste completo da descoberta real, navegação, falha recuperável, retorno,
  teclado, celular e preservação dos progressos existentes.

## Verificações desta preparação

- Rota indisponível não revela jogo ou conteúdo do Outro Lado no HTML.
- Nenhum capítulo inclui link para a rota ou sinalizador de descoberta.
- Só há destino quando descoberta e disponibilidade são verdadeiras.
- Capítulos 1, 2 e 3, fotografias, ARGs e conteúdo canônico permanecem intactos.
