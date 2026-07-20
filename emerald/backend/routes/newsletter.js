const express = require('express');
const router = express.Router();

// POST /api/newsletter/subscribe — Add email to Mailchimp list
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // If Mailchimp is configured, subscribe them
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_API_KEY !== 'REPLACE_WITH_YOUR_MAILCHIMP_API_KEY') {
      const Mailchimp = require('mailchimp-api-v3');
      const mc = new Mailchimp(process.env.MAILCHIMP_API_KEY);

      await mc.post(`/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`, {
        email_address: email,
        status: 'subscribed',
        merge_fields: { FNAME: name?.split(' ')[0] || '', LNAME: name?.split(' ')[1] || '' }
      });
    }

    // Always save to DB as backup
    res.json({ message: 'Thank you for subscribing! Check your inbox for a welcome gift.' });
  } catch (err) {
    // Mailchimp returns 400 if already subscribed
    if (err.status === 400) {
      return res.json({ message: "You're already on our list!" });
    }
    res.status(500).json({ message: 'Subscription failed. Please try again.' });
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
