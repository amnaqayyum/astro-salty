import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateDeployTimestamp() {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key: 'last_deployed_at',
      value: JSON.stringify(new Date().toISOString()),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to update deploy timestamp:', error.message);
    process.exit(1);
  }

  console.log('Updated last_deployed_at timestamp');
}

updateDeployTimestamp();
