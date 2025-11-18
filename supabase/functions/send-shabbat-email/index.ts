import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import SunCalc from 'npm:suncalc@1.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UserData {
  user_id: string;
  email_address: string;
  latitude: number;
  longitude: number;
  city_name: string;
}

interface EmailRequest {
  testMode?: boolean;
  testEmail?: string;
}

function getNextFriday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  return nextFriday;
}

function calculateShabbatTimes(latitude: number, longitude: number, date: Date) {
  const times = SunCalc.getTimes(date, latitude, longitude);
  
  const sunset = new Date(times.sunset);
  const candleLighting = new Date(sunset.getTime() - 18 * 60000);
  
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const nextDayTimes = SunCalc.getTimes(nextDay, latitude, longitude);
  const havdala = new Date(nextDayTimes.sunset);
  
  return {
    candleLighting,
    sunset,
    havdala,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function getRandomTip(supabase: any): Promise<string> {
  try {
    const { data: tipsData, error } = await supabase
      .from('shabbat_tips')
      .select('content')
      .not('content', 'is', null);

    if (error || !tipsData || tipsData.length === 0) {
      return 'Take time to disconnect from devices and connect with loved ones this Shabbat.';
    }

    const randomIndex = Math.floor(Math.random() * tipsData.length);
    return tipsData[randomIndex].content;
  } catch (error) {
    console.error('Error fetching random tip:', error);
    return 'Take time to disconnect from devices and connect with loved ones this Shabbat.';
  }
}

function generateEmailHTML(
  cityName: string,
  candleLightingTime: string,
  sunsetTime: string,
  havdalaTime: string,
  tip: string,
  unsubscribeLink: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 12px;
            padding: 32px;
            border: 1px solid #e5e7eb;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
            border-bottom: 2px solid #dbeafe;
            padding-bottom: 24px;
          }
          .header h1 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 28px;
          }
          .header p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
          .location {
            text-align: center;
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 24px;
          }
          .times-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 32px;
          }
          .time-card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
          }
          .time-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .time-value {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
          }
          .havdala-card {
            grid-column: 1 / -1;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fcd34d;
          }
          .havdala-card .time-label {
            color: #92400e;
          }
          .havdala-card .time-value {
            color: #78350f;
          }
          .tip-section {
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .tip-title {
            font-size: 14px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .tip-content {
            color: #1f2937;
            font-size: 16px;
            line-height: 1.6;
          }
          .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            margin-top: 32px;
            font-size: 12px;
            color: #6b7280;
          }
          .footer-link {
            color: #3b82f6;
            text-decoration: none;
          }
          .footer-link:hover {
            text-decoration: underline;
          }
          .branding {
            margin-top: 16px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shabbat Times</h1>
            <p>Friday Digest</p>
          </div>

          <div class="location">
            <strong>${cityName}</strong>
          </div>

          <div class="times-grid">
            <div class="time-card">
              <div class="time-label">Candle Lighting</div>
              <div class="time-value">${candleLightingTime}</div>
            </div>
            <div class="time-card">
              <div class="time-label">Sunset</div>
              <div class="time-value">${sunsetTime}</div>
            </div>
            <div class="time-card havdala-card">
              <div class="time-label">Havdala (Saturday)</div>
              <div class="time-value">${havdalaTime}</div>
            </div>
          </div>

          <div class="tip-section">
            <div class="tip-title">Shabbat Tip</div>
            <div class="tip-content">${tip}</div>
          </div>

          <div class="footer">
            <p>
              <a href="${unsubscribeLink}" class="footer-link">Unsubscribe from these emails</a>
            </p>
            <div class="branding">
              <p>Powered by Shabbat Times Finder</p>
            </div>
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
    console.error('Error sending email via Resend:', error);
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EmailRequest = await req.json();
    const { testMode = false, testEmail } = body;

    if (testMode && testEmail) {
      const nextFriday = getNextFriday();
      const tip = await getRandomTip(supabase);

      const mockTimes = {
        candleLighting: '17:45',
        sunset: '18:03',
        havdala: '19:05',
      };

      const html = generateEmailHTML(
        'Jerusalem, Israel (Sample)',
        mockTimes.candleLighting,
        mockTimes.sunset,
        mockTimes.havdala,
        tip,
        'https://shabbattimes.local/unsubscribe'
      );

      const emailSent = await sendEmail(
        testEmail,
        'Shabbat Times - Friday Digest',
        html
      );

      if (!emailSent) {
        throw new Error('Failed to send test email');
      }

      await supabase.from('email_log').insert([
        {
          user_id: '00000000-0000-0000-0000-000000000000',
          email_address: testEmail,
          status: 'success',
          sent_at: new Date().toISOString(),
        },
      ]);

      return new Response(
        JSON.stringify({ success: true, message: 'Test email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from('user_subscription_preferences')
      .select(
        `
        user_id,
        user_reminder_preferences:user_id (
          email_address
        ),
        saved_cities:user_id (
          city_name,
          latitude,
          longitude
        )
      `
      )
      .eq('subscribed_to_friday_email', true);

    if (subscribersError) {
      throw subscribersError;
    }

    const nextFriday = getNextFriday();
    const tip = await getRandomTip(supabase);
    let successCount = 0;
    let failureCount = 0;

    for (const subscriber of subscribers || []) {
      const emailAddress = (subscriber.user_reminder_preferences as any)?.[0]?.email_address;
      const cityData = (subscriber.saved_cities as any)?.[0];

      if (!emailAddress || !cityData) {
        continue;
      }

      const { candleLighting, sunset, havdala } = calculateShabbatTimes(
        cityData.latitude,
        cityData.longitude,
        nextFriday
      );

      const html = generateEmailHTML(
        cityData.city_name,
        formatTime(candleLighting),
        formatTime(sunset),
        formatTime(havdala),
        tip,
        `https://shabbattimes.local/unsubscribe?user_id=${subscriber.user_id}`
      );

      const emailSent = await sendEmail(
        emailAddress,
        'Shabbat Times - Friday Digest',
        html
      );

      if (emailSent) {
        successCount++;
        await supabase.from('email_log').insert([
          {
            user_id: subscriber.user_id,
            email_address: emailAddress,
            status: 'success',
            sent_at: new Date().toISOString(),
          },
        ]);
      } else {
        failureCount++;
        await supabase.from('email_log').insert([
          {
            user_id: subscriber.user_id,
            email_address: emailAddress,
            status: 'failed',
            error_message: 'Email delivery failed',
            sent_at: new Date().toISOString(),
          },
        ]);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sending completed',
        successCount,
        failureCount,
      }),
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
