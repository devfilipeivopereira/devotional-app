const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
    console.error('.env file not found at', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY="([^"]+)"/);

if (!urlMatch || !keyMatch) {
    console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    try {
        // Check Series
        const { data: series, error: seriesError } = await supabase
            .from('devotional_series')
            .select('id, title, is_published');

        if (seriesError) throw seriesError;

        console.log(`\n✅ Found ${series.length} series:`);
        series.forEach(s => console.log(`   - ${s.title} (${s.is_published ? 'Published' : 'Draft'})`));

        if (series.length === 0) {
            console.warn('⚠️ No series found. Seed data might not be applied.');
        } else {
            // Check Days for first series
            const { data: days, error: daysError } = await supabase
                .from('devotional_days')
                .select('id, title, day_number')
                .eq('series_id', series[0].id);

            if (daysError) throw daysError;

            console.log(`\n✅ Found ${days.length} days for series "${series[0].title}":`);
            days.forEach(d => console.log(`   - Day ${d.day_number}: ${d.title}`));

            // Check Blocks for first day
            if (days.length > 0) {
                const { count, error: blocksError } = await supabase
                    .from('devotional_blocks')
                    .select('*', { count: 'exact', head: true })
                    .eq('day_id', days[0].id);

                if (blocksError) throw blocksError;
                console.log(`\n✅ Found ${count} blocks for Day 1.`);
            }
        }

    } catch (err) {
        console.error('\n❌ Error verifying database:', err.message);
        process.exit(1);
    }
}

verify();
