function calculateSoM(responses) {
    if (!responses || responses.length === 0) return { percentage: 0, yourCount: 0, totalCount: 0 };

    const yourMentions = responses.filter(r => r.brand_mentioned === true).length;
    // Total mentions is any response where ANY brand was mentioned (yours or competitors)
    // or if the prompt was relevant. For simplicity, we'll count all responses as potential opportunities.
    const totalPrompts = responses.length;

    return {
        percentage: ((yourMentions / totalPrompts) * 100).toFixed(1),
        yourCount: yourMentions,
        totalCount: totalPrompts
    };
}

function calculateSentiment(responses) {
    if (!responses || responses.length === 0) return { score: 0, status: 'Red', label: 'No Data' };

    const weights = { positive: 10, neutral: 5, negative: 0 };
    // Only count responses where brand is mentioned
    const mentionedResponses = responses.filter(r => r.brand_mentioned);

    if (mentionedResponses.length === 0) return { score: 0, status: 'Red', label: 'Not Mentioned' };

    const totalScore = mentionedResponses.reduce((acc, r) => acc + (weights[r.sentiment] || 0), 0);
    const avgScore = (totalScore / mentionedResponses.length).toFixed(1);

    let status = 'Red';
    let label = 'At Risk';

    if (avgScore >= 8) {
        status = 'Green';
        label = 'Leading Authority';
    } else if (avgScore >= 5) {
        status = 'Yellow';
        label = 'Service Provider';
    }

    return { score: avgScore, status, label };
}

function calculateWinLoss(responses) {
    // Determine win/loss based on responses
    if (!responses) return null;

    let won = 0;
    let mentioned = 0;
    let lost = 0;

    responses.forEach(r => {
        if (r.position === 1 && r.brand_mentioned) {
            won++;
        } else if (r.brand_mentioned) {
            mentioned++;
        } else {
            lost++;
        }
    });

    return { won, mentioned, lost };
}

function findCompetitorGaps(responses) {
    if (!responses) return [];

    // Find where competitor is mentioned but we are not
    return responses
        .filter(r => !r.brand_mentioned && r.competitors_mentioned && r.competitors_mentioned.length > 0)
        .map(r => ({
            prompt: `Prompt ID: ${r.prompt_id}`, // In real app, join with prompts.json
            competitor: r.competitors_mentioned[0],
            position: r.position || 'Unknown',
            platform: r.platform
        }));
}

function calculateCitationVelocity(responses) {
    // Simplified logic: Count unique citations in current vs previous month
    // For sample data, just return static/random values or calculated from available dates
    // Assuming 'responses' has all history.

    const allCitations = responses.flatMap(r => r.citations || []);
    const uniqueCitations = [...new Set(allCitations)];

    return {
        new: uniqueCitations.length, // Total unique for now
        growth: 15 // Mock growth %
    };
}

function calculateRevenueImpact(responses, ga4Data) {
    if (!ga4Data) return { estimatedRevenue: 0, conversions: 0 };

    // Filter GA4 data for AI sources
    const aiSources = ["ChatGPT", "Perplexity", "Claude", "Gemini"];
    const aiTraffic = ga4Data.filter(d => aiSources.includes(d.form_submission_source));

    const conversions = aiTraffic.reduce((sum, d) => sum + parseInt(d.conversions || 0), 0);
    const revenuePerConversion = 5000; // Estimated value

    return {
        estimatedRevenue: conversions * revenuePerConversion,
        conversions: conversions
    };
}

function calculateSchemaScore(validationData) {
    if (!validationData || validationData.length === 0) return { percentage: 0 };

    const valid = validationData.filter(v => v.is_valid).length;
    const total = validationData.length;

    return {
        percentage: Math.round((valid / total) * 100),
        valid,
        total,
        details: validationData
    };
}
