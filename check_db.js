const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'emerald', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('NO_URI');
  process.exit(2);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 10000 })
  .then(() => {
    console.log('OK_CONNECTED');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(e => {
    console.error('ERR', e.message);
    process.exit(1);
  });
