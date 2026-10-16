# Painel SARESP — PEI Marisa de Mello

Painel web responsivo para acompanhamento pedagógico, com resultados por ano, turma, bimestre e componente, links individuais de aula e questão, filtros, indicadores e plano de intervenção.

## Base Supabase

O painel consulta `public.saresp_results`, as metas de referência em `public.saresp_planning_targets`, o plano em `public.saresp_intervention_plan` e o catálogo curricular em `public.saresp_subject_catalog` pela rota somente-leitura `/api/saresp`.

### Dados atualmente carregados

- **4º ano A:** 180 registros dos três XLSX (60 por bimestre, do 1º ao 3º bimestre).
- **5º ano A e B:** 360 registros dos seis CSVs, do 1º ao 3º bimestre.
- **6º ano A:** 240 registros dos três XLSX (80 por bimestre, do 1º ao 3º bimestre).
- **Total:** 780 registros; todos possuem link de aula e link de questão.
- **Correlação do 4º ano:** 117 itens de Língua Portuguesa e Matemática associados pedagogicamente a 19 referências do Mapa SARESP do 5º ano.
- **Catálogo dos Anos Finais:** seis componentes curriculares por ano, do 6º ao 9º (24 entradas).

As correlações do 4º ano A ficam em `raw_data` e na tabela `public.saresp_map_focus_reference`, acompanhadas da observação de que são referências pedagógicas para orientar o planejamento. **Os registros do 4º ano não são resultados oficiais do SARESP e não recebem a marcação oficial `is_mapa_foco_saresp`.** Ciências, História e Geografia permanecem sem essa correlação, que foi solicitada somente para Língua Portuguesa e Matemática. Os registros do 6º ano também não são etiquetados como Mapa Foco SARESP.

Os componentes do catálogo são Língua Portuguesa, Matemática, Ciências, História, Geografia e Língua Inglesa. As referências curriculares do 5º ano constam nos guias de Língua Portuguesa (páginas 46–50) e Matemática (páginas 71–78).

Referência da divulgação: [Circular 157/2025 — Mapa Foco 2025, URE Osasco](https://deosasco.educacao.sp.gov.br/circulares-2025/). [Documento de referência dos Anos Finais](https://pt.scribd.com/document/898247838/Mapa-Foco-2025-SAEB-e-SARESP-Anos-Finais-e-EM).

## Como acrescentar dados

No Dashboard do Supabase, abra **Table Editor → public.saresp_results**. Acrescente linhas com turma (`class_group`), bimestre, série (`grade_label`), percentual de 0 a 100, descritor, componente, link da aula, link da questão, nome do arquivo e número da linha de origem.

A combinação `source_file` + `source_row` é única. Para novos registros, use novas linhas de origem ou um novo nome de arquivo. A API lê os dados em páginas de até 1.000 linhas, e o painel atualiza os filtros, o gráfico e os materiais depois que os dados são recarregados.

Para adicionar a referência detalhada do Mapa Foco posteriormente, utilize a tabela `public.saresp_map_focus_reference`; preencha descritor, série, componente, código oficial quando houver, documento de referência, bimestre(s) e estado de validação. Não marque um descritor como Mapa Foco antes de conferir essa correspondência.

## Deploy Vercel

- Painel: https://painel-saresp-pei-marisa.vercel.app/
- Repositório: https://github.com/CamposIvan/portal-marisa

A integração utiliza as variáveis de ambiente da Vercel `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Não coloque uma chave administrativa no HTML ou no repositório.
