export default async function handler(req, res) {
  // Apenas aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;
  
  // A Vercel vai injetar esta chave a partir das Variáveis de Ambiente
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
        model: "llama3-70b-8192", // Llama 3 70B
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Essencial para o Roteiro!
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Groq: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Devolve o conteúdo gerado para o frontend (seu index.html)
    return res.status(200).json({ content });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Falha ao gerar o roteiro' });
  }
}
