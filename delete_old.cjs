const dotenv = require('dotenv');
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function run() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const cutoffDate = threeDaysAgo.toISOString();
  
  console.log(`Deleting articles older than: ${cutoffDate}`);

  // Fetch count
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?pub_date=lt.${cutoffDate}&select=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error('Error fetching data:', data);
    return;
  }
  
  console.log(`Found ${data.length} articles to delete.`);
  
  if (data.length > 0) {
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/articles?pub_date=lt.${cutoffDate}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!delRes.ok) {
      console.error('Error deleting:', await delRes.text());
    } else {
      console.log(`Successfully deleted ${data.length} articles.`);
    }
  }
}

run();
