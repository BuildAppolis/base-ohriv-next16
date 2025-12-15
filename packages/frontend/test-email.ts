import nodemailer from 'nodemailer';

// Your Unsend configuration from .env
const config = {
  UNSend_API_KEY: 'us_uvb2uuiu97_d1bfba1598ed8609628d198c2686736b',
  UNSend_HOST: 'https://mailer.ohriv.com',
  UNSend_DOMAIN: 'notify.ohriv.com',
  UNSend_FROM_EMAIL: 'no-reply@notify.ohriv.com',
  UNSend_FROM_NAME: 'Ohriv Inc.'
};

async function testEmailConnection() {
  console.log('🔧 Testing email connection with Unsend...');
  console.log('Host:', config.UNSend_HOST);
  console.log('Domain:', config.UNSend_DOMAIN);
  console.log('From:', `${config.UNSend_FROM_NAME} <${config.UNSend_FROM_EMAIL}>`);

  // Create transporter with common SMTP ports to try
  const ports = [587, 465, 25, 2525];

  for (const port of ports) {
    console.log(`\n📡 Trying port ${port}...`);

    try {
      const transporter = nodemailer.createTransport({
        host: config.UNSend_HOST.replace('https://', ''), // Remove https:// for SMTP
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user: 'unsend',
          pass: config.UNSend_API_KEY
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certs for testing
        }
      });

      // Test connection
      await transporter.verify();
      console.log(`✅ Connection successful on port ${port}!`);

      // Send test email
      const mailOptions = {
        from: `"${config.UNSend_FROM_NAME}" <${config.UNSend_FROM_EMAIL}>`,
        to: 'cory+test@gcodes.org',
        subject: '🧪 Email Test - Ohriv SMTP Connection',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 Email Test Successful!</h2>
            <p>This is a test email to verify your SMTP connection is working correctly.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Connection Details:</h3>
              <ul>
                <li><strong>Host:</strong> ${config.UNSend_HOST}</li>
                <li><strong>Port:</strong> ${port}</li>
                <li><strong>Domain:</strong> ${config.UNSend_DOMAIN}</li>
                <li><strong>From:</strong> ${config.UNSend_FROM_EMAIL}</li>
                <li><strong>Security:</strong> ${port === 465 ? 'SSL' : 'STARTTLS'}</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px;">
              If you received this email, your SMTP configuration is working correctly! 🚀
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              Sent from Ohriv Email Test Script - ${new Date().toISOString()}
            </p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent successfully!`);
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Response: ${result.response}`);

      return true; // Success!

    } catch (error) {
      console.log(`❌ Port ${port} failed:`, error instanceof Error ? error.message : 'Unknown error');

      // Continue to next port
      if (port === ports[ports.length - 1]) {
        console.log('\n💥 All ports failed. Here are some troubleshooting tips:');
        console.log('1. Check if the host should be just the domain (mailer.ohriv.com)');
        console.log('2. Verify the API key is correct');
        console.log('3. Check if Unsend uses different authentication');
        console.log('4. Confirm the SMTP port and security settings');
        console.log('5. Check if there are any IP restrictions');
      }
    }
  }

  return false;
}

// Alternative: Try using Unsend's API directly if SMTP doesn't work
async function testUnsendAPI() {
  console.log('\n🔄 Trying Unsend API directly...');

  try {
    const response = await fetch('https://api.unsend.dev/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.UNSend_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.UNSend_FROM_NAME} <${config.UNSend_FROM_EMAIL}>`,
        to: ['cory+test@gcodes.org'],
        subject: '🧪 API Test - Ohriv Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 API Email Test Successful!</h2>
            <p>This email was sent using the Unsend API instead of SMTP.</p>
            <p>If you received this, the API connection is working! 🚀</p>
            <p style="color: #666; font-size: 14px;">
              Sent via Unsend API - ${new Date().toISOString()}
            </p>
          </div>
        `
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API email sent successfully!');
      console.log('   Response:', data);
      return true;
    } else {
      console.log('❌ API email failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('❌ API test failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  return false;
}

// Run the tests
async function main() {
  console.log('🚀 Starting email connectivity test...\n');

  const smtpSuccess = await testEmailConnection();

  if (!smtpSuccess) {
    const apiSuccess = await testUnsendAPI();

    if (!apiSuccess) {
      console.log('\n💔 Both SMTP and API methods failed.');
      console.log('Please check your Unsend configuration and try again.');
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { testEmailConnection, testUnsendAPI };