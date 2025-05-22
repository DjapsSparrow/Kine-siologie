import OpenAI from 'npm:openai@4.28.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const openai = new OpenAI({
  apiKey: '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'
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protocolId, fileContent } = await req.json();

    if (!protocolId || !fileContent) {
      return new Response(
        JSON.stringify({ error: 'Protocol ID and file content are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Analyze the content with GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a kinesiologist assistant. Analyze the provided protocol document and extract key information in a structured format. Focus on:

1. Objective and purpose
2. Key symptoms or conditions addressed
3. Step-by-step procedure
4. Important notes and precautions
5. Expected outcomes

Format the output in clear sections with bullet points where appropriate.`
        },
        {
          role: 'user',
          content: fileContent
        }
      ],
      temperature: 0.7
    });

    const analysis = completion.choices[0].message.content;

    // Update the protocol with the dynamic content
    const { error: updateError } = await supabase
      .from('protocols')
      .update({
        is_dynamic: true,
        dynamic_content: analysis,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', protocolId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in analyze-protocol:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze protocol',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});