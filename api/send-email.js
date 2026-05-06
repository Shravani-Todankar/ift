const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3002;

// ====== ZEPTO MAIL CONFIG ======
const ZEPTO_API_TOKEN = process.env.ZEPTO_API_KEY || 'Zoho-enczapikey PHtE6r1eQeu/2m56phQJ5fXqE8H1MNgt+r5uLAARs40WDKdQFk0GrtovmmTi+R1+B/QRFaTPndhqt7rJ5+zWLG+4MWcaWGqyqK3sx/VYSPOZsbq6x00at1kTcEbeUIPpcdJt3CPXuNbZNA==';
const FROM_EMAIL = 'noreply@indiafuturetycoons.com';
const FROM_NAME = "India's Future Tycoons";

const INBOX = {
  general: 'info@enlearning.in'
};

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== EMAIL TEMPLATES ======
function emailWrapper(title, badge, content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,0.12);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1a2e 0%,#2d2d54 100%);padding:30px;text-align:center;border-bottom:3px solid #f59e0b;">
      <h2 style="color:#f59e0b;font-size:1.4rem;margin:0;font-weight:700;">${title}</h2>
      <p style="color:#cbd5e1;font-size:13px;margin:6px 0 0;letter-spacing:1px;">INDIA'S FUTURE TYCOONS</p>
    </div>

    <!-- Content -->
    <div style="padding:30px;">
      <span style="display:inline-block;background:#f59e0b;color:#1a1a2e;padding:4px 12px;border-radius:50px;font-size:12px;font-weight:700;margin-bottom:14px;">${badge}</span>
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:18px 30px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;margin:0;">India's Future Tycoons (IFT)<br>indiasfuturetycoons.com</p>
    </div>
  </div>
</body>
</html>`;
}

function tableRow(label, value) {
  return `<tr>
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#1a1a2e;width:40%;background:#fafafa;">${label}</td>
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0f0f0;color:#555;">${value || '—'}</td>
  </tr>`;
}

function buildTable(rows) {
  var html = '<p style="color:#555;font-size:14px;margin-bottom:20px;line-height:1.6;">You have received a new inquiry from the IFT website.</p>';
  html += '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">';
  rows.forEach(function (r) {
    html += tableRow(r[0], r[1]);
  });
  html += '</table>';
  return html;
}

// School Inquiry — Bring IFT to My School
function schoolInquiryTemplate(data) {
  var content = buildTable([
    ['Full Name', data.name],
    ['Role', data.role],
    ['Email', data.email],
    ['Contact Number', data.contact],
    ['School Name & City', data.school]
  ]);
  return {
    subject: 'New School Inquiry — IFT Website',
    html: emailWrapper('New School Inquiry', 'Bring IFT to My School', content)
  };
}

// Partner Inquiry — Partner With IFT
function partnerInquiryTemplate(data) {
  var content = buildTable([
    ['Organization / Foundation', data.organization],
    ['Designation', data.designation],
    ['Email', data.email],
    ['Contact Number', data.contact]
  ]);
  return {
    subject: 'New Partner Inquiry — IFT Website',
    html: emailWrapper('New Partner Inquiry', 'Partner With IFT', content)
  };
}

// ====== ZEPTO MAIL API CALL ======
function sendEmail(to, subject, htmlBody) {
  return new Promise(function (resolve, reject) {
    var payload = {
      from: { address: FROM_EMAIL, name: FROM_NAME },
      to: [{ email_address: { address: to, name: 'IFT Team' } }],
      subject: subject,
      htmlbody: htmlBody
    };

    var postData = JSON.stringify(payload);

    var options = {
      hostname: 'api.zeptomail.in',
      port: 443,
      path: '/v1.1/email',
      method: 'POST',
      headers: {
        'Authorization': ZEPTO_API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    var req = https.request(options, function (res) {
      var body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error('Zepto Mail error: ' + res.statusCode + ' — ' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ====== API ROUTES ======

// School Inquiry
app.post('/api/school-inquiry', function (req, res) {
  var template = schoolInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    });
});

// Partner Inquiry
app.post('/api/partner-inquiry', function (req, res) {
  var template = partnerInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to send email' });
    });
});

// Health check
app.get('/api/health', function (req, res) {
  res.json({ status: 'ok', service: 'IFT Email API' });
});

// ====== START SERVER ======
app.listen(PORT, function () {
  console.log('IFT Email API running on port ' + PORT);
});
