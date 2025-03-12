# Configuração do Projeto na Vercel

## 1. Configurar Variáveis de Ambiente

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto "LeadFlow"
3. Clique em "Settings" no menu superior
4. Role até a seção "Environment Variables"
5. Adicione as seguintes variáveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://arscmhkqmllgwkdfpwrl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyc2NtaGtxbWxsZ3drZGZwd3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzYwNzcsImV4cCI6MjA1NTY1MjA3N30.VIohQC4cIYNTNNwvjPCFghVA0MpowYSyvlvuf_2WMIE
```

6. Clique em "Save" para salvar as variáveis

## 2. Redeployar o Projeto

1. Vá para a aba "Deployments"
2. Encontre o último deploy
3. Clique nos três pontos (...)
4. Selecione "Redeploy"

## 3. Verificar o Deploy

1. Aguarde o deploy ser concluído
2. Acesse a URL do seu projeto
3. Verifique se a página de login/registro está funcionando corretamente

Se encontrar algum erro, verifique:
- Se as variáveis de ambiente foram salvas corretamente
- Se o formato das variáveis está exato (sem espaços extras)
- Se o deploy foi realmente refeito após adicionar as variáveis 