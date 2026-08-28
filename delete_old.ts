import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const cutoffDate = threeDaysAgo.toISOString();
  
  console.log(`Deleting articles older than: ${cutoffDate}`);

  // First, get the count of how many articles will be deleted
  const { data: countData, error: countError } = await supabase
    .from('articles')
    .select('id', { count: 'exact' })
    .lt('pub_date', cutoffDate);

  if (countError) {
    console.error('Error fetching count:', countError);
    return;
  }

  const count = countData.length;
  console.log(`Found ${count} articles to delete.`);

  if (count > 0) {
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .lt('pub_date', cutoffDate);

    if (deleteError) {
      console.error('Error deleting articles:', deleteError);
    } else {
      console.log(`Successfully deleted ${count} articles.`);
    }
  }
}

run();
