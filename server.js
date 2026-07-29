const Fastify = require('fastify')
const Groq = require('groq-sdk')
require('dotenv').config()

const fastify = Fastify({ logger: true })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

fastify.register(require('@fastify/cors'), { origin: true })

fastify.post('/treinador', async (request, reply) => {
  const { mensagem, dadosBalanca } = request.body

  console.log('Mensagem recebida:', mensagem)

  const resposta = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Você é o Treinador Virtual do FitAI, um aplicativo brasileiro de musculação criado para ajudar pessoas que não têm acesso a um personal trainer profissional. 
Seu objetivo é democratizar o acesso ao fitness no Brasil.
Seja motivador, empático, direto e fale sempre em português do Brasil.
Dê respostas práticas e personalizadas baseadas nos dados do usuário.
Nunca substitua um médico — para questões de saúde, oriente a procurar um profissional.`
      },
      {
        role: 'user',
        content: `Meus dados corporais:
- Peso: ${dadosBalanca.peso}kg
- Gordura corporal: ${dadosBalanca.gordura}%
- Massa muscular: ${dadosBalanca.musculo}kg

Minha pergunta: ${mensagem}`
      }
    ],
    max_tokens: 1024,
    temperature: 0.7,
  })

  const texto = resposta.choices[0].message.content
  console.log('Resposta do Groq:', texto.substring(0, 80))
  return { resposta: texto }
})

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err
  console.log('🚀 FitAI Backend rodando na porta 3000')
})