import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ProductsService } from '../products/products.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../conversations/messages.service';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY no está configurada');
    }
    this.groq = new Groq({ apiKey });
  }

  /**
   * Define las funciones disponibles para el LLM
   */
  private getToolDeclarations() {
    return [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description:
            'Busca productos en la base de datos. Usa esta función cuando el usuario describe qué tipo de producto está buscando. La búsqueda puede ser por nombre, descripción, marca, o características del producto.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  'Texto de búsqueda que describe el producto. Por ejemplo: "celular Samsung", "laptop gaming", "zapatillas deportivas", etc.',
              },
              limit: {
                type: 'integer',
                description:
                  'Número máximo de productos a retornar (por defecto 5)',
              },
            },
            required: ['query'],
          },
        },
      },
    ];
  }

  /**
   * Ejecuta una función llamada por el LLM
   */
  private async executeFunction(
    functionName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    try {
      if (functionName === 'search_products') {
        const query = args.query as string;
        console.log('🔍 Búsqueda de productos con query:', query);

        // Convertir limit a número por si viene como string
        const limitValue = args.limit !== undefined ? args.limit : 5;
        const limit =
          typeof limitValue === 'string'
            ? parseInt(limitValue, 10)
            : (limitValue as number);
        const products = await this.productsService.searchSimilar(query, limit);

        console.log(`✓ Encontrados ${products.length} productos`);
        if (products.length > 0) {
          console.log(
            'Primeros productos:',
            products.slice(0, 3).map((p) => ({ name: p.name, brand: p.brand })),
          );
        }

        if (products.length === 0) {
          return JSON.stringify({
            message: 'No se encontraron productos con esa descripción',
            products: [],
          });
        }

        // Formatear productos para el LLM
        const formattedProducts = products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          slug: p.slug,
          price: p.price,
          brand: p.brand,
          stock: p.stock,
          category: p.category?.name,
          image_url: p.image_url,
        }));

        return JSON.stringify({
          message: `Se encontraron ${products.length} producto(s)`,
          products: formattedProducts,
        });
      }

      return JSON.stringify({ error: 'Función no encontrada' });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`Error ejecutando función ${functionName}:`, error);
      return JSON.stringify({
        error: `Error al ejecutar ${functionName}: ${error.message}`,
      });
    }
  }

  /**
   * Genera respuesta con streaming y function calling
   * Devuelve un async generator que produce chunks de texto o tool results
   */
  async *chatStream(
    message: string,
    conversationId?: string,
  ): AsyncGenerator<
    { type: 'text'; content: string } | { type: 'tool-result'; data: any }
  > {
    const systemInstruction = `Eres un asistente de compras inteligente para una plataforma de e-commerce.

REGLA CRÍTICA ABSOLUTA: SIEMPRE que el usuario mencione cualquier cosa que pueda ser un producto, marca, categoría, característica, uso, necesidad o actividad, debes usar INMEDIATAMENTE la función search_products. ESTO APLICA EN CADA MENSAJE, INCLUSO SI YA BUSCASTE ANTES.

REGLA DE REFINAMIENTO: Si el usuario hace una pregunta de seguimiento que refina o filtra productos anteriores (ej. "con micrófono", "más baratos", "de otra marca"), DEBES llamar a search_products con la query refinada. NUNCA uses solo la información del historial.

REGLA DE BÚSQUEDA EXCLUSIVA: Al invocar search_products, el argumento 'query' debe ser un concepto simple, directo y en texto plano (ej. "auriculares con microfono"). NUNCA listes múltiples sinónimos de golpe, ni separes palabras por comas, ni acumules términos redundantes.

Ejemplos de cómo usar search_products:
- "necesito algo para sentarme" → busca: "silla de escritorio"
- "cosas de Nike" → busca: "Nike"
- "quiero escuchar música" → busca: "auriculares inalambricos"
- "busco auriculares" → busca: "auriculares"
- "tenes auriculares con micrófono?" → busca: "auriculares con microfono"
- "algo más barato" → busca con el contexto del producto previo + "barato"
- "quiero un producto para jugar videojuegos" → busca: "consola de videojuegos"

IMPORTANTE: CADA pregunta sobre productos REQUIERE una nueva búsqueda. NUNCA respondas basándote solo en búsquedas anteriores.

SOLO rechaza consultas COMPLETAMENTE ajenas al e-commerce:
- Política, noticias, eventos actuales
- Programación, matemáticas, ciencia pura
- Recetas de cocina, consejos médicos
- Filosofía, historia, literatura
- Preguntas sobre tu funcionamiento técnico

Para esos casos, responde cortésmente:
"Lo siento, soy un asistente especializado en ayudarte a encontrar y comprar productos. ¿Puedo ayudarte a buscar algo específico?"

Cuando presentes resultados de búsqueda:
1. Presenta brevemente los productos encontrados en 1-2 oraciones
2. Menciona las características más relevantes
3. Se conciso y directo
Responde en español de forma natural y conversacional.`;

    try {
      // Gestión de conversación e historial
      let conversationIdToUse: string | undefined = conversationId;
      let history: any[] = [];

      if (conversationId) {
        // Buscar o crear conversación
        let conversation =
          await this.conversationsService.findOne(conversationId);
        if (!conversation) {
          conversation = await this.conversationsService.create({
            id: conversationId,
            title: message.substring(0, 50),
          });
          conversationIdToUse = conversationId;
        }

        // Cargar historial de mensajes
        const messages = await this.messagesService.findByConversation(
          conversation.id,
        );
        history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Guardar mensaje del usuario
        await this.messagesService.create({
          conversation_id: conversation.id,
          role: 'user',
          content: message,
        });
      }

      // Test: enviar mensaje inicial para verificar que el streaming funciona
      yield { type: 'text', content: 'Buscando productos... ' };

      // Paso 1: Primera llamada para detectar function calls (sin streaming)
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          ...history,
          { role: 'user', content: message },
        ],
        tools: this.getToolDeclarations(),
        tool_choice: 'required', // Forzar que SIEMPRE use una herramienta
        temperature: 0.3, // Aumentar temperatura para mejor function calling
      });

      const responseMessage = completion.choices[0]?.message;

      // Si no hay tool calls, retornar respuesta directa
      if (
        !responseMessage?.tool_calls ||
        responseMessage.tool_calls.length === 0
      ) {
        console.log(
          '⚠️ LLM no llamó a search_products a pesar de tool_choice=required',
        );
        const content =
          responseMessage?.content ||
          'Lo siento, soy un asistente especializado en ayudarte a encontrar y comprar productos. ¿Puedo ayudarte a buscar algo específico?';
        yield { type: 'text', content };

        // Guardar respuesta directa del asistente
        if (conversationIdToUse && content) {
          await this.messagesService.create({
            conversation_id: conversationIdToUse,
            role: 'assistant',
            content,
          });
        }
        return;
      }

      console.log(
        '✓ LLM llamó a search_products:',
        responseMessage.tool_calls.map((tc) => tc.function.name),
      );

      // Paso 2: Ejecutar function calls
      const functionResults = await Promise.all(
        responseMessage.tool_calls.map(async (toolCall) => {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          const result = await this.executeFunction(functionName, functionArgs);
          const parsedResult = JSON.parse(result);

          return {
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            name: functionName,
            content: result,
            parsedResult,
          };
        }),
      );

      // Enviar los productos al frontend
      for (const funcResult of functionResults) {
        if (funcResult.parsedResult?.products) {
          yield {
            type: 'tool-result',
            data: funcResult.parsedResult,
          };
        }
      }

      // Paso 3: Segunda llamada con los resultados de las funciones CON STREAMING
      const stream = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemInstruction },
          ...history,
          { role: 'user', content: message },
          responseMessage,
          ...functionResults.map((fr) => ({
            role: fr.role,
            name: fr.name,
            tool_call_id: fr.tool_call_id,
            content: fr.content,
          })),
        ],
        stream: true,
        temperature: 0.7,
      });

      // Acumular productos encontrados
      const allProducts: any[] = [];
      for (const funcResult of functionResults) {
        if (funcResult.parsedResult?.products) {
          allProducts.push(...funcResult.parsedResult.products);
        }
      }

      // Stream de la respuesta final y acumular contenido
      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          yield { type: 'text', content };
        }
      }

      // Guardar respuesta del asistente en la conversación
      if (conversationIdToUse && fullResponse) {
        await this.messagesService.create({
          conversation_id: conversationIdToUse,
          role: 'assistant',
          content: fullResponse,
          products: allProducts.length > 0 ? allProducts : undefined,
        });
      }
    } catch (error) {
      console.error('Error en chat stream:', error);
      yield { type: 'text', content: 'Error: No se pudo procesar el mensaje' };
    }
  }
}
