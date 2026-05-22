import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let ageGroup = "";
  let theme = "";
  let difficulty = "";
  let activityType: any = [];
  let typesString = "";
  
  try {
    const body = await req.json();
    ageGroup = body.ageGroup || "";
    theme = body.theme || "";
    difficulty = body.difficulty || "";
    activityType = body.activityType || [];
    const previousTitlesAndThemes = body.previousTitlesAndThemes;
    const availableMaterials = body.availableMaterials || "";
    
    typesString = Array.isArray(activityType) ? activityType.join(" e ") : (activityType || "");

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      // Fallback Inteligente (Mock) caso a chave não esteja configurada
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockResponse = getMockResponse(theme, typesString, ageGroup, difficulty);
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

    const avoidDuplicateClause = Array.isArray(previousTitlesAndThemes) && previousTitlesAndThemes.length > 0
      ? `\n    - IMPORTANTE: Para evitar repetições e redundâncias, NÃO crie uma atividade com títulos, dinâmicas ou temas parecidos com as seguintes atividades já geradas anteriormente: ${previousTitlesAndThemes.join(", ")}. Crie algo novo, criativo e diferente!`
      : '';

    const materialsClause = availableMaterials
      ? `\n    - MATERIAIS DISPONÍVEIS NA SALA: Priorize o uso destes materiais que já estão em estoque: ${availableMaterials}. Sugira apenas materiais extras se forem absolutamente necessários.`
      : '';

    const prompt = `Você é um especialista em pedagogia infantil, extremamente criativo.
    Crie uma atividade prática detalhada com os seguintes parâmetros:
    Faixa Etária: ${ageGroup}
    Tema: ${theme}
    Dificuldade: ${difficulty}
    Tipos de Atividade: ${typesString}

    REGRAS IMPORTANTES:
    - NÃO use emojis em nenhum campo.
    - Os passos (steps) devem ter texto limpo e objetivo, sem símbolos decorativos.
    - A propriedade 'studentQuestions' deve ter no MÁXIMO 5 itens.
    - Para questões de pintura/desenho, use verbos como "Desenhe" ou "Pinte" no início da frase.
    - Para questões de resposta escrita, formule perguntas diretas sem instruções de desenho.
    - O campo 'type' deve ser curto, ex: "Atividade Interna" ou "Atividade Sensorial".
      - REGRA CRÍTICA PARA IMAGENS: A propriedade 'illustrationPrompts' deve ser um array de strings com o mesmo tamanho exato do array 'studentQuestions'. Para TODA pergunta que exija desenhar, colorir ou pintar, você DEVE OBRIGATORIAMENTE fornecer uma descrição visual rica, detalhada e EM INGLÊS focada no objeto que a criança deve desenhar. NUNCA deixe vazio para perguntas de desenho. Para perguntas puramente de texto, forneça uma string vazia "".${avoidDuplicateClause}${materialsClause}
    - DICIONÁRIO VISUAL CULTURAL: Modelos de imagem em inglês não entendem o folclore brasileiro. Se a atividade for de Festa Junina, traduza OBRIGATORIAMENTE o 'illustrationPrompts' usando estes termos exatos para evitar erros:
      * Balão de São João/Festa Junina -> "a diamond-shaped paper lantern, origami style balloon" (NUNCA use "hot air balloon")
      * Bandeirinhas -> "a string of triangular party pennants hanging"
      * Fogueira -> "a traditional campfire made of wood logs with flames"
      * Chapéu de palha -> "a rustic woven farmer straw hat"
      * Milho/Pamonha -> "an ear of corn with husks"

    Responda SOMENTE com JSON válido seguindo este esquema:
    {
      "title": "Título criativo da atividade",
      "ageRange": "A faixa etária recomendada",
      "duration": "Duração estimada (ex: 30-45 min)",
      "type": "Tipo curto da atividade",
      "description": "Descrição breve da atividade",
      "materials": ["lista", "de", "materiais"],
      "steps": [
        { "title": "Título do passo", "content": "Explicação clara e objetiva do que fazer" }
      ],
      "studentQuestions": ["Pergunta ou comando 1", "Pergunta ou comando 2"],
      "illustrationPrompts": ["English visual prompt or empty string", "English visual prompt or empty string"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    // Garantia de campos obrigatórios com fallbacks seguros
    const parsedData = {
      title: data.title || `Atividade Prática: ${typesString}`,
      ageRange: data.ageRange || ageGroup,
      duration: data.duration || "45 min",
      type: data.type || typesString,
      description: data.description || "Atividade prática criada de forma lúdica.",
      materials: Array.isArray(data.materials) ? data.materials : ["Papel", "Lápis de cor"],
      steps: Array.isArray(data.steps) ? data.steps.map((s: any) => ({
        title: s?.title || "Passo",
        content: s?.content || ""
      })) : [],
      studentQuestions: Array.isArray(data.studentQuestions) ? data.studentQuestions : [],
      illustrationPrompts: Array.isArray(data.illustrationPrompts) ? data.illustrationPrompts : []
    };

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Gemini Error (Graceful Mock Fallback):", error);
    const mockResponse = getMockResponse(theme, typesString, ageGroup, difficulty);
    return NextResponse.json(mockResponse);
  }
}

function getMockResponse(theme: string, typesString: string, ageGroup: string, difficulty: string) {
  const themeLower = (theme || "").toLowerCase();
  
  if (themeLower.includes("junina") || themeLower.includes("são joão")) {
    return {
      title: `Atividade Prática: ${typesString} com Festas Juninas`,
      ageRange: ageGroup,
      duration: "45-60 min",
      type: typesString,
      description: `Uma atividade imersiva de Festas Juninas! As crianças irão explorar as cores, formas e tradições da época (fogueira, bandeirinhas, balões) através de ${typesString}, estimulando a coordenação motora e a criatividade.`,
      materials: [
        "Papel kraft, cartolina ou papel pardo (1 por aluno)",
        "Tintas guache (vermelho, amarelo, laranja para a fogueira)",
        "Retalhos de papel seda colorido para fazer bandeirinhas",
        "Palitos de picolé (para simular a lenha da fogueira)",
        "Cola branca escolar e tesoura sem ponta",
        "Música típica de Festa Junina (forró/cantigas) para ambientação"
      ],
      steps: [
        { 
          title: "1. Preparação e Ambientação (10 min)", 
          content: "Coloque uma música de festa junina suave ao fundo. Apresente os materiais e pergunte o que eles lembram (ex: 'Que cor é o fogo?', 'O que enfeita o céu na festa junina?')." 
        },
        { 
          title: "2. Construindo a Fogueira (15 min)", 
          content: "Peça que as crianças colem os palitos de picolé na base da folha. Em seguida, usando as mãos (ou pincel) com tintas amarela e vermelha, eles devem carimbar ou pintar as chamas da fogueira acima da lenha." 
        },
        { 
          title: "3. O Céu de Bandeirinhas (15 min)", 
          content: "Enquanto a fogueira seca, entregue retalhos coloridos e peça para as crianças (se tiverem idade) cortarem triângulos. Depois, devem colar as bandeirinhas na parte superior da folha formando um varal." 
        },
        { 
          title: "4. Roda da Fogueira (10 min)", 
          content: "Coloquem todos os trabalhos no centro da sala, formando uma grande roda ao redor das 'fogueiras de papel'. Façam uma dança de roda cantando 'Cai, Cai, Balão'." 
        }
      ],
      studentQuestions: [
        "1. Desenhe no espaço abaixo como ficou a sua fogueira com os palitos.",
        "2. Desenhe um lindo varal cheio de bandeirinhas no espaço abaixo:",
        "3. O que usamos hoje para fazer a lenha da nossa fogueira?",
        "4. Qual comida típica de Festa Junina você acha mais gostosa?",
        "5. Desenhe você e seus amigos dançando quadrilha."
      ],
      illustrationPrompts: [
        "a cute bonfire made of popsicle sticks with fire flames",
        "a beautiful clothesline with colorful festival flags hanging in the sky",
        "",
        "",
        "happy children wearing traditional country festival costumes dancing together in a circle"
      ]
    };
  } else {
    // Mock Genérico
    return {
      title: `Atividade Prática: ${typesString} com ${theme || 'Criatividade'}`,
      ageRange: ageGroup,
      duration: "45-60 min",
      type: typesString,
      description: `Uma atividade engajadora focada em ${theme || 'desenvolvimento'}. Esta experiência prende a atenção oferecendo múltiplos estímulos, ideal para a dificuldade ${difficulty}.`,
      materials: [
        "Folhas de papel sulfite ou cartolina",
        "Lápis de cor, giz de cera ou canetinhas",
        "Tesoura sem ponta e cola",
        "Materiais recicláveis (tampinhas, rolinhos)"
      ],
      steps: [
        { 
          title: "1. Introdução (10 min)", 
          content: `Reúna as crianças e apresente o tema central (${theme || 'Criatividade'}).` 
        },
        { 
          title: "2. Mão na Massa (20 min)", 
          content: `Deixe as crianças explorarem os materiais e criarem algo relacionado ao tema.` 
        },
        { 
          title: "3. Reflexão (10 min)", 
          content: "Peça que deixem os materiais e sentem-se novamente em roda para mostrar o que fizeram." 
        }
      ],
      studentQuestions: [
        `1. O que você mais gostou de aprender sobre ${theme || 'o nosso tema'} hoje?`,
        "2. Pinte ou desenhe no espaço abaixo o que você criou.",
        "3. Quantos materiais diferentes você usou durante a atividade? Escreva o número.",
        "4. Quais foram as cores principais que você usou ou viu hoje?",
        "5. Desenhe livremente algo que você quer mostrar para os seus pais."
      ],
      illustrationPrompts: [
        "",
        "creative kids art project and toys",
        "",
        "",
        "happy child showing a drawing to smiling parents"
      ]
    };
  }
}
