# Ebook Store Pro - Guia de Deploy em VPS

Este guia explica como fazer o deploy do projeto Ebook Store Pro em um servidor VPS (Virtual Private Server) com Node.js e Nginx.

---

## 1. Pré-requisitos no VPS

Antes de começar, garanta que seu servidor tenha:

- **Node.js**: Versão 18.x ou superior
- **npm**: Versão 9.x ou superior (ou `pnpm` / `yarn`)
- **PM2**: `npm install pm2 -g` (gerenciador de processos)
- **Nginx**: Para servir o frontend e fazer proxy reverso para o backend
- **Banco de Dados**: Acesso a um banco de dados PostgreSQL (ex: Supabase)

---

## 2. Passos para Deploy

### **Passo 1: Upload e Descompactação**

1.  Faça o upload do arquivo `ebook-store-pro-prod-ready.zip` para o seu VPS.
2.  Descompacte o arquivo:
    ```bash
    unzip ebook-store-pro-prod-ready.zip
    ```
3.  Entre na pasta do projeto:
    ```bash
    cd ebook-store-pro
    ```

### **Passo 2: Configurar Variáveis de Ambiente**

1.  **Backend:**
    - Copie o arquivo de exemplo:
      ```bash
      cp server/.env.example server/.env
      ```
    - Edite `server/.env` e preencha **TODAS** as variáveis com suas chaves de produção (LIVE):
      - `DATABASE_URL` e `DATABASE_DIRECT_URL` (do Supabase)
      - `JWT_SECRET` (gere uma chave forte e única)
      - `STRIPE_SECRET_KEY` (chave `sk_live_...`)
      - `STRIPE_WEBHOOK_SECRET` (do seu endpoint de webhook no Stripe)
      - `SENDGRID_API_KEY` (do SendGrid)
      - `APP_BASE_URL` (ex: `https://seusite.com`)
      - `ALLOWED_ORIGINS` (ex: `https://seusite.com,https://www.seusite.com`)
      - `FRONTEND_URL` (ex: `https://seusite.com`)

2.  **Frontend:**
    - Copie o arquivo de exemplo:
      ```bash
      cp client/.env.example client/.env
      ```
    - Edite `client/.env` e preencha com suas chaves de produção:
      - `VITE_API_BASE_URL` (ex: `https://seusite.com/api`)
      - `VITE_STRIPE_PUBLISHABLE_KEY` (chave `pk_live_...`)

### **Passo 3: Instalar Dependências**

Use o script do `package.json` raiz para instalar tudo de uma vez:

```bash
npm run install:all
```

### **Passo 4: Buildar para Produção**

Use o script do `package.json` raiz para buildar frontend e backend:

```bash
npm run build
```

Isso criará as pastas `dist` em `server` e `client`.

### **Passo 5: Iniciar o Backend com PM2**

1.  Navegue até a pasta do servidor:
    ```bash
    cd server
    ```
2.  Inicie o servidor com PM2:
    ```bash
    pm2 start dist/index.js --name ebookstorepro
    ```
3.  Salve a configuração para reiniciar automaticamente após o boot do servidor:
    ```bash
    pm2 save
    ```
4.  Verifique os logs para garantir que tudo está funcionando:
    ```bash
    pm2 logs ebookstorepro
    ```

O backend estará rodando na porta `3001` (ou a que você configurou).

---

## 3. Configuração do Nginx (Proxy Reverso)

Para que seu domínio aponte para a aplicação, você precisa configurar o Nginx como um proxy reverso. Isso fará com que as requisições para `seusite.com` sejam direcionadas para a aplicação Node.js.

1.  Crie um novo arquivo de configuração no Nginx:
    ```bash
    sudo nano /etc/nginx/sites-available/ebookstorepro
    ```

2.  Cole a seguinte configuração, **substituindo `seusite.com` pelo seu domínio real**:

    ```nginx
    server {
        listen 80;
        server_name seusite.com www.seusite.com;

        # Redirecionar HTTP para HTTPS (se você tiver SSL)
        # location / {
        #     return 301 https://$host$request_uri;
        # }
    }

    server {
        # listen 443 ssl; # Descomente se tiver SSL
        server_name seusite.com www.seusite.com;

        # Caminho para os arquivos do frontend (build do React)
        root /caminho/para/seu/projeto/ebook-store-pro/client/dist;
        index index.html;

        # Rotas da API (proxy para o backend Node.js)
        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Rotas do frontend (React Router)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Configurações de SSL (se aplicável)
        # ssl_certificate /etc/letsencrypt/live/seusite.com/fullchain.pem;
        # ssl_certificate_key /etc/letsencrypt/live/seusite.com/privkey.pem;
    }
    ```

3.  Ative o site e reinicie o Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/ebookstorepro /etc/nginx/sites-enabled/
    sudo nginx -t # Testar configuração
    sudo systemctl restart nginx
    ```

---

## 4. Teste Final

Acesse `http://seusite.com` e verifique se a loja está funcionando. Teste o fluxo de compra, o admin e o download para garantir que tudo está correto em produção.
