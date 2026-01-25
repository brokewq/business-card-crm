
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local parsing
const envPath = path.resolve(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
            if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = value;
        }
    });
}

async function diagnoseStorage() {
    console.log("🔍 Diagnosing Storage Permissions...");

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Could not find credentials in .env.local");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check if 'card-images' bucket exists
    console.log("1️⃣ Checking bucket existence...");
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("❌ Failed to list buckets:", listError.message);
        return;
    }

    const bucket = buckets.find(b => b.name === 'card-images');
    if (!bucket) {
        console.error("❌ Bucket 'card-images' NOT found. Please create it in the Dashboard.");
        console.log("   Available buckets:", buckets.map(b => b.name).join(', '));
        return;
    }
    console.log("✅ Bucket 'card-images' exists.");
    console.log("   Public:", bucket.public);

    // 2. Try to upload a dummy file
    console.log("\n2️⃣ Testing Upload Permission...");
    // We try to upload to a generic path first
    const testFileName = `test-upload-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(testFileName, 'Hello world', { upsert: true });

    if (uploadError) {
        console.error("❌ Upload Failed:", uploadError.message);
        console.log("   Reason: Likely missing RLS Policy for INSERT.");
        console.log("   Hint: Go to Storage > Policies > card-images > Add Policy > 'All authenticated users' -> Check INSERT.");
    } else {
        console.log("✅ Upload Successful!");

        // Clean up
        await supabase.storage.from('card-images').remove([testFileName]);
    }
}

diagnoseStorage();
