
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://kkmejjqmxnlhtrpqvvhx.supabase.co';
const supabaseKey = 'sb_publishable_eC2Oi4zupqxhIr2NaNL2Lg_fIlHSjLI'; // Provided by user

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
