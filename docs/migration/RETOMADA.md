# Migração pausada a pedido do autor

Data: 23/09/2026 (UTC).

Destino oficial: **JoaoBruck/Livro**, branch `migration/full-myu`.
Fonte: https://myu-capitulo-um.http-joao-spam.chatgpt.site — versão 31, commit `d80f71cf1410511fd3366d219b05a98d1e021cd1`.

## Ponto de retomada

- Auditoria do original registrada em `AUDITORIA-ORIGINAL.md`; inclui os limites da validação manual.
- Cópia integral local: `/workspace/myu-migration`, com 117 arquivos originais, conferidos por SHA-256, e 36 commits históricos preservados.
- Checkout de referência: `/workspace/sites/myu-capitulo-um`; não foi alterado nesta migração.
- **25 de 117 arquivos** tiveram envio de blob confirmado e hash Git conferido. Estão vinculados ao commit de pausa desta branch.
- **92 arquivos** ainda precisam ser enviados. A branch é um checkpoint incompleto e ainda não pode ser tratada como uma versão executável do site.
- O inventário completo está em `original-files.json`; os capítulos integrais, em `original-chapters.json`.
- `transfer-checkpoint.json` guarda cada SHA enviado e a lista exata do que falta. Não é necessário repetir a auditoria nem reenviar esses blobs.
- O backup restaurável do histórico está em `docs/migration/history/` na cópia local, com manifesto e nove partes. **Esse backup ainda não foi enviado ao GitHub**.
- Não foram iniciadas a reorganização dos módulos nem alterações narrativas, visuais ou de comportamento. A `main` e o site publicado continuam intactos.

## Ao retomar

1. Ler este checkpoint, conferir o HEAD remoto e retomar somente os arquivos pendentes.
2. Concluir o envio dos 117 arquivos, comparar o tree remoto com todos os hashes e modos do manifesto.
3. Enviar a auditoria e o histórico restaurável; não perder materiais não usados na interface.
4. Registrar uma base integral antes de qualquer refatoração. A organização dos sistemas deve ser um commit separado.
5. Executar a validação de paridade e registrar as lacunas já identificadas, sem apresentar testes não feitos como aprovados.

**Não houve conclusão, merge ou publicação desta migração.**
