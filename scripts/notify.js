#!/usr/bin/env node

const https = require('https');

class Notifier {
  constructor() {
    this.slackWebhook = process.env.SLACK_WEBHOOK;
    this.siteUrl = process.env.SITE_URL || 'https://www.glgcapitalgroup.com';
  }

  async notify(type, details = {}) {
    const timestamp = new Date().toISOString();
    
    if (type === 'success') {
      await this.sendSuccessNotification(timestamp, details);
    } else if (type === 'failure') {
      await this.sendFailureNotification(timestamp, details);
    } else if (type === 'health') {
      await this.sendHealthNotification(timestamp, details);
    }
  }

  async sendSuccessNotification(timestamp, details) {
    const message = {
      text: '🎉 GLG Capital Financial - Deploy Successful!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 Deploy Successful!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Site:*\n${this.siteUrl}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${timestamp}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '✅ All systems operational\n✅ Tests passed\n✅ Performance optimized\n✅ Security verified'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Site',
                emoji: true
              },
              url: this.siteUrl,
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Health Check',
                emoji: true
              },
              url: `${this.siteUrl}/api/health`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(message);
  }

  async sendFailureNotification(timestamp, details) {
    const message = {
      text: '🚨 GLG Capital Financial - Deploy Failed!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Deploy Failed!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Site:*\n${this.siteUrl}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${timestamp}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Error Details:*\n${details.error || 'Unknown error'}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '❌ Immediate attention required\n❌ Site may be down\n❌ Check logs and fix issues'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Logs',
                emoji: true
              },
              url: 'https://vercel.com/dashboard',
              style: 'danger'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Health Check',
                emoji: true
              },
              url: `${this.siteUrl}/api/health`
            }
          ]
        }
      ]
    };

    await this.sendToSlack(message);
  }

  async sendHealthNotification(timestamp, details) {
    const status = details.status || 'unknown';
    const emoji = status === 'healthy' ? '✅' : status === 'warning' ? '⚠️' : '🚨';
    
    const message = {
      text: `${emoji} GLG Capital Financial - Health Check: ${status}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Health Check: ${status.toUpperCase()}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Site:*\n${this.siteUrl}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${timestamp}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: this.formatHealthDetails(details)
          }
        }
      ]
    };

    await this.sendToSlack(message);
  }

  formatHealthDetails(details) {
    if (!details.checks) return 'No health check details available';

    const checks = details.checks;
    let text = '*Health Check Results:*\n';

    Object.entries(checks).forEach(([name, check]) => {
      const status = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      text += `${status} *${name}:* ${check.status}`;
      
      if (check.responseTime) {
        text += ` (${check.responseTime}ms)`;
      }
      
      if (check.error) {
        text += `\n  Error: ${check.error}`;
      }
      
      text += '\n';
    });

    return text;
  }

  async sendToSlack(message) {
    if (!this.slackWebhook) {
      console.log('Slack webhook not configured, skipping notification');
      return;
    }

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(message);
      
      const options = {
        hostname: 'hooks.slack.com',
        port: 443,
        path: this.slackWebhook.replace('https://hooks.slack.com', ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Notification sent successfully');
            resolve();
          } else {
            console.error('❌ Failed to send notification:', res.statusCode, responseData);
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error sending notification:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}

// CLI usage
if (require.main === module) {
  const notifier = new Notifier();
  const type = process.argv[2];
  const details = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  notifier.notify(type, details)
    .then(() => {
      console.log('Notification sent successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to send notification:', error);
      process.exit(1);
    });
}

module.exports = Notifier; 