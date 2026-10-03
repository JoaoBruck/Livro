# Myu — revisão da leitura e das relações

15 de setembro de 2026.

Escopo autorizado: corrigir a demora ao virar documentos e melhorar os controles e as cores do site; pesquisar as relações e alterar somente os trechos que precisavam de revisão. O texto do capítulo 4 foi preservado integralmente.

## Revisão das relações

Foram alteradas onze falas: três no capítulo 1, uma no 2 e sete no 3. Nenhum bloco foi acrescentado ou removido. As âncoras, os acontecimentos, os estados de conhecimento e a distribuição dos enigmas permanecem iguais.

| Trecho | Problema concreto | Alteração |
|---|---|---|
| Capítulo 1 — Natan e Leroy | Três respostas espirituosas consecutivas faziam Natan parecer preparado para vencer cada troca. | Uma recusa direta, uma resposta cotidiana e uma admissão de incerteza substituem os aforismos. O humor característico permanece nas outras falas. |
| Capítulo 2 — Sônia ao telefone | “Vocês duas” tinha um referente incoerente na conversa com Alana sobre Augusto. | A resposta passa a se dirigir claramente a Alana, mantendo o pequeno constrangimento familiar. |
| Capítulo 3 — Leroy sobre Ravi | “Ensinar a memória” soava como formulação de um ensaio sobre investigação. | Leroy explica, em linguagem comum, que quer ouvir primeiro o que Ravi lembra. |
| Capítulo 3 — Flora e Derick | Uma explicação sobre o arquivo tinha registro excessivamente burocrático; a resposta de Derick quando a mãe voltava à cozinha soava como frase de suspense preparada para o leitor. | Flora conserva a informação necessária em linguagem doméstica. Derick desvia da pergunta com uma resposta comum. |
| Capítulo 3 — Meia | A construção sobre carregar a cachorra era truncada. | A fala fica mais fluida e ainda nomeia Meia, evitando confusão com a lembrança de Alana. |
| Capítulo 3 — jantar e lembrança da briga | Uma pergunta estava mal construída; o Derick adolescente formulava uma análise impecável em pleno confronto; a fala posterior repetia todas as ações já dramatizadas. | A pergunta reage diretamente a Leroy. No passado, Derick exige a mochila e insiste que não vai com ele. No presente, cobra a recusa de Leroy em parar. |

As cenas de Alana com Derick, de Alana com Leroy, das crianças na casa-lar e da ligação de Samuel já continham ações compartilhadas, necessidades diferentes e respostas ligadas ao momento. Não precisavam de uma nova camada de explicação emocional. A cena do corpo também foi mantida. A cooperação na investigação continua coexistindo com a ruptura entre os irmãos.

### Pesquisa usada

Blake, Bland e Rouncefield-Swales analisaram relatos de 291 pessoas que procuraram apoio para afastamento familiar. As experiências e os desejos de reconciliação variavam; uma infância próxima não impedia um afastamento posterior. A amostra é de pessoas que buscaram ajuda e trata de irmãos biológicos, portanto não representa diretamente a família de Myu. Aplicação editorial: preservar a história compartilhada e a cooperação sem convertê-las automaticamente em perdão. [Artigo e texto disponibilizado por uma das autoras](https://www.researchgate.net/publication/359191719_Estrangement_Between_Siblings_in_Adulthood_A_Qualitative_Exploration).

Ferrar e colegas observaram conflitos de adolescentes com irmãos e mães, encontrando relações entre expressão emocional e comportamento verbal, com semelhanças e diferenças conforme o vínculo. São interações observadas em uma amostra pequena, sobretudo no começo da adolescência; não constituem regras universais para adultos ou um manual de diálogo. Aplicação editorial: avaliar a resposta ao interlocutor e ao objetivo imediato, evitando que todos expliquem sentimentos com a mesma precisão. [Artigo e texto disponibilizado pelos autores](https://www.researchgate.net/publication/352067800_Conflict_Resolution_and_Emotional_Expression_in_Sibling_and_Mother-Adolescent_Dyads_Within-Family_and_Across-Context_Similarities).

Essas aplicações são decisões editoriais informadas pela pesquisa. Não são diagnósticos dos personagens. Foram combinadas com as orientações de diálogo humano, continuidade e anticlichês de Myu.

## Interface e funcionamento

| Defeito | Correção |
|---|---|
| O verso começava a carregar após o toque. | As duas faces são preparadas quando a folha se aproxima da área visível e permanecem montadas. A troca altera a face visível, sem trocar o endereço da mesma imagem. |
| Uma imagem em cache podia terminar antes de o leitor interativo iniciar. | O carregamento também verifica imagens já concluídas, além do evento de carga. Falhas têm retorno visível e tentativa de recuperação. |
| A leitura e gestos repetidos provocavam trabalho desnecessário no capítulo inteiro. | A barra de progresso foi isolada. O cálculo da posição usa busca binária. Inspeções já registradas não recriam o estado. O arraste de uma folha salva sua posição ao terminar. |
| A virada, a rotação e as ferramentas tinham pouca distinção. | Botão principal “Ver verso/Ver frente”, identificação da face, ampliação agrupada e estados explícitos de luz, transcrição e limites. Virar também recentraliza e desfaz a rotação. |
| A ampliação perdia a face atual e deixava o fundo disponível ao teclado. | A folha solta abre na face selecionada. Os documentos ampliados retêm o foco, fecham com Esc e devolvem o foco ao controle de origem. O modo Focar reserva o espaço ocupado na leitura. |
| Os controles misturavam cores de temas diferentes. | Paletas coordenadas para os quatro temas; estados novo, visto e marcado distintos; botões e textos auxiliares maiores; painéis internos dos enigmas compatíveis com o tema. |
| O índice vertical usava setas horizontais e controles apertados. | Setas para cima/baixo, áreas maiores e disposição que acomoda títulos e controles em telas estreitas. |
| O menu de capítulos podia ultrapassar a largura do celular. | Posição e largura limitadas à tela, com rolagem própria quando necessário. |

As doze faces passaram de **10.430.253 para 7.000.236 bytes**, redução de **32,9%**. Os WebP foram produzidos sem perdas a partir dos PNG originais. Dimensões e pixels RGBA foram comparados individualmente e permaneceram iguais. Os originais foram conservados.

A preparação das faces usa a API documentada de [decodificação de imagens](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode). Os pares de texto e fundo dos controles foram verificados contra o mínimo de 4,5:1 descrito pelo [W3C para texto normal](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Isso não equivale a uma certificação de acessibilidade de todos os documentos ficcionais.

## Conferência

- Compilação de produção concluída e artefato validado.
- 30 testes passaram, incluindo rotas, navegação, desbloqueios, migração de progresso, ausência de revelações antecipadas, paletas e arquivos de imagem.
- A seleção do parágrafo foi comparada à busca linear em limites, espaços e posições simuladas após mudança de tamanho. Em 551 âncoras, o teste exige no máximo dez medições por cálculo.
- Onze alterações textuais confirmadas, sem alteração da estrutura dos quatro capítulos. Capítulo 4 idêntico à versão anterior.
- As chaves e o formato do progresso de leitura e da investigação não foram alterados.

Esta rodada verificou código, renderização das rotas pelo servidor, dados narrativos, imagens e contrastes calculados. Não houve teste de gestos em navegador ou medição de tempo num celular real; a redução de 32,9% refere-se aos arquivos das faces, não ao tempo total de carregamento.
