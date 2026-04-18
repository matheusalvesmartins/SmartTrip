export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { promptContexto } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Chave da API do Groq não configurada no servidor' });
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
        messages: [{ role: "user", content: promptContexto }],
        // Aqui NÃO usamos response_format, pois queremos que a IA converse normalmente em português
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Groq: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || 'Desculpe, não consegui formular a resposta.';
    
    // Devolve a resposta em texto para o frontend
    return res.status(200).json({ text });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Falha ao processar o chat' });
  }
}
