#!/usr/bin/env node
// Seed Galaxy Pay knowledge into Supabase dashboard_data table.
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node scripts/seed-knowledge.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_KEY (or NEXT_PUBLIC_ variants)");
  process.exit(1);
}

const supabase = createClient(URL, KEY);

const { GALAXY_PAY_KNOWLEDGE } = await import("../lib/galaxyPayKnowledge.js");

const row = {
  key: "galaxy_pay_knowledge",
  description: "Kiến thức Galaxy Pay cho Chatbot AI — sản phẩm, biểu phí, đối tác, eKYC, dự án",
  data: { text: GALAXY_PAY_KNOWLEDGE },
};

console.log(`Uploading knowledge (${GALAXY_PAY_KNOWLEDGE.length} chars) to Supabase...`);

const { error } = await supabase
  .from("dashboard_data")
  .upsert([row], { onConflict: "key" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log("Done! Galaxy Pay knowledge uploaded to Supabase (key: galaxy_pay_knowledge).");
console.log("Chatbot will now read knowledge from Supabase instead of code.");
