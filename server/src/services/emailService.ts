import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Configurar SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not configured. Email sending will be disabled.');
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@ebookstorepro.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'contato@ebookstorepro.com';

interface SendOrderEmailParams {
  customerEmail: string;
  ebookTitle: string;
  downloadUrl: string;
  orderId: string;
  orderDate: Date;
}

/**
 * Envia e-mail de confirmação de compra com link de download
 */
export async function sendOrderEmail(params: SendOrderEmailParams): Promise<void> {
  const { customerEmail, ebookTitle, downloadUrl, orderId, orderDate } = params;

  if (!SENDGRID_API_KEY) {
    console.error('❌ Cannot send email: SENDGRID_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const formattedDate = new Date(orderDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = 'Seu eBook está disponível para download – Ebook Store Pro';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 16px;
    }
    .order-details {
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .order-details p {
      margin: 8px 0;
      font-size: 14px;
    }
    .order-details strong {
      color: #1e293b;
    }
    .download-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .download-button:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 4px 0;
      font-size: 14px;
      color: #92400e;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 8px 0;
      font-size: 14px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Seu eBook está pronto!</h1>
    </div>
    
    <div class="content">
      <p>Olá,</p>
      
      <p>Obrigado por sua compra na <strong>Ebook Store Pro</strong>! Estamos felizes em ter você conosco.</p>
      
      <div class="order-details">
        <p><strong>📚 eBook:</strong> ${ebookTitle}</p>
        <p><strong>📧 E-mail:</strong> ${customerEmail}</p>
        <p><strong>📅 Data da compra:</strong> ${formattedDate}</p>
        <p><strong>🆔 Pedido:</strong> ${orderId.substring(0, 8)}...</p>
      </div>
      
      <p>Clique no botão abaixo para fazer o download do seu eBook:</p>
      
      <center>
        <a href="${downloadUrl}" class="download-button">
          📥 Baixar meu eBook
        </a>
      </center>
      
      <div class="info-box">
        <p><strong>ℹ️ Informações importantes:</strong></p>
        <p>• O link de download é válido por 24 horas</p>
        <p>• Você pode baixar até 3 vezes</p>
        <p>• Guarde este e-mail para acessar o link novamente</p>
      </div>
      
      <p>Se tiver qualquer problema com o download, responda este e-mail ou entre em contato conosco em: <strong>${SUPPORT_EMAIL}</strong></p>
      
      <p>Obrigado por confiar na Ebook Store Pro!</p>
    </div>
    
    <div class="footer">
      <p><strong>Ebook Store Pro</strong></p>
      <p>Suporte: ${SUPPORT_EMAIL}</p>
      <p style="margin-top: 16px; font-size: 12px;">
        Este é um e-mail automático. Por favor, não responda diretamente.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Olá,

Obrigado por sua compra na Ebook Store Pro! 🎉

Aqui estão os detalhes do seu pedido:

- eBook: ${ebookTitle}
- E-mail: ${customerEmail}
- Data da compra: ${formattedDate}
- Pedido: ${orderId.substring(0, 8)}...

Clique no link abaixo para fazer o download do seu eBook:

${downloadUrl}

INFORMAÇÕES IMPORTANTES:
• O link de download é válido por 24 horas
• Você pode baixar até 3 vezes
• Guarde este e-mail para acessar o link novamente

Se tiver qualquer problema com o download, responda este e-mail ou entre em contato conosco em: ${SUPPORT_EMAIL}

Obrigado por confiar na Ebook Store Pro!

---
Ebook Store Pro
Suporte: ${SUPPORT_EMAIL}
  `;

  const msg = {
    to: customerEmail,
    from: EMAIL_FROM,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', customerEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error instanceof Error && 'response' in error) {
      const sgError = error as any;
      console.error('SendGrid error details:', sgError.response?.body);
    }
    throw error;
  }
}

/**
 * Verifica se o serviço de e-mail está configurado
 */
export function isEmailServiceConfigured(): boolean {
  return !!SENDGRID_API_KEY;
}
