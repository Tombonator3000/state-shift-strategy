import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArticleInput {
  headline: string;
  subhead: string;
  body: string;
  faction: 'truth' | 'government';
  tags?: string[];
}

interface CombineRequest {
  articles: ArticleInput[];
  faction: 'truth' | 'government' | 'mixed';
  tone: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articles, faction, tone }: CombineRequest = await req.json();

    if (!articles || articles.length < 2) {
      return new Response(
        JSON.stringify({ error: "Need at least 2 articles to combine" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct the prompt for combining articles
    const articleSummaries = articles.map((a, idx) => 
      `ARTICLE ${idx + 1}:\nHeadline: ${a.headline}\nSubhead: ${a.subhead}\nBody: ${a.body.slice(0, 500)}...`
    ).join('\n\n');

    const systemPrompt = `You are a skilled newspaper editor for "The Paranoid Times," a publication that covers conspiracy theories and government secrets with a ${tone} tone. Your job is to combine multiple related news articles into one cohesive, compelling story that maintains the paranoid/conspiratorial atmosphere.

Key guidelines:
- Create an attention-grabbing headline (ALL CAPS, urgent style)
- Write a compelling subhead that connects the articles
- Weave the information from all articles into a coherent narrative
- Maintain the ${faction === 'truth' ? 'skeptical, truth-seeking' : faction === 'government' ? 'official, dismissive' : 'balanced but tense'} perspective
- Use transition phrases to connect different article elements
- Keep the paranoid/conspiratorial tone throughout
- Body should be 3-4 paragraphs maximum`;

    const userPrompt = `Combine these ${articles.length} articles into one cohesive news story:

${articleSummaries}

Return a JSON object with this structure:
{
  "headline": "ALL CAPS HEADLINE",
  "subhead": "Compelling subhead connecting the articles",
  "byline": "By: [Reporter Name]",
  "body": "Full article body combining all sources into coherent narrative"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content returned from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const combinedArticle = JSON.parse(content);

    return new Response(
      JSON.stringify(combinedArticle),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("combine-articles error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
