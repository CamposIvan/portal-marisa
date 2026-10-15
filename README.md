# Painel SARESP — PEI Marisa de Mello

Painel web responsivo para acompanhamento pedagógico dos resultados do 5º ano, com histórico por bimestre, filtro Mapa Foco SARESP, links de aula e questão e plano de intervenção.

## Banco Supabase

O painel carrega os dados de `public.saresp_results`, as metas de `public.saresp_planning_targets` e o plano de `public.saresp_intervention_plan` através da rota somente-leitura `/api/saresp`.

A integração usa as variáveis de ambiente da Vercel `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Não é necessário adicionar chaves privadas ao HTML ou ao GitHub.

### Como acrescentar dados depois

No Dashboard do Supabase, abra **Table Editor → public.saresp_results** e importe/adicone linhas com turma (`class_group`, A/B), bimestre, percentual em escala 0–100, descritor, disciplina, links da aula e questão, arquivo de origem e número da linha. Para evitar duplicações, `source_file` + `source_row` é a chave única; use novos números de linha para acrescentar registros e mantenha os mesmos para atualizar registros importados.

Preencha `is_mapa_foco_saresp` como verdadeiro apenas nos descritores identificados no Mapa Foco e preencha `aprendizagens_essenciais` com um array JSON quando a AE estiver mapeada. O painel lê esses campos do banco ao ser aberto; não precisa editar o HTML para acrescentar novas linhas.

Metas e planejamento são armazenados separadamente em `saresp_planning_targets` e `saresp_intervention_plan`. As tabelas de leitura pública permitem apenas consultas; gravações ficam restritas ao ambiente administrativo do Supabase.

## Deploy Vercel

O projeto não exige etapa de build nem instalação de dependências. O HTML usa a rota de API em `api/saresp.js`, configurada para executar no servidor Vercel.

- Painel: https://painel-saresp-pei-marisa.vercel.app/
- Repositório: https://github.com/CamposIvan/portal-marisa

