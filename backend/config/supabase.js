const { createClient } = require("@supabase/supabase-js");


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(" Supabase env variables manquantes (SUPABASE_URL ou SUPABASE_SERVICE_KEY)");
  process.exit(1);
}

const supabase=createClient(supabaseUrl, supabaseServiceKey);

const connectSupabase = async () => {
  const { data, error } = await supabase.storage.getBucket("medical-files");

  if (error) {
    console.error(" Supabase Storage connexion échouée :", error.message);
    process.exit(1);
  }

  console.log(` Supabase Storage connecté — bucket: ${data.name}`);
};

module.exports = { supabase, connectSupabase };

