const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ReminderEmailRequest {
  emailAddress: string;
  candleLightingTime: string;
  cityName: string;
}

function generateReminderEmailHTML(
  cityName: string,
  candleLightingTime: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            color: white;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
          }
          .location {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 24px;
          }
          .time-display {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 20px;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 24px;
          }
          .footer {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🕯️</div>
          <h1>Shabbat Reminder</h1>
          <div class="location">${cityName}</div>
          <div class="time-display">${candleLightingTime}</div>
          <p>Candle lighting time is approaching. Enjoy your Shabbat!</p>
          <div class="footer">
            <p>Powered by Shabbat Times Finder</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'noreply@shabbattimes.local',
        to,
        subject,
        html,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body: ReminderEmailRequest = await req.json();
    const { emailAddress, candleLightingTime, cityName } = body;

    if (!emailAddress || !candleLightingTime || !cityName) {
      throw new Error('Missing required fields');
    }

    const html = generateReminderEmailHTML(cityName, candleLightingTime);
    const emailSent = await sendEmail(emailAddress, 'Shabbat Reminder', html);

    if (!emailSent) {
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Reminder email sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
