# Revisão do piloto — 28/09/2026

Consistente no arco narrativo revisado, com informações do Myu verdadeiro deliberadamente reservadas. Fonte: pedido atual do autor, seguido da leitura integral dos quatro capítulos presentes no commit d80f71cf1410511fd3366d219b05a98d1e021cd1. Nenhum protótipo ou rascunho antigo foi usado como substituto do site.

O novo capítulo contém 5.819 palavras, sete cenas e aproximadamente trinta minutos de leitura. A abertura acompanha Natan; o núcleo fica próximo de Leroy; os cortes finais acompanham Natan e Flora. A confissão ocupa as duas maiores cenas. A segunda fala de Vicente, pela porta, acrescenta sua omissão consciente, o ato de esconder Alana de quem a procurava e a decisão de sustentar a mentira. Ela não repete a história inteira.

## Continuidade

| Fonte e conflito | Tipo | Correção aplicada |
| --- | --- | --- |
| Capítulo 1: dias desaparecida; capítulos 3 e 4: encontro naquela mesma noite | Contradição de duração | Horas, sem alterar a data ou o encontro do corpo |
| Capítulo 2: mala na secretaria e depois fotografada no dormitório | Ponte espacial ausente | Esclarecido o retorno da mala ao dormitório |
| Descrição interna de D-01 no 3: número manuscrito no rodapé; puzzle e prosa: número apagado | Contradição de suporte | Descrição alinhada à pressão invertida já recuperada pelo leitor |
| Base do 5 poderia tratar encontrar Alana como revelação inédita, apesar da ligação final do 4 | Repetição de revelação | O 5 parte da admissão anterior e exige o relato que faltava |
| Galpão poderia se confundir com depósito pequeno dos fundos | Lacuna geográfica | Imóvel antigo na rua de baixo, explicitamente distinto |
| Pais poderiam chegar por coincidência | Falta de ligação causal | Endereço e fotografia enviados antes; horário de contato combinado; Natan encaminha aos pais |
| Gravação poderia motivar o assassinato | Causalidade proibida pelo autor | Vicente nunca vê o gravador e decide após a recusa em encobrir |
| Telefone que perde sinal só na emergência | Conveniência evitada | Derick chama socorro e informa o local; atendimento existe antes da chegada dos pais |
| Fita sobreviveria exposta ao fogo | Lacuna material | Gravador ligado e pastas ficam no armário de aço, baixo e fechado; ninguém os recupera no capítulo |
| Plano anterior previa Outro Lado e profecia autocausada | Decisão revogada | Atualizados o registro e o planejamento; nada disso é exposto no capítulo |

A prosa do Capítulo 4 foi mantida integralmente. Seus dois puzzles e os do 3 continuam com as mesmas respostas, imagens e dados. A lembrança de Leroy não vira prova clínica. A fibra permanece compatível, sem individualização pericial. O laudo médico integral de Alana não é inventado: o 5 distingue o documento ausente da explicação de afogamento transmitida por Gouveia. A identidade do segundo motorista continua desconhecida, sem transformá-lo em revelação tardia necessária para absolver Vicente.

## Ritmo e reação

| Cena | Mudança | Motor | Intensidade |
| --- | --- | --- | --- |
| A carona | Rotina passa a uma escolha consciente de voltar | Vínculo / decisão | 1 → 2 |
| A casa acesa | A exigência precisa sair do alcance das crianças | Tensão social | 2 → 3 |
| A jaqueta | Vestígio se torna objeto conhecido; mentira é assumida | Revelação / vínculo | 3 → 5 |
| A escolha | Justificativa fracassa; Vicente recusa a consequência | Tensão moral | 3 → 5 |
| Do lado de dentro | A porta fechada se torna tentativa de homicídio | Medo / redução de saídas | 5 |
| Dez e vinte | Tarefa doméstica vira preocupação verificável | Contraste / espera | 1 → 4 |
| O endereço | Leroy é perdido; Derick é retirado | Perda / ação | 5 → 3 |

Não há reconciliação que resolva os dois anos de ruptura. A cooperação é prática: Derick aproxima a cadeira, não faz uma análise da dor de Leroy; no incêndio pede que fique, não oferece absolvição. Vicente usa seu cuidado real para defender sua autoridade; o cuidado não anula suas escolhas. Nenhum pensamento de Vicente é apresentado como acesso onisciente à sua mente.

## Leitura e imagem

- Rota `/capitulo-5`, menu de cinco capítulos e link efetivo no final do 4.
- Compatibilidade com a conclusão já salva do 4; retomada por âncora no 5; investigações e aparência preservadas.
- As cenas do clímax não ganham bloqueios, cronômetros, punições ou explicações de mecânica.
- Nenhum link para capítulo 6 ou para o jogo secreto; a reserva do Outro Lado continua respondendo 404.
- Capa original gerada uma vez com imagegen e integrada em WebP: interior do Opala, rádio âmbar, gravador e celular, rua cotidiana em azul noturno. Sem pessoas, incêndio ou sinal sobrenatural. O emblema discreto da marca no volante é compatível com o modelo citado, embora o brief pedisse ausência de logos.
- Prompt: capa horizontal em pixel art, vista do banco traseiro/lado do passageiro de um Opala antigo, pequena rua urbana habitada à noite, rádio âmbar, gravador e telefone no assento, azul-marinho, janelas iluminadas, espaço escuro à esquerda para título; sem texto legível, personagens, fogo ou pistas sobrenaturais.

## Verificação

Build de produção concluído, Worker validado e 32 testes aprovados, incluindo renderização das cinco rotas e isolamento da página secreta. Checagem dirigida de navegação e migração aprovada: 443 âncoras únicas, sete cenas, posição do 5 reconhecida e preservada, sem alteração da investigação. ESLint dos arquivos de implementação alterados passou.

O lint integral detecta dez erros anteriores em `evidence-system.tsx` (leitura de ref de arraste durante render) e `use-reader-dialog.ts` (análise de mutação de DOM), além de quatro avisos de imagens. Esses arquivos não foram modificados nesta revisão. Não se declara aprovação do lint integral. A habilidade de navegador exigida pelo fluxo de preview não está disponível; não houve teste visual em navegador, e a verificação de rotas usa o Worker compilado.

## Segunda passagem — emoção e correção do gravador

Solicitação posterior do autor: Natan leva o aparelho por iniciativa própria; Derick já o atualizou sobre o caso. Os momentos precisam transmitir emoção como no Capítulo 4. Esta passagem parte da versão 32 do site, commit `a6d3acc6ce3b9b501b4d08bb818d18720c85c3c0`.

- A conversa no Opala não apresenta o caso como novidade para Natan. Ele lê as atualizações, decide buscar o gravador e o entrega sem pedido de Derick. Sua preocupação permanece humana para o leitor.
- A jaqueta liga a prova à intimidade de Leroy e Alana. O relato de que ela pretendia voltar ganha espaço antes da colisão; a admissão da mentira altera a lembrança de Leroy sobre ter confiado em Vicente.
- Derick perde a firmeza sem perder a iniciativa. A reação à culpa pelo tratamento e o choro interrompem a sequência de perguntas; ele continua capaz de chamar socorro.
- O cuidado real de Vicente torna a traição mais difícil de assimilar. Leroy teme as consequências para a casa, admite não ter todas as respostas e mantém a decisão de ir à polícia. O antagonista conserva a escolha e a responsabilidade pelo incêndio.
- A fuga alterna tentativa concreta e medo. A esperança de que Vicente abra nasce dos anos de convivência; o pedido de desculpas não resolve nem alivia o abandono. O amparo entre irmãos não apaga a ruptura.
- A falta de resposta inquieta Natan progressivamente. Flora e Tomás encontram Leroy antes de Derick; a morte é inequívoca. O capítulo termina junto à ambulância, com Derick chamando pelo irmão e Flora sem conseguir responder.
- Corrigidos: espera de Derick como acontecimento daquela mesma noite de 2017; fala sobre uma pergunta de duração que ninguém tinha feito; ambiguidade de “Acho. Você cuidou”; chamada e movimento de Kaio; troca desnecessária de responsabilidade pelo telefonema; localização das pastas, da cadeira e dos celulares durante o incêndio.

Depois da ampliação emocional, uma passagem de concisão retirou 680 palavras de explicações e reações repetidas. Versão final: 7.815 palavras por contagem simples, sete cenas. Preservadas as 443 âncoras anteriores e adicionadas três, todas únicas. Manuscrito de leitura sincronizado com o JSON do site. Nenhuma mudança adicional nos capítulos 1–4, nas ilustrações, nos enigmas ou no código de leitura nesta passagem.

Verificação desta revisão: build de produção e validação do Worker concluídos; 32 testes existentes aprovados, inclusive as cinco rotas, o desbloqueio do 5 e a reserva da página secreta. Checagem de conteúdo confirmou a ausência de revelação dos mecanismos sobrenaturais, a preservação das âncoras e a correspondência integral entre manuscrito e dados. Sem novo teste visual de navegador; não se afirma tê-lo realizado.

## Terceira passagem — revisão integral e naturalidade da narração

Fonte: esclarecimento do autor de que aprofundar sentimentos significa narrá-los com a naturalidade do Capítulo 4. Base revista: versão 33, commit `ee421165e60a5a1501770a885b537a2d621cc619`. Foram relidos integralmente os cinco JSONs narrativos, além das transcrições relevantes das provas e do registro de continuidade.

**Veredito editorial:** o arco funciona e é consistente com os ajustes abaixo. A versão 33 do 5 exagerava na interpretação de reações: ação, lembrança, explicação emocional e conclusão frequentemente ocupavam o mesmo parágrafo. Isso alongava especialmente o incêndio e o resgate. O problema não era narrar sentimentos, mas comentar reiteradamente o que já estava compreensível.

O 4 alterna diálogo, comportamento e explicações breves, específicas: Derick teme uma resposta que o obrigue a imaginar a morte da irmã; Leroy reconhece uma dureza que não desejava usar com ele. Esse princípio orienta a revisão. Não foi aplicada uma proibição de verbos de sentimento nem uma conversão do texto em descrição puramente externa.

| Capítulo | Avaliação da leitura | Ajuste aplicado |
| --- | --- | --- |
| 1 | O cotidiano mostra o cuidado e a necessidade de controle de Leroy; o pesadelo continua psicológico. | Nenhuma alteração. |
| 2 | A convivência e a ambivalência de Alana sustentam a perda; a volta pelo portão contrariava a necessidade de chave pelo lado externo. | Alana pega o molho já deixado na bancada, abre com a chave e o devolve. Preservados o papel no trinco, a foto e os enigmas. |
| 3 | A ruptura permanece aberta e a investigação tem consequências pessoais. A ligação sobre Samuel podia sugerir uma segunda data para a apresentação. | Kaio diz que Samuel chegou com a nota da apresentação; o evento continua no dia do Capítulo 1. |
| 4 | Melhor referência de equilíbrio entre explicação emocional, diálogo e ação; as revelações e a cobrança de Derick se sustentam. | Nenhuma alteração. |
| 5 | Sequência dramática válida; narração anterior excessivamente comentada e alguns detalhes de memória imprecisos. | Revisadas 95 passagens, com sentimentos explícitos quando necessários e menos comentários após gestos e falas. |

### Correções de continuidade e causalidade

- No 3, Leroy não lembra da chegada de Vicente. No 5, já não é narrada uma lembrança detalhada dessa chegada. Ele recorda ter repetido a versão de que Vicente também não encontrara Alana; o diálogo daquela volta é relatado por Vicente.
- Natan continua informado pelas mensagens de Derick e leva o gravador por decisão própria. A narração não fornece justificativas sobrenaturais nem transforma o gravador em causa do crime.
- Preservados os horários de 2017, a ida inicial ao terminal na versão de Vicente, a colisão por outro motorista, a ocultação solitária do corpo, a participação institucional de Gouveia e a diferença entre hipótese pericial e identificação de Alana.
- O galpão permanece um local comum de armazenamento. Vicente escolhe matar depois de fracassar em obter silêncio; a fita não é descoberta. A chamada de emergência funciona, o endereço chega aos pais por Natan e a morte de Leroy é inequívoca.
- O retorno de Derick permanece fora do conhecimento dos personagens e da explicação pública. A ajuda entre os irmãos não soluciona a ruptura; o final não oferece uma reconciliação retroativa.

### Exemplo do critério de narração

Antes, a reação de Leroy à falta de socorro acumulava a expectativa de uma parte omitida, a ambulância, o atraso possível e a interpretação de sua própria necessidade. Agora: “Leroy esperou que ele corrigisse alguma coisa. Queria ouvir que alguém tinha tentado socorrê-la, mesmo sem conseguir.” A necessidade emocional permanece narrada e específica, sem uma segunda explicação depois dela.

A contagem simples caiu de 7.815 para 6.612 palavras. A redução é consequência da revisão, não uma meta de extensão. Todos os acontecimentos e as sete cenas foram mantidos. Nenhum token foi removido: as 446 âncoras do 5 e as posições dos trechos dos demais capítulos permanecem iguais. O manuscrito foi sincronizado.

Validação: build e Worker aprovados; 32 testes existentes aprovados; sequências, documentos interativos e âncoras conferidos. Sem alterações visuais e sem nova verificação em navegador. O teste técnico não é apresentado como prova de qualidade literária.

## Quarta passagem — reescrita integral após as referências

Zero pediu que o capítulo inteiro fosse refeito, usando os capítulos 3 e 4 como referência de história e narração, as quatro músicas como direção de atmosfera, o frio azulado com luzes como identidade visual e a confirmação de que Natan não fuma. Esta passagem substitui integralmente a prosa anterior do 5. O texto final possui 6.502 palavras, sete cenas e 428 parágrafos de leitura. O manuscrito e o conteúdo do site são idênticos.

### Pesquisa e aplicação

- [Emma Darwin, Showing and Telling](https://emmadarwin.substack.com/p/showing-and-telling): alternar evocação e explicação segundo a necessidade da cena. Aplicação: a narração esclarece o alívio de Leroy ao saber que Alana voltaria, a vergonha de ter confiado em Vicente, a dificuldade de negar o cuidado que recebeu e o medo que transforma indignação em súplica. O incêndio admite frases simples e ação sem interpretar cada gesto.
- [Laufey em entrevista à Teen Vogue](https://www.teenvogue.com/story/laufey-2023-bewitched-tour-style-interview): contexto da colaboração A Night to Remember e sua mudança de atmosfera. [Laufey em entrevista à NYLON](https://www.nylon.com/entertainment/laufeys-moodboard-for-her-debut-album-includes-rom-coms-her-cello): cotidiano, detalhe pessoal e referências instrumentais. Aplicação editorial própria: rádio, luz do carro, pão, conversas interrompidas; intimidade sem introduzir romance ou copiar linguagem musical.
- [Promise — contexto do lançamento](https://musicdaily.com/laufey-releases-new-jazz-ballad-promise/), [Where or When — entrevista de lançamento](https://www.nme.com/features/music-features/laufey-c24-bose-where-or-when-meet-the-artists-3772464) e [God Knows I Tried — entrevista com Lana Del Rey](https://www.nme.com/features/a-letter-from-lana-del-rey-the-full-nme-cover-interview-757009): foram consultados resultados indexados, metadados e declarações disponíveis; as páginas da NME não abriram integralmente. Não se afirma ter ouvido faixas por ferramenta nem lido material inacessível. A leitura editorial das referências foi de intimidade, familiaridade e perda contida, sem reproduzir letras ou transformar sofrimento em decoração.

Os títulos musicais foram interpretados como as faixas de beabadoobee/Laufey, Laufey e Lana Del Rey, respectivamente. São referências de atmosfera; não se tornaram trilha obrigatória, epígrafes, letras adaptadas, mecanismos sobrenaturais ou justificativa moral para Vicente. A prosa de Myu é guiada pelos capítulos existentes.

### Resultado narrativo

A carona tem rotina e preocupação concreta. Derick já contou o caso, Natan leva o aparelho por vontade própria e o entrega a Leroy. O pedido de esperar e a recusa dos irmãos têm espaço, sem converter Natan em vidente para o leitor. O rádio âmbar, a farmácia azulada, a luz das casas e o ar da serra estabelecem a noite sem anunciá-la como presságio. Não há cigarro ou cinzeiro.

A jaqueta passa de vestígio a roupa que Leroy consertou. Vicente conta o acidente e as escolhas posteriores numa voz controlada, corrigindo o próprio enquadramento quando pressionado. A narração aproxima a cena da confiança ferida de Leroy. Derick continua fazendo perguntas próprias; Leroy se esforça para não falar por ele, mas isso não resolve a ruptura do 3 e do 4.

O corte moral continua visível: Vicente escolhe trancar depois que os dois insistem na polícia. A fala externa admite que ele quis evitar testemunhas e que retirou a jaqueta para esconder a cor. Ele não descobre o gravador. A porta, a janela estreita e os móveis pertencem ao depósito comum estabelecido antes do incêndio. Não há explicação técnica de ignição.

Os telefones funcionam. A chamada de Derick antecede a de Flora; o endereço vem da mensagem enviada a Natan. A localização foi recebida quase meia hora antes das 22h20, deixando espaço para a conversa. Na revisão do percurso físico, foram conferidos o arquivo da clínica, a pasta de Leroy, o cadeado, os dois celulares e o gravador colocado no armário depois da confissão. Os pais encontram Leroy primeiro. O socorro participa do resgate sem convidar civis a entrar no fogo. Não se introduz desabamento que inviabilizaria a retirada.

A morte de Leroy é inequívoca. A morte e o retorno de Derick permanecem fora do conhecimento dos personagens e do leitor. No fim, Flora supera a primeira recusa em responder e conta que Leroy morreu. A viagem começa com a ausência dele ainda sem qualquer consolo ou reconciliação. Não há passagem ao Outro Lado, explicação de poder, recuperação da fita, captura de Vicente ou sexto capítulo.

### Revisão antes da publicação

Foram feitas leituras separadas das falas e da narração completa, além da conferência das transições, atribuição de voz e objetos. Foram retirados explicações redundantes, movimentos sem função e uma conclusão prematura de atendimento antes de procurar Derick. A composição da fibra continua sendo compatibilidade material, sem certeza pericial inventada; a memória da chegada de Vicente permanece falha como no 3. Os capítulos 3 e 4 não recebem alterações de prosa nesta passagem.

A reescrita substituiu os parágrafos, mas as 446 posições anteriores do 5 recebem destino válido dentro da mesma cena. A correção reaproveita o mecanismo existente de redirecionamento; o teste de retomada agora cobre os capítulos 4 e 5 e verifica que capítulo, rota, evidências e posição nova permaneçam corretos. Verificação final: build de produção concluído, artefato validado e 32 testes aprovados, incluindo as cinco rotas, bloqueios, isolamento do conteúdo secreto e retomada após a reescrita. A verificação técnica não substitui a revisão literária descrita acima. Não houve alteração do layout nem nova avaliação visual em navegador.


## Quinta passagem — abertura após retorno de leitura

Zero relatou quatro interrupções de leitura ainda na abertura com Natan. A cena tinha 833 palavras, demora na chegada e três reafirmações da decisão de voltar. A nova abertura tem 381 palavras: Natan já encosta junto aos irmãos no primeiro parágrafo. Foram retirados o percurso preliminar, o relógio, a porta que precisava bater de novo, a oferta de adiar para amanhã, a troca defensiva sobre perguntar a Derick e o teste completo do gravador. O cotidiano fica no rádio, no modo como Natan chega e na despedida. A decisão de voltar, o gravador trazido por Natan, o acompanhamento de Leroy e o compromisso das 22h20 continuam claros. Os 54 parágrafos antigos da abertura ganham destinos dentro da nova primeira cena; redirecionamentos anteriores são resolvidos diretamente, sem cadeias. As seis cenas seguintes foram preservadas integralmente.


## Sexta passagem — reformulação após leitura no celular

Os comentários e quatro capturas do autor substituem a aprovação anterior do confronto. O diagnóstico é de falas desconexas, personagens passivos diante de confissões fáceis e emoção pouco particular. O fim foi expressamente aprovado. A quinta passagem, só da abertura, não foi publicada separadamente: esta reformulação a substitui.

### Mudança dramática

O capítulo tem agora oito cenas e 6.401 palavras por contagem simples, incluindo travessões e separadores. A abertura tem 319 palavras. Leroy organiza a volta, busca apoio para a casa e propõe conversar no galpão. Ao passar pelas crianças jogando bola, participa brevemente de uma vida cotidiana que continua enquanto a sua está desmoronando. Seu medo de comprometer a instituição é admitido em voz alta e usado por Vicente; ele decide denunciar mesmo sem saber resolver essa consequência. Derick preserva a iniciativa de enviar o endereço, interroga o relato com o que conhece e demonstra mágoa e raiva, sem ser uma máquina de perguntas certas.

A jaqueta leva à lembrança da irmã viva, não apenas à confirmação de uma fibra. O relato de Vicente puxa a leitura para 2017: encontro, hesitação de Alana diante da mudança, entrada voluntária na van, conversa e colisão. O flashback corta no impacto. A frase seguinte é de Vicente no presente. A suposta ejeção até o riacho é inferência de Leroy diante de uma fala incompleta; não é encenada como fato objetivo. Derick questiona o cinto e não aceita automaticamente a explicação.

Antes do confinamento, Vicente reconhece omissões de socorro e teme pelas consequências para si e para a casa. Não admite que levou o corpo ao riacho. Alega ter recolhido a jaqueta para devolver. Só depois da porta fechada conta que Alana permaneceu ao lado dele, que levou o corpo até a passagem e tirou a jaqueta para esconder o amarelo. A conversa deixa de expor a verdade inteira antes de existir resistência.

Vicente já sabe quem encontrou o corpo. Leroy lembra de tentar contar a ele como fora o encontro, da culpa e do consolo recebido; não repete a descoberta como notícia. A passagem também preserva a lacuna de memória sobre a chegada de Vicente em 2017 estabelecida no 3. O agradecimento da volta é dito por Vicente, não recuperado subitamente por Leroy.

Foi corrigido um problema herdado: Sônia e Augusto já tinham saído da casa antes do desaparecimento no 2. Alana tenta adiar a mudança; não espera a visita acabar. A confissão mantém Gouveia como responsável pelo encobrimento institucional, sem fazê-lo carregar o corpo ou inventar um laudo médico acessível aos irmãos.

### Voz e emoção

Falas foram lidas separadamente para conferir qual fragmento cada personagem responde, o que tenta evitar e a pergunta que permanece sem resposta. Qualificadores de voz aparecem quando mudam a leitura: a altura involuntária de Derick na casa, seu retraimento diante da jaqueta, a voz rouca de Leroy ao falar do riacho e a gentileza com que Vicente tenta fazê-lo adiar a denúncia. Não foi aplicada uma camada de adjetivos a cada fala.

A narração explica desejos e contradições específicos: Leroy quer acreditar que houve uma tentativa de socorro, se envergonha de reagir como uma criança ao suspiro de Vicente e ainda reconhece seu cansaço. O cuidado cotidiano de Vicente permanece real na lembrança, o que torna a escolha de denunciá-lo mais difícil. Esse é o uso do 4 como referência, sem repetir sua conversa ou apagar o conflito entre os irmãos.

### Fim e continuidade material

Os dois últimos núcleos (Natan às 22h20; Flora e Tomás no galpão e na ambulância) são idênticos à versão 35, incluindo todas as âncoras. A tentativa de escapar do incêndio também permanece a partir do movimento de Vicente junto ao anexo; foi ajustado apenas o recolhimento da jaqueta, que Leroy havia tentado levar ao sair. A fita guarda a conversa inteira; Vicente nunca a vê. Telefones funcionam, endereços são enviados antes e a localização chega aos pais por Natan. Leroy morre; a verdade da morte e retorno de Derick continua fora do conhecimento dos personagens e da exposição ao leitor.

### Ambientação e leitura

Uma única ilustração original foi gerada para o interior da van: perspectiva do motorista, cabine utilitária vazia, serra azulada e painel âmbar. Ela acompanha exclusivamente o relato no passado. O arquivo WebP de 1672 × 941 mede 176.220 bytes. Texto é HTML selecionável, em coluna opaca, com os controles existentes de tamanho, fonte e largura; branco e preto preservam a preferência de leitura e foco remove o cenário. Sem animação obrigatória, som ou novo enigma. O primeiro travessão do retorno ao presente deixa de receber capitular.

As âncoras removidas das versões anteriores foram redirecionadas diretamente a parágrafos válidos da mesma etapa narrativa. O trecho anterior da confissão foi distribuído entre o relato e o confronto, enquanto os capítulos 1–4 e as evidências não mudaram. As notas de continuidade foram atualizadas para que a versão revogada não reapareça.

A arte foi inspecionada. A verificação de navegador não pôde ser feita porque o fluxo de prévia gerenciada exige o skill control-browser, indisponível nesta sessão; não foi usado um caminho alternativo. Build de produção concluído, Worker e manifesto validados, imagem incluída no artefato e 32 testes existentes aprovados. Conferência adicional confirmou oito cenas, 388 âncoras únicas, destinos válidos de retomada, manuscrito sincronizado, capítulos 1–4 inalterados e os dois últimos núcleos idênticos à versão 35. Esses controles verificam funcionamento, não garantem a reação literária do leitor.
