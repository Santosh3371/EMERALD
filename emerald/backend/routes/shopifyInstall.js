const express = require('express');
const router = express.Router();

// One-time OAuth bootstrap to obtain a static Admin API access token for a
// custom Shopify app created via the Dev Dashboard. Not used by the app at
// runtime — visit /api/shopify/install?shop=your-store.myshopify.com once,
// approve, and the callback prints the token to copy into .env.
const SCOPES = 'read_products,read_inventory,read_orders,write_orders,read_fulfillments,read_locations';

router.get('/install', (req, res) => {
  const shop = req.query.shop;
  if (!shop || !/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    return res.status(400).send('Missing or invalid ?shop= parameter, e.g. ?shop=vgjums-ze.myshopify.com');
  }
  if (!process.env.SHOPIFY_CLIENT_ID) {
    return res.status(500).send('SHOPIFY_CLIENT_ID is not set in .env');
  }
  const redirectUri = `${req.protocol}://${req.get('host')}/api/shopify/oauth/callback`;
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${Date.now()}`;
  res.redirect(authUrl);
});

router.get('/oauth/callback', async (req, res) => {
  try {
    const { shop, code } = req.query;
    if (!shop || !code) return res.status(400).send('Missing shop or code in callback');

    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code
      })
    });
    const data = await tokenRes.json();
    if (!data.access_token) return res.status(500).send(`Token exchange failed: ${JSON.stringify(data)}`);

    res.send(`<pre style="font-size:16px">Copy these into your .env, then remove SHOPIFY_CLIENT_ID/SHOPIFY_CLIENT_SECRET (only needed for this one-time step):

SHOPIFY_STORE_DOMAIN=${shop}
SHOPIFY_ACCESS_TOKEN=${data.access_token}
</pre>`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

module.exports = router;
