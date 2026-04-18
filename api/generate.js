module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Chave API do Groq não encontrada na Vercel.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", 
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro Groq (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    return res.status(200).json({ content });
    
  } catch (error) {
    console.error(error);
    // Devolve o erro real para podermos ler no celular
    return res.status(500).json({ error: error.message });
  }
};
