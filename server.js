const Fastify = require('fastify')
const Groq = require('groq-sdk')
require('dotenv').config()

const fastify = Fastify({ logger: true })
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

fastify.register(require('@fastify/cors'), {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
})

fastify.post('/treinador', async (request, reply) => {
  const { mensagem, dadosBalanca, objetivo, nivel } = request.body

  console.log('Mensagem:', mensagem)

  const resposta = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Você é o Treinador Virtual do FitAI, um app brasileiro de musculação criado para democratizar o acesso ao fitness e ajudar pessoas que não têm condições de contratar um personal trainer.

Perfil do usuário:
- Objetivo: ${objetivo}
- Nível: ${nivel}
- Peso: ${dadosBalanca.peso}kg
- Gordura corporal: ${dadosBalanca.gordura}%
- Massa muscular: ${dadosBalanca.musculo}kg

Seja motivador, empático e fale sempre em português do Brasil.
Dê respostas práticas e personalizadas.`
      },
      {
        role: 'user',
        content: mensagem
      }
    ],
    max_tokens: 1024,
    temperature: 0.7,
  })

  const texto = resposta.choices[0].message.content
  return { resposta: texto }
})

fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err
  console.log('🚀 FitAI Backend rodando!')
})