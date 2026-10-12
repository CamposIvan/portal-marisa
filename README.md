# Painel SARESP — PEI Marisa de Mello

Painel web responsivo para acompanhamento pedagógico dos resultados do 5º ano, com histórico por bimestre, filtros, plano de intervenção e banco de aulas e questões.

## Publicação na Vercel

O projeto é um site estático em HTML. O arquivo principal é [index.html](./index.html), e o arquivo [vercel.json](./vercel.json) configura a publicação sem etapa de build ou instalação de dependências.

Para publicar:

1. Acesse https://vercel.com/new e entre na sua conta.
2. Escolha **Import Git Repository** e selecione `CamposIvan/portal-marisa`.
3. Confirme a raiz do projeto (`./`) e o preset **Other**. O comando de build deve ficar vazio e o diretório de saída é `.`.
4. Clique em **Deploy**.

Depois da primeira publicação, os commits enviados à branch `main` poderão gerar novas implantações se o repositório continuar conectado à Vercel.

## Arquivos

- `index.html`: painel completo.
- `vercel.json`: configurações da hospedagem estática.
