import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: {
          name: 'gosholo support form',
          email: 'noreply@gosholo.com', // Must be a verified sender in Brevo
        },
        to: [
          {
            email: 'support@gosholo.com',
            name: 'Gosholo Support',
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `📧 Nouvelle demande de support - ${name}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #016167 0%, #024a4f 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #016167; }
              .label { color: #016167; font-weight: bold; margin-bottom: 5px; }
              .value { color: #333; font-size: 16px; }
              .message-box { background: white; padding: 20px; border-radius: 6px; border: 1px solid #e0e0e0; margin-top: 15px; }
              .message-content { color: #555; font-size: 15px; white-space: pre-wrap; }
              .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 Nouvelle demande de support</h1>
              </div>
              <div class="content">
                <div class="info-box">
                  <div class="label">👤 Nom du contact :</div>
                  <div class="value">${name}</div>
                </div>

                <div class="info-box">
                  <div class="label">📧 Adresse email :</div>
                  <div class="value"><a href="mailto:${email}" style="color: #016167; text-decoration: none;">${email}</a></div>
                </div>

                <div class="info-box">
                  <div class="label">💬 Message :</div>
                  <div class="message-box">
                    <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                  </div>
                </div>

                <div class="footer">
                  <p>Ce message a été envoyé via le formulaire de support Gosholo Partner</p>
                  <p>Vous pouvez répondre directement à cet email pour contacter ${name}</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        textContent: `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           📧  NOUVELLE DEMANDE DE SUPPORT                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

👤 NOM DU CONTACT
   ${name}

📧 ADRESSE EMAIL
   ${email}

💬 MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

──────────────────────────────────────────────────────────────
Ce message a été envoyé via le formulaire de support Gosholo Partner
Vous pouvez répondre directement à cet email pour contacter ${name}
──────────────────────────────────────────────────────────────
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Brevo API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending support email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
