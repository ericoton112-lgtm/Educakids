import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let theme = "";
  let ageGroup = "";
  let guidelines = "";

  try {
    const body = await req.json();
    theme = body.theme || "";
    ageGroup = body.ageGroup || "";
    guidelines = body.guidelines || "";

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      // Fallback Inteligente (Mock) caso a chave não esteja configurada
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResponse = getDynamicMockPlanner(theme, ageGroup, guidelines);
      return NextResponse.json(mockResponse);
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Você é um coordenador pedagógico experiente em Educação Infantil no Brasil, alinhado com a BNCC (Base Nacional Comum Curricular).
    Gere um planejamento semanal completo (de Segunda a Sexta-feira) para a professora com os seguintes parâmetros:
    - Faixa Etária: ${ageGroup}
    - Tema da Semana: ${theme}
    - Diretrizes/O que a professora quer fazer: ${guidelines}

    Regras de geração:
    1. O tema deve ser lúdico, engajador e alinhado com a faixa etária especificada.
    2. Liste exatamente 3 Objetivos Principais da Semana (goals) bem estruturados como frases concisas.
    3. Para cada um dos 5 dias de semana (Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira):
       - Defina um "focus" diário lúdico (Foco do Tema).
       - Defina um "iconName" que melhor represente o foco do dia (escolha obrigatoriamente um entre estes exatos valores: "Sun", "Palette", "CloudRain", "Sparkles", "Star").
       - Forneça uma classe CSS apropriada para a cor de fundo e texto do ícone no campo "iconBg", combinando com o design do sistema Educakids (escolha entre:
         - "bg-primary-container text-on-primary-container",
         - "bg-secondary-container text-on-secondary-container",
         - "bg-tertiary-container/40 text-on-tertiary-container",
         - "bg-error-container text-on-error-container"
       ).
       - Crie exatamente 2 atividades pedagógicas diárias estruturadas com:
         - "type": Tipo de atividade curto (ex: "Roda de Conversa", "Oficina de Arte", "Brincadeira Sensorial", "Contação de História", "Exploração Física", "Atividade ao Ar Livre").
         - "text": Descrição concisa, prática, criativa e acionável do que fazer com os alunos.
    4. NÃO utilize emojis nos textos internos dos campos do JSON.

    Responda APENAS com um JSON válido no seguinte formato:
    {
      "theme": "Tema gerado/refinado",
      "goals": [
        "Objetivo 1",
        "Objetivo 2",
        "Objetivo 3"
      ],
      "days": [
        {
          "day": "Segunda-feira",
          "focus": "Foco do tema de segunda",
          "iconName": "Sun",
          "iconBg": "bg-primary-container text-on-primary-container",
          "activities": [
            { "type": "Tipo", "text": "Descrição" },
            { "type": "Tipo", "text": "Descrição" }
          ]
        },
        ... (outros dias de Terça a Sexta-feira na ordem sequencial)
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "{}";
    
    // Tratamento robusto para remover blocos de código Markdown caso a IA retorne
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim();
    }

    const data = JSON.parse(text);

    // Garantia de campos obrigatórios com fallbacks seguros
    const parsedData = {
      theme: data.theme || theme || "Semana de Descobertas",
      goals: Array.isArray(data.goals) && data.goals.length === 3 ? data.goals : [
        "Explorar novos conceitos e ampliar o vocabulário das crianças.",
        "Desenvolver a motricidade e a percepção sensorial com materiais variados.",
        "Estimular a socialização e cooperação mútua em atividades de grupo."
      ],
      days: Array.isArray(data.days) && data.days.length === 5 ? data.days.map((d: any) => ({
        day: d.day || "Dia",
        focus: d.focus || "Atividade Temática",
        iconName: ["Sun", "Palette", "CloudRain", "Sparkles", "Star"].includes(d.iconName) ? d.iconName : "Sun",
        iconBg: d.iconBg || "bg-primary-container text-on-primary-container",
        activities: Array.isArray(d.activities) && d.activities.length === 2 ? d.activities.map((a: any) => ({
          type: a.type || "Atividade",
          text: a.text || "Descrição da atividade pedagógica."
        })) : [
          { type: "Roda de Conversa", text: "Introdução lúdica ao tema do dia." },
          { type: "Oficina de Arte", text: "Criação de desenho livre usando materiais coloridos." }
        ]
      })) : getDynamicMockPlanner(theme, ageGroup, guidelines).days
    };

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Gemini Planner Error (Graceful Mock Fallback):", error);
    const mockResponse = getDynamicMockPlanner(theme, ageGroup, guidelines);
    return NextResponse.json(mockResponse);
  }
}

function getDynamicMockPlanner(theme: string, ageGroup: string, guidelines: string) {
  const finalTheme = theme || "Explorações e Descobertas";
  const finalGuidelines = guidelines || "desenvolvimento motor, criatividade e interação social";
  
  const normalizedTheme = finalTheme.toLowerCase();
  const normalizedGuidelines = finalGuidelines.toLowerCase();

  const isJunina = normalizedTheme.includes("junina") || normalizedTheme.includes("joão") || normalizedTheme.includes("são joão") || normalizedGuidelines.includes("junina") || normalizedGuidelines.includes("comidas") || normalizedGuidelines.includes("típicas") || normalizedGuidelines.includes("tipicas") || normalizedGuidelines.includes("dança") || normalizedGuidelines.includes("danca");

  if (isJunina) {
    return {
      theme: "Festas Juninas e Tradições",
      goals: [
        "Apreciar e valorizar as manifestações culturais e artísticas típicas das Festas Juninas no Brasil.",
        "Desenvolver a coordenação motora fina e a percepção sensorial através de oficinas de colagem e corte de bandeirinhas.",
        "Trabalhar o ritmo, a expressão corporal e a socialização participando de danças típicas e quadrilha."
      ],
      days: [
        {
          day: 'Segunda-feira',
          focus: 'Cultura Junina e Bandeirinhas',
          iconName: 'Palette',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Roda de Conversa', text: 'Conversar sobre o que tem na Festa Junina: bandeirinhas, fogueira, comidas e trajes.' },
            { type: 'Oficina de Arte', text: 'Recortar e decorar bandeirinhas juninas de papel colorido para enfeitar a sala.' }
          ]
        },
        {
          day: 'Terça-feira',
          focus: 'Comidas Típicas e o Milho',
          iconName: 'Sun',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Exploração Tátil', text: 'Observar espigas de milho reais com casca e cabelo. Deixar que as crianças manuseiem e descasquem.' },
            { type: 'Oficina de Arte', text: 'Carimbar espigas de milho molhadas em tinta guache amarela sobre cartolina.' }
          ]
        },
        {
          day: 'Quarta-feira',
          focus: 'A Lenha e a Fogueira de Papel',
          iconName: 'CloudRain',
          iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
          activities: [
            { type: 'Contação Pedagógica', text: 'Contar a história das festividades tradicionais de junho usando fantoches.' },
            { type: 'Artes Práticas', text: 'Construir fogueiras colando palitos de picolé como lenha e papel celofane vermelho/amarelo para as chamas.' }
          ]
        },
        {
          day: 'Quinta-feira',
          focus: 'Brincadeiras da Pescaria',
          iconName: 'Sparkles',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Jogo Lúdico', text: 'Pescaria junina com peixes de papel numerados ou coloridos e varas de bambu.' },
            { type: 'Jogo de Ritmo', text: 'Brincadeira de estalar bombinhas de papel ou imitar estalos batendo os pés.' }
          ]
        },
        {
          day: 'Sexta-feira',
          focus: 'A Grande Quadrilha Junina',
          iconName: 'Star',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Dança e Ritmo', text: 'Ensaio e dança da tradicional quadrilha junina com as crianças vestidas a caráter.' },
            { type: 'Culinária Lúdica', text: 'Piquenique especial com pipoca e milho cozido, celebrando a cultura caipira.' }
          ]
        }
      ]
    };
  }

  const isAnimais = normalizedTheme.includes("animal") || normalizedTheme.includes("animais") || normalizedTheme.includes("bicho") || normalizedTheme.includes("pet") || normalizedGuidelines.includes("animal");
  if (isAnimais) {
    return {
      theme: finalTheme,
      goals: [
        "Identificar diferentes tipos de animais, seus habitats, sons e características físicas.",
        "Desenvolver a empatia, o respeito e o cuidado com a vida animal e a natureza.",
        "Trabalhar a coordenação corporal e a imaginação por meio da imitação de movimentos de animais."
      ],
      days: [
        {
          day: 'Segunda-feira',
          focus: 'Animais de Estimação',
          iconName: 'Sun',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Roda de Conversa', text: 'Falar sobre animais de estimação (cão, gato, passarinho) e como devemos cuidar deles.' },
            { type: 'Oficina de Desenho', text: 'Desenhar ou pintar o seu animal favorito ou o bichinho de estimação que gostaria de ter.' }
          ]
        },
        {
          day: 'Terça-feira',
          focus: 'Sons dos Bichinhos',
          iconName: 'Palette',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Jogo de Escuta', text: 'Ouvir gravações de sons de animais e adivinhar a qual bicho pertence.' },
            { type: 'Imitação Corporal', text: 'Brincar de mímica imitando a locomoção e os sons dos bichos da fazenda.' }
          ]
        },
        {
          day: 'Quarta-feira',
          focus: 'Animais Aquáticos e Peixinhos',
          iconName: 'CloudRain',
          iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
          activities: [
            { type: 'Exploração Visual', text: 'Ver fotos ou vídeos curtos de peixes, baleias e tartarugas marinhas.' },
            { type: 'Oficina de Arte', text: 'Fazer peixinhos usando pratos descartáveis de papel pintados com guache azul.' }
          ]
        },
        {
          day: 'Quinta-feira',
          focus: 'Aves e Borboletas no Ar',
          iconName: 'Sparkles',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Observação Ativa', text: 'Procurar borboletas e passarinhos voando na área verde da escola.' },
            { type: 'Expressão Corporal', text: 'Dança rítmica batendo os braços como asas ao som de músicas clássicas alegres.' }
          ]
        },
        {
          day: 'Sexta-feira',
          focus: 'Animais da Floresta Selvagem',
          iconName: 'Star',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Contação com Fantoches', text: 'História com fantoches sobre um leão generoso e um ratinho inteligente na selva.' },
            { type: 'Mural Coletivo', text: 'Colagem de recortes de revistas em um painel gigante da floresta dos animais.' }
          ]
        }
      ]
    };
  }

  const isMeioAmbiente = normalizedTheme.includes("ambiente") || normalizedTheme.includes("natureza") || normalizedTheme.includes("árvore") || normalizedTheme.includes("árvores") || normalizedTheme.includes("jardim") || normalizedTheme.includes("ecol") || normalizedTheme.includes("recicla") || normalizedGuidelines.includes("ambiente") || normalizedGuidelines.includes("natureza");
  if (isMeioAmbiente) {
    return {
      theme: finalTheme,
      goals: [
        `Promover a observação ativa do meio ambiente e o contato direto com elementos naturais para a faixa etária de ${ageGroup}.`,
        "Estimular a expressão artística e a coordenação motora fina através da colagem e modelagem usando elementos da natureza.",
        "Praticar a socialização, escuta atenta e enriquecimento de vocabulário em rodas de contação lúdicas sobre preservação ambiental."
      ],
      days: [
        {
          day: 'Segunda-feira',
          focus: 'Descobrindo as Texturas da Terra',
          iconName: 'Sun',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Roda de Conversa', text: 'Sensações da terra: Sentir a terra seca e terra úmida nas mãos e expressar o que sentem.' },
            { type: 'Brincadeira Sensorial', text: 'Pintura a dedo usando tintas naturais feitas com terra, água e cola colorida.' }
          ]
        },
        {
          day: 'Terça-feira',
          focus: 'O Canto e Formato dos Pássaros',
          iconName: 'Palette',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Escuta Ativa', text: 'Sentar no pátio de olhos fechados e tentar identificar os diferentes sons de aves ao redor.' },
            { type: 'Oficina de Modelagem', text: 'Criação de passarinhos e ninhos usando argila e gravetos recolhidos do chão.' }
          ]
        },
        {
          day: 'Quarta-feira',
          focus: 'Cores e Formas das Folhas',
          iconName: 'CloudRain',
          iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
          activities: [
            { type: 'Caça ao Tesouro', text: 'Caminhada pelo jardim coletando folhas verdes e secas de variados formatos.' },
            { type: 'Oficina de Arte', text: 'Fricção de giz de cera sobre papel para decalcar as texturas e nervuras das folhas.' }
          ]
        },
        {
          day: 'Quinta-feira',
          focus: 'Pequenos Insetos do Jardim',
          iconName: 'Sparkles',
          iconBg: 'bg-primary-container text-on-primary-container',
          activities: [
            { type: 'Observação Ativa', text: 'Utilizar lupas infantis para localizar joaninhas, formigas e caracóis na grama.' },
            { type: 'Jogo de Imitação', text: 'Circuito corporal imitando o rastejar da minhoca, o vôo da borboleta e o andar do caracol.' }
          ]
        },
        {
          day: 'Sexta-feira',
          focus: 'Artes Coletivas e Piquenique',
          iconName: 'Star',
          iconBg: 'bg-secondary-container text-on-secondary-container',
          activities: [
            { type: 'Arte Colaborativa', text: 'Montagem de um grande mural colando as folhas, pétalas e galhos recolhidos na semana.' },
            { type: 'Contação e Encerramento', text: 'Piquenique sob as árvores seguido de contação de histórias com fantoches sobre bichinhos.' }
          ]
        }
      ]
    };
  }

  // Geração procedural dinâmica caso seja qualquer outro tema
  return {
    theme: finalTheme,
    goals: [
      `Promover o engajamento lúdico e a compreensão prática do tema "${finalTheme}" para a faixa etária ${ageGroup}.`,
      `Desenvolver competências motoras finas e expressão artística explorando o foco em "${finalGuidelines}".`,
      `Estimular a cooperação mútua, a escuta de instruções e o compartilhamento durante as brincadeiras temáticas.`
    ],
    days: [
      {
        day: 'Segunda-feira',
        focus: `Introdução ao tema ${finalTheme}`,
        iconName: 'Sun',
        iconBg: 'bg-primary-container text-on-primary-container',
        activities: [
          { type: 'Roda de Conversa', text: `Apresentar o tema "${finalTheme}" de forma envolvente e recolher o que as crianças já sabem sobre ele.` },
          { type: 'Oficina de Expressão', text: `Atividade artística simples de pintura ou desenho livre baseada nas primeiras impressões de "${finalTheme}".` }
        ]
      },
      {
        day: 'Terça-feira',
        focus: `Explorando Detalhes do Tema`,
        iconName: 'Palette',
        iconBg: 'bg-secondary-container text-on-secondary-container',
        activities: [
          { type: 'Descoberta Visual', text: `Observar fotos, objetos físicos ou ilustrações que representem aspectos centrais de "${finalTheme}".` },
          { type: 'Trabalho Manual', text: `Criação de maquetes ou pequenos brinquedos de sucata que simulem elementos de "${finalTheme}".` }
        ]
      },
      {
        day: 'Quarta-feira',
        focus: `Foco Prático e Sensorial`,
        iconName: 'CloudRain',
        iconBg: 'bg-tertiary-container/40 text-on-tertiary-container',
        activities: [
          { type: 'Brincadeira de Foco', text: `Circuito ou dinâmica sensorial que envolva os cinco sentidos correlacionados a "${finalTheme}".` },
          { type: 'Música e Movimento', text: `Cantar cantigas ou reproduzir sons relacionados a "${finalTheme}" utilizando palmas e pés.` }
        ]
      },
      {
        day: 'Quinta-feira',
        focus: `Aprofundando em ${finalGuidelines}`,
        iconName: 'Sparkles',
        iconBg: 'bg-primary-container text-on-primary-container',
        activities: [
          { type: 'Desafio Coletivo', text: `Jogo ou gincana cooperativa em que a turma precisa resolver um pequeno mistério envolvendo "${finalTheme}".` },
          { type: 'Oficina de Modelagem', text: `Modelar personagens ou elementos de "${finalTheme}" utilizando massinha de modelar ou argila.` }
        ]
      },
      {
        day: 'Sexta-feira',
        focus: `Consolidação e Celebração`,
        iconName: 'Star',
        iconBg: 'bg-secondary-container text-on-secondary-container',
        activities: [
          { type: 'Painel Mural', text: `Agrupar todos os desenhos e colagens feitos nos últimos dias em um grande painel da sala.` },
          { type: 'Contação e Encerramento', text: `Piquenique temático ou roda de histórias com fantoches para celebrar tudo o que foi aprendido sobre "${finalTheme}".` }
        ]
      }
    ]
  };
}
