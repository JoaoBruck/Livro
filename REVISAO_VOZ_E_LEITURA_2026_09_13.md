# Myu — revisão de voz e leitura

Revisão de 13 de setembro de 2026, aplicada aos três capítulos do site.

## Critério editorial

O problema confirmado foi a proximidade excessiva entre a cadência das crianças, a ironia dos adultos e as conversas de sofrimento. Atribuir um falante não bastava para comunicar o tom. A revisão combina indicações curtas de voz, pausas, respostas interrompidas, ações e mudanças de vocabulário. Uma indicação pode sustentar várias falas; ela não precisa reaparecer em cada linha.

A releitura posterior cortou marcas redundantes da própria revisão. O critério foi esclarecer o que se ouve e preservar espaço para interpretar por que o personagem falou daquela maneira. Não foi atribuída uma única emoção permanente a cada personagem.

## Mudanças aplicadas

- **Leroy:** a voz de organizar tarefas cede diante das crianças; ele erra a tentativa de aliviar a ansiedade de Samuel e corrige o rumo. Com Natan, a cobrança dá lugar à insegurança. Com Derick, preocupação, defesa e vergonha não soam iguais.
- **Derick:** a literalidade e as vozes inventadas da infância diferem da contenção adulta. No jantar, o volume e a escolha das palavras mudam quando a conversa chega àquela noite. Ouvir o passado não resolve a relação.
- **Alana:** impaciência, brincadeira, entusiasmo pelo presente e medo da partida aparecem de maneiras diferentes. O jogo de sombras ganhou vozes reconhecíveis e falantes mais claros.
- **Kaio, Clarice e Samuel:** o telefonema do Capítulo 3 passa a sustentar a alegria por Samuel ter concluído a apresentação. Clarice interrompe porque quer contar; Samuel tenta diminuir a própria conquista; Kaio cuida da logística da casa. O retorno à preocupação acontece quando Leroy menciona o jantar.
- **Ravi e Gouveia:** a admissão de Ravi ficou menos parecida com uma conclusão editorial. Em Gouveia, a condescendência inicial dá lugar à defesa burocrática, à elevação da voz e à expulsão.

### Exemplos do texto

| Antes | Depois | Função |
|---|---|---|
| — Nossa. Mudou minha vida. | — Nossa. Mudou minha vida. — Samuel caprichou no entusiasmo falso. | Tornar a ironia audível. |
| — Samuel. | Leroy chamou mais baixo: — Samuel. | Mostrar que a cobrança mudou para escuta. |
| — Esse é o Cão-Morcego — informou. | — Esse é o Cão-Morcego — Derick informou, experimentando também uma voz mais grossa. | Diferenciar a brincadeira da voz habitual e esclarecer o falante. |
| — Esse era o objetivo — Leroy disse. | — Sete tá bom, Clarice. Chama ele — Leroy disse, tentando ser ouvido. | Trocar a explicação pelo envolvimento na conversa. |

## Conferência de continuidade

Quantidade, sequência e tipos dos blocos preservados: 448 no Capítulo 1, 551 no 2 e 1.033 no 3. Mensagens, artefatos e documentos mantidos; métodos, soluções e ordem dos enigmas preservados. As âncoras existentes de leitura continuam válidas.

Correções pontuais: o portão do Capítulo 2 abre pelo trinco interno; a fala antiga sobre um código abreviado não contradiz mais a referência completa; o rádio não volta a tocar sem ser ligado; o telefonema final não recupera a antiga piada do cone. A lembrança de Leroy continua sendo uma experiência vivida, sem revelar a cadeia causal da morte. A ruptura dos irmãos permanece aberta. O segredo futuro de Natan continua fora dos capítulos publicados.

## Experiência de leitura

- Controles de tamanho, fonte, entrelinhas, largura, quatro cores de página e redução de ornamentos. Preferências salvas separadamente da investigação.
- Alterações de tipografia procuram manter o parágrafo visível na posição atual; a mudança de tamanho também atualiza os limites visuais do apagão.
- Índice de capítulos com retorno à posição salva; capítulos bloqueados não ganham um atalho de acesso.
- Índice das cenas disponíveis, sem exibir as cenas futuras ainda bloqueadas do Capítulo 3.
- Contagem de palavras calculada a partir do texto, excluindo marcadores de documentos. Estimativa de leitura separada do tempo de investigação.
- Indicador de marcas localizadas na folha do Capítulo 2 e instruções mais legíveis.
- Indicações de voz colocadas antes do travessão passam a ter uma linha própria na página.

Contagens exibidas: Capítulo 1, 4.898 palavras; Capítulo 2, 7.043; Capítulo 3, 12.183. O Capítulo 3 continua longo: cerca de 61 minutos de prosa, além da investigação. Esta revisão não equivale a uma nova edição abreviada.

## Pesquisa e aplicação

1. [Writing Excuses 9.19 — Showing Emotion](https://writingexcuses.com/writing-excuses-9-19-showing-emotion/). A conversa entre os autores diferencia emoção sentida de manifestação pública e discute o risco de personagens limitados a um registro. Aplicação editorial: explicitar o tom quando necessário e retirar descrições que interrompem uma troca já clara.
2. [Writing Excuses 17.34 — Developing Subtext](https://writingexcuses.com/17-34-developing-subtext/). O subtexto depende do contexto disponível ao leitor. Aplicação: gestos e entonação oferecem contexto sem transformar as falas em explicações completas das motivações.
3. [The Creative Penn — Dialogue and Character Voice, com Jeff Elkins](https://www.thecreativepenn.com/2021/04/05/dialogue-character-voice/). Aplicação: revisar o estado emocional e o objetivo de cada participante, especialmente no telefonema, em vez de usar a conversa apenas para transmitir informação.
4. [W3C — Understanding Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). Referência para permitir adaptação da leitura. Os novos controles não constituem, por si só, certificação de conformidade WCAG.

## Validação e limites

- Build de produção e validação do artefato executados.
- 18 testes automatizados: rotas renderizadas, controles e âncoras, dados narrativos, persistência independente, acesso aos capítulos, aparência inicial, preferências inválidas e armazenamento indisponível.
- Ordem e metadados dos blocos comparados com a versão anterior. Trechos alterados relidos com foco em falantes, repetição, tom e continuidade.
- Corrigidas incompatibilidades de tipos nos estados de arraste e adicionada validação da ordem salva no enigma de folhas. Dados inválidos não são mais usados como identificadores de anexos.
- A checagem TypeScript global ainda encontra três declarações de ambiente ausentes no código de infraestrutura já existente: `cloudflare:workers`, `Fetcher` e `D1Database`. Isso é distinto do build de produção, que passou. Nenhum erro TypeScript permaneceu na pasta da aplicação nessa checagem.
- Esta rodada não incluiu uma nova sessão de navegador nem leitura por participantes externos. Os testes automatizados não medem a reação emocional do público nem substituem uma avaliação visual em aparelho real.
