import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class EmbeddingsService {
  private genAI: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY no está configurada');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  /**
   * Genera embeddings de una imagen usando Google AI
   * @param imageBase64 - Imagen en formato base64
   * @param mimeType - Tipo MIME de la imagen (ej: 'image/jpeg', 'image/png')
   * @returns Vector de embeddings
   */
  async generateImageEmbedding(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
  ): Promise<number[]> {
    try {
      const result = await this.genAI.models.embedContent({
        model: 'gemini-embedding-2',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
      });

      // La respuesta tiene embeddings[0].values
      if (result.embeddings && result.embeddings.length > 0) {
        return result.embeddings[0].values || [];
      }

      throw new Error('No se recibieron embeddings en la respuesta');
    } catch (error) {
      console.error('Error generando embedding de imagen:', error);
      throw new Error('No se pudo generar el embedding de la imagen');
    }
  }

  /**
   * Genera embeddings de texto usando Google AI
   * @param text - Texto a convertir en embedding
   * @returns Vector de embeddings
   */
  async generateTextEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.genAI.models.embedContent({
        model: 'gemini-embedding-2',
        contents: [text],
      });

      // La respuesta tiene embeddings[0].values
      if (result.embeddings && result.embeddings.length > 0) {
        return result.embeddings[0].values || [];
      }

      throw new Error('No se recibieron embeddings en la respuesta');
    } catch (error) {
      console.error('Error generando embedding de texto:', error);
      throw new Error('No se pudo generar el embedding del texto');
    }
  }
}
