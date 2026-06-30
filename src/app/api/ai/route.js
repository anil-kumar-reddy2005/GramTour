import { getDb } from '../../../db';
import { NextResponse } from 'next/server';
export async function POST(request) {
    try {
        const body = await request.json();
        const db = getDb();
        const { budget, days, interests } = body;
        const user_id = body.user_id || 2;
        // Find a matching village based on some simple mocked logic
        const villages = db.prepare('SELECT * FROM villages').all();
        let recommendedVillage = villages[0] || {};
        let foundScore = 0;
        if (interests && typeof interests === 'string') {
            const keywords = interests.toLowerCase().split(/[\\s,]+/).filter((k) => k.length > 2);
            let bestScore = -1;
            if (keywords.length > 0) {
                for (const village of villages) {
                    let score = 0;
                    const searchableText = `${village.name} ${village.state} ${village.culture} ${village.short_description} ${village.full_description}`.toLowerCase();
                    for (const keyword of keywords) {
                        if (searchableText.includes(keyword)) {
                            score += 2; // High weight for exact word match
                        }
                    }
                    // Add slight score variation based on budget if needed, but primary is interest
                    if (score > bestScore) {
                        bestScore = score;
                        recommendedVillage = village;
                        foundScore = score;
                    }
                }
            }
        }
        // If no keywords matched, pick a random village to ensure variety
        if (foundScore === 0 && villages.length > 0) {
            recommendedVillage = villages[Math.floor(Math.random() * villages.length)];
        }
        const aiResultText = JSON.stringify({
            recommended_village: (recommendedVillage === null || recommendedVillage === void 0 ? void 0 : recommendedVillage.name) || "Unknown Village",
            activities: `Explore local culture, interact with artisans, and enjoy the authentic experience of ${recommendedVillage === null || recommendedVillage === void 0 ? void 0 : recommendedVillage.name}.`,
            stay_plan: `Stay at a local homestay for ${days} days for a complete immersive experience.`,
            estimated_cost: `Approximately ₹${budget} based on your preferences.`,
            travel_tips: "Carry comfortable shoes, respect local customs, and try the local cuisine."
        });
        const stmt = db.prepare(`
      INSERT INTO ai_plans (user_id, budget, days, interests, ai_result_text)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(user_id, budget, days, interests, aiResultText);
        return NextResponse.json({
            id: result.lastInsertRowid,
            user_id,
            budget,
            days,
            interests,
            ai_result_text: aiResultText
        }, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
