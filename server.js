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

fastify.post('/plano', async (request, reply) => {
  const {
    nome, sexo, idade, peso, altura, imc,
    objetivo, nivel, dias, duracao,
    gorduraCorporal, gorduraVisceral, musculo,
    metabolismo, cintura, lesoes, temLimitacao,
  } = request.body

  console.log('Gerando plano para:', nome)

  const lesoesTexto = JSON.parse(lesoes || '[]').join(', ') || 'nenhuma'

  const resposta = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Você é o Treinador Virtual do FitAI, personal trainer digital brasileiro especializado em criar planos personalizados e acessíveis para pessoas que não podem pagar um profissional.`
      },
      {
        role: 'user',
        content: `Crie um plano de treino COMPLETO e PERSONALIZADO para:

DADOS PESSOAIS:
- Nome: ${nome}
- Sexo: ${sexo}
- Idade: ${idade} anos
- Peso: ${peso}kg | Altura: ${altura}cm | IMC: ${imc}

COMPOSIÇÃO CORPORAL:
- Gordura corporal: ${gorduraCorporal || 'não informado'}%
- Gordura visceral: nível ${gorduraVisceral || 'não informado'}
- Músculo esquelético: ${musculo || 'não informado'}%
- Metabolismo em repouso: ${metabolismo || 'não informado'} kcal
- Circunferência da cintura: ${cintura || 'não informado'} cm

OBJETIVO: ${objetivo}
NÍVEL: ${nivel}
DISPONIBILIDADE: ${dias} dias por semana, ${duracao} minutos por sessão
LESÕES: ${lesoesTexto}
LIMITAÇÕES MÉDICAS: ${temLimitacao === 'true' ? 'sim' : 'não'}

Crie um plano estruturado com:
1. 📋 Divisão de treinos por dia da semana
2. 💪 Exercícios com séries, repetições e descanso
3. 🥗 Dica de alimentação pelo método do prato
4. 📊 Metas realistas em 1, 3 e 6 meses
5. 👟 Passos diários recomendados para queima de gordura
6. ⚠️ Alertas de saúde baseados nos dados (se necessário)

Seja direto, motivador e use emojis. Fale em português do Brasil.`
      }
    ],
    max_tokens: 2048,
    temperature: 0.7,
  })

  const plano = resposta.choices[0].message.content
  return { plano }
})

fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err
  console.log('🚀 FitAI Backend rodando!')
})