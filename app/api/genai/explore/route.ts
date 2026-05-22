import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let type = "story";
  let theme = "";
  let bnccField = "";
  let ageGroup = "";

  try {
    const body = await req.json();
    type = body.type || "story";
    theme = body.theme || "";
    bnccField = body.bnccField || "";
    ageGroup = body.ageGroup || "";

    const rawApiKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockResponse = getMockExploreData(type, theme);
      return NextResponse.json(mockResponse);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const bnccClause = bnccField
      ? `- Campo de Experiência da BNCC: "${bnccField}". A história deve ensinar ou explorar este campo de forma natural e lúdica.`
      : '';

    let prompt = '';

    if (type === 'story') {
      prompt = `Você é um autor de literatura infantil brasileiro, especializado em histórias curtas e interativas para crianças de 0 a 8 anos.

Crie uma história infantil interativa sobre o tema: "${theme}".
${bnccClause}
Faixa etária: ${ageGroup || "2-5 anos"}

REGRAS:
- A história deve ter EXATAMENTE 3 páginas.
- Cada página deve terminar com uma "Ação Necessária" que a criança deve fazer (um botão interativo).
- A última página deve ter buttonText "Fim da História! 🔁".
- Use emojis nos textos e nos campos.
- Forneça um fundo gradiente Tailwind para cada página (ex: "from-amber-100 to-orange-100").
- O formato deve ser JSON válido.

Responda APENAS com JSON:
{
  "title": "Título da História + emoji",
  "desc": "Descrição curta",
  "emoji": "emoji principal",
  "pages": [
    {
      "emoji": "emoji da página",
      "bg": "gradient classes",
      "text": "texto da página",
      "action": "ação necessária",
      "buttonText": "texto do botão"
    }
  ]
}`;
    } else if (type === 'song') {
      prompt = `Você é um compositor de música infantil brasileira.

Crie uma cantiga infantil sobre o tema: "${theme}".
${bnccClause}
Faixa etária: ${ageGroup || "2-5 anos"}

REGRAS:
- A letra deve ter no máximo 4 linhas.
- Forneça uma sequência de notas para xilofone (use apenas: Dó, Ré, Mi, Fá, Sol, Lá, Si, Dó⁺).
- A sequência deve ter entre 4 e 8 notas.
- Use emojis nos campos de título e descrição.

Responda APENAS com JSON:
{
  "title": "Título da Cantiga + emoji",
  "desc": "Breve descrição do tema",
  "emoji": "emoji principal",
  "lyrics": "Letra da cantiga",
  "sequence": ["Dó", "Ré", "Mi", ...]
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt || "Gere uma história infantil sobre amizade.",
      config: { responseMimeType: "application/json" }
    });

    let text = response.text || "{}";
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim();
    }

    const data = JSON.parse(text);
    return NextResponse.json({ type, ...data });
  } catch (error) {
    console.error("Gemini Explore Error:", error);
    const mockResponse = getMockExploreData(type, theme);
    return NextResponse.json(mockResponse);
  }
}

function getMockExploreData(type: string, theme: string) {
  if (type === 'story') {
    const t = theme?.toLowerCase() || '';
    if (t.includes('coelho') || t.includes('coelho') || t.includes('dent')) {
      return {
        type: 'story',
        title: 'O Coelho que Aprendeu a Escovar os Dentes 🐰🪥',
        desc: 'Ajude o coelho Tico a cuidar dos dentinhos!',
        emoji: '🐰',
        pages: [
          { emoji: '🐰🍬', bg: 'from-pink-100 to-rose-100', text: 'Tico o coelhinho adorava comer cenoura doce, mas nunca escovava os dentinhos. Um dia, seus dentes começaram a doer!', action: 'Ajude o Tico a pegar sua escova de dentes colorida!', buttonText: 'Pegar Escova 🪥' },
          { emoji: '🐰🪥✨', bg: 'from-cyan-100 to-sky-100', text: 'Com a escova na pata, Tico precisa passar o creme dental com gostinho de fruta. Esprema a bisnaga!', action: 'Aperte a bisnaga para colocar a pasta na escova!', buttonText: 'Espremer Pasta 🧴' },
          { emoji: '🐰😁✨', bg: 'from-emerald-100 to-teal-100', text: 'Dentinhos limpos e brilhantes! Tico prometeu escovar todos os dias depois do café e antes de dormir.', action: 'História concluída! Escove os dentes você também!', buttonText: 'Fim da História! 🔁' }
        ]
      };
    }
    return {
      type: 'story',
      title: `${theme || 'A Aventura Mágica'} ✨`,
      desc: `Uma história encantadora sobre ${theme || 'amizade e descobertas'}.`,
      emoji: '📖',
      pages: [
        { emoji: '🌟', bg: 'from-indigo-100 to-purple-100', text: `Era uma vez, em um lugar mágico, uma história sobre ${theme || 'amizade'} que estava prestes a começar.`, action: 'Clique para virar a página e continuar a aventura!', buttonText: 'Virar Página 📖' },
        { emoji: '✨', bg: 'from-amber-100 to-yellow-100', text: 'Nossos amigos descobriram algo incrível! Uma surpresa os esperava no final do arco-íris.', action: 'Ajude os amigos a alcançar o tesouro!', buttonText: 'Continuar 🌈' },
        { emoji: '🏆', bg: 'from-emerald-100 to-teal-100', text: 'Fim da aventura! Todos aprenderam que o verdadeiro tesouro é a amizade e a imaginação.', action: 'História concluída! Parabéns pela jornada!', buttonText: 'Fim da História! 🔁' }
      ]
    };
  }

  return {
    type: 'song',
    title: `Cantiga de ${theme || 'Alegria'} 🎵`,
    desc: `Uma cantiga animada sobre ${theme || 'alegria'} para cantar e dançar!`,
    emoji: '🎵',
    lyrics: `${theme || 'Alegria'} é tão bom, vamos cantar com animação! Pule, dance e sorria, encha o coração!`,
    sequence: ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Sol', 'Fá']
  };
}
