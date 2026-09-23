# Revisão de 15/09/2026 — Myu em quatro capítulos

Pedido executado: dividir o antigo Capítulo 3 no encontro de Alana, aprofundar a reação dos irmãos, criar a continuação, reduzir o peso da investigação e atualizar o site.

## Resultado editorial

- Capítulo 3: 6.138 palavras, aproximadamente 31 minutos a 200 palavras/minuto, além das interações. Mirante, arquivo de Derick, oficina de Ravi, jantar, ruptura e encontro do corpo.
- Capítulo 4: 3.886 palavras, aproximadamente 20 minutos, além das interações. Reação à memória, posição na van, visita, índice desaparecido, confronto e ligação de Vicente.
- O fim do 3 permanece em 2017. O primeiro parágrafo do 4 situa explicitamente o retorno a 2025.
- A cena de Alana desenvolve a dificuldade de sustentá-la e a incompreensão do menino. Não apresenta a colisão, um autor de homicídio ou a causa clínica da morte.
- A ruptura é exposta no 3, sem reconciliação. No 4, a proibição de interromper é precisa e tem uma consequência reconhecível quando Leroy corta a explicação de Gouveia.
- Vicente confirma que encontrou Alana e que ela entrou na van. Derick confronta a mentira que ouviu; Leroy passa de perguntas contidas a uma exigência explícita. O aviso final permanece.

## Distribuição da investigação

| Capítulo | Documento | Método e momento |
| --- | --- | --- |
| 3 | D-01 | Pressão carbonada, luz e inversão; arquivo de Derick. |
| 3 | B-12 | Dois relógios independentes; jantar antes da ruptura. |
| 4 | T-02 | Reconstrução espacial e funcional; reação após a memória. |
| 4 | T-03 | Remontagem de fólios e remessa; varanda, diante da evasiva de Gouveia. |

T-01 passa a ser uma leitura de apoio, sem um quinto bloqueio. Os dois desafios do 4 ficam separados por mais de 1.500 palavras. A convergência é uma conferência dos vínculos já obtidos, sem outro formulário e sem acusação de autoria antecipada.

## Conferência de continuidade

- Capítulo 1 → 3: a recordação de Leroy é uma experiência conhecida e revelada voluntariamente; o pesadelo da festa não vira profecia.
- Capítulo 2 → 3: data, jaqueta, fotografia, luminária e desejo de voltar permanecem compatíveis. Derick não passa a conhecer o conteúdo exclusivo do ARG.
- Capítulo 2 → 4: entrada voluntária na van não significa que Alana planejasse fugir definitivamente. A confirmação de Vicente não transforma a fibra amarela em prova individualizante.
- Capítulo 3 → 4: pratos, água derramada, fotografia, pasta e endereço atravessam a divisão. A comida não chega novamente após o relato. Os documentos recuperados são os mesmos.
- A referência apagada de D-01 só é recuperada pelo verso; fotografias e falas posteriores foram corrigidas para não tratá-la como escrita disponível na frente.
- Corrigidos: retirada duplicada do copo, telefonema atendido duas vezes, repetição da abertura da fotografia, chegada repetida à casa, localização do regador, fala sem identificação e resposta de Ravi a uma acusação que havia sido cortada.
- Natan conserva as pistas comportamentais. A frase futura e a pré-reescrita continuam fora dos capítulos publicados.
- O antigo planejamento de eventos futuros não é automaticamente inserido no novo 4. As lacunas causais já registradas para a revelação completa continuam explicitamente pendentes no documento de continuidade.

## Leitura e apresentação

Capa original para o 4, nova composição nas aberturas, encerramentos com continuação, menu entre os quatro capítulos, controles documentais que quebram linha em telas pequenas, contraste e tamanho das instruções, contador do carbono e ajustes dos relógios minuto a minuto. Aparência e progresso continuam independentes.

A investigação mantém sua chave de salvamento. A migração liga as âncoras da antiga segunda metade à rota do 4 e preserva os demais capítulos. O acesso ao 4 é concedido ao alcançar o encerramento do 3, ou preservado para quem já avançara na edição anterior. A página secreta permanece fechada.

## Verificação

Os 24 testes passaram: lógica, migração de todos os pontos antigos, integridade narrativa, renderização das quatro rotas, metadados e isolamento da página secreta. Build validado e lint sem erros; os cinco avisos preexistentes sobre elementos de imagem não exigem alterar o sistema de documentos. Não houve sessão de navegador nesta revisão; a validação de rotas é executada pelo Worker compilado.

O `tsc` integral conserva três erros anteriores de tipagem de infraestrutura (`cloudflare:workers`, `Fetcher` e `D1Database`), sem erro nos arquivos da revisão. O build de produção e a execução do Worker compilado passaram; não se declara aprovação do verificador de tipos integral.

## Revisão posterior — plano fora de cena e familiaridade

Pedido: retirar a explicação antecipada da visita e reduzir a formalidade entre Leroy e Derick. O restaurante agora termina com um indício de que combinarão algo, seguido de uma elipse até a conta. O ensaio na caminhada e a explicação mental antes do blefe foram retirados. A composição falsa se revela na varanda; a condição rompida por Leroy só é explicitada na cobrança após a visita. A familiaridade aparece nas respostas parciais, na impaciência e na antecipação das reações do outro, sem reconciliação.

O Capítulo 4 passa a 3.514 palavras, cerca de 18 minutos, com 1.648 palavras entre os dois desafios. Corrigidas também a identificação e a circulação do cartão da peixaria, a retirada do índice, a roupa de Gouveia e o movimento da toalha. Os 35 pontos de leitura retirados remetem aos parágrafos mantidos; o progresso da investigação não é reiniciado.

Verificação desta revisão: releitura integral do 4, build de produção, 26 testes aprovados, lint sem erros e os mesmos cinco avisos anteriores de imagem. Não houve teste de navegador nesta revisão textual.
