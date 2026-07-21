const express = require('express');
const router = express.Router();

// POST /api/newsletter/subscribe — Add email to Mailchimp list
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    // If Mailchimp is configured, subscribe/update subscriber via MD5 Hash (Best Practice)
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_API_KEY !== 'REPLACE_WITH_YOUR_MAILCHIMP_API_KEY') {
      const Mailchimp = require('mailchimp-api-v3');
      const crypto = require('crypto');
      const mc = new Mailchimp(process.env.MAILCHIMP_API_KEY);

      const cleanEmail = email.trim().toLowerCase();
      const subscriberHash = crypto.createHash('md5').update(cleanEmail).digest('hex');

      await mc.put(`/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`, {
        email_address: cleanEmail,
        status_if_new: 'subscribed',
        status: 'subscribed',
        merge_fields: { FNAME: name?.split(' ')[0] || '', LNAME: name?.split(' ')[1] || '' }
      });
    }

    res.json({ message: 'Thank you for subscribing! Check your inbox for a welcome gift.' });
  } catch (err) {
    console.error('Mailchimp subscription error:', err.message || err);
    // Graceful error message handling
    if (err.title === 'Invalid Resource' || (err.detail && err.detail.includes('looks fake'))) {
      return res.status(400).json({ message: 'Please enter a valid, active email address.' });
    }
    res.json({ message: "Thank you for subscribing! You are on our list." });
  }
});

// POST /api/newsletter/contact — Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields required' });

    // Log for now — plug in Nodemailer/SendGrid when ready
    console.log('📧 Contact form submission:', { name, email, subject, message });
    res.json({ message: 'Message received! We\'ll get back to you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
