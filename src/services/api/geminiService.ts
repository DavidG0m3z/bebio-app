import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { Baby } from '../../context/BabyContext';
import { GrowthRecordWithPercentile } from '../../hooks/useGrowth';
import { Vaccine } from '../../services/firebase/vaccineService';


const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
console.log('🔑 API Key existe:', apiKey.length > 0);
console.log('🔑 Primeros 8 chars:', apiKey.substring(0, 8));

const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface BabyContext {
  baby: Baby;
  ageInMonths: number;
  latestWeight: number | null;
  latestHeight: number | null;
  latestHead: number | null;
  lastWeightPercentile: string | null;
  lastHeightPercentile: string | null;
  appliedVaccines: Vaccine[];
  nextVaccine: Vaccine | null;
  recentRecords: GrowthRecordWithPercentile[];
}

const buildSystemPrompt = (ctx: BabyContext): string => {
  const genderLabel = ctx.baby.gender === 'male' ? 'niño' : 'niña';
  const vaccineNames = ctx.appliedVaccines.map((v) => v.name).join(', ');

  return `Eres un asistente amigable y empático especializado en desarrollo infantil para la app Bebio.
Ayudas a padres con información sobre el crecimiento y desarrollo de sus bebés.

CONTEXTO DEL BEBÉ:
- Nombre: ${ctx.baby.name}
- Género: ${genderLabel}
- Edad: ${ctx.ageInMonths} meses
- Último peso: ${ctx.latestWeight !== null ? `${ctx.latestWeight} kg (Percentil: ${ctx.lastWeightPercentile})` : 'No registrado'}
- Última talla: ${ctx.latestHeight !== null ? `${ctx.latestHeight} cm (Percentil: ${ctx.lastHeightPercentile})` : 'No registrada'}
- Perímetro cefálico: ${ctx.latestHead !== null ? `${ctx.latestHead} cm` : 'No registrado'}
- Vacunas aplicadas: ${vaccineNames || 'Ninguna aún'}
- Próxima vacuna: ${ctx.nextVaccine ? ctx.nextVaccine.name : 'Al día con vacunas'}

INSTRUCCIONES:
- Responde SIEMPRE en español
- Usa el nombre del bebé (${ctx.baby.name}) en tus respuestas
- Sé empático y tranquilizador con los padres
- Basa tus respuestas en los datos reales del bebé cuando sea relevante
- Para temas médicos serios, recomienda consultar al pediatra
- Respuestas concisas — máximo 1-2 párrafos
- No uses markdown en las respuestas (no asteriscos, no #)`;
};

export const createChatSession = (ctx: BabyContext): ChatSession => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(ctx),
  });

  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  });
};

export const sendMessage = async (
  session: ChatSession,
  message: string
): Promise<string> => {
  try {
    const result = await session.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.log('❌ Gemini error:', err);
    throw err;
  }
};

// export const sendMessage = async (

//   session: ChatSession,
//   message: string
// ): Promise<string> => {
//   const result = await session.sendMessage(message);
//   return result.response.text();
// };