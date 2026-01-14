import { requireEvolutionApiConfig, isEvolutionApiConfigured } from "@/lib/env";

/**
 * Tipos de resposta da Evolution API
 */
export interface EvolutionApiResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: string;
  status: string;
}

export interface EvolutionApiError {
  status: number;
  error: string;
  message: string;
}

export interface ConnectionStatus {
  instance: string;
  state: "open" | "close" | "connecting";
  statusReason: number;
}

/**
 * Serviço para integração com Evolution API (WhatsApp)
 * 
 * Centraliza todas as chamadas à API, tratamento de erros e
 * formatação de números de telefone brasileiros.
 */
export class WhatsAppService {
  private static getConfig() {
    return requireEvolutionApiConfig();
  }

  /**
   * Verifica se o serviço está configurado
   */
  static isConfigured(): boolean {
    return isEvolutionApiConfigured();
  }

  /**
   * Formata o número para o padrão internacional (E.164) exigido pela API
   * Exemplo: (11) 98888-7777 -> 5511988887777
   * Exemplo: 11988887777 -> 5511988887777
   * Exemplo: 5511988887777 -> 5511988887777
   */
  static formatNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanNumber = phone.replace(/\D/g, "");
    
    // Adiciona o código do Brasil se não houver
    if (cleanNumber.startsWith("55")) {
      return cleanNumber;
    }
    
    return `55${cleanNumber}`;
  }

  /**
   * Valida se o número tem o formato correto para Brasil
   * Números brasileiros: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
   */
  static validateNumber(phone: string): { valid: boolean; reason?: string } {
    const formatted = this.formatNumber(phone);
    
    // Verifica tamanho (55 + 2 DDD + 8-9 número = 12-13 dígitos)
    if (formatted.length < 12 || formatted.length > 13) {
      return {
        valid: false,
        reason: "Número deve ter entre 10 e 11 dígitos (com DDD)",
      };
    }
    
    // Verifica se começa com 55 (Brasil)
    if (!formatted.startsWith("55")) {
      return { valid: false, reason: "Número deve ser brasileiro (começar com 55)" };
    }
    
    return { valid: true };
  }

  /**
   * Envia uma mensagem de texto simples
   */
  static async sendText(
    to: string,
    message: string,
    options?: {
      delay?: number;
      linkPreview?: boolean;
    }
  ): Promise<EvolutionApiResponse> {
    const config = this.getConfig();
    const formattedNumber = this.formatNumber(to);
    
    // Valida o número
    const validation = this.validateNumber(to);
    if (!validation.valid) {
      throw new Error(`Número inválido: ${validation.reason}`);
    }

    try {
      const response = await fetch(
        `${config.url}/message/sendText/${config.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.apiKey,
          },
          body: JSON.stringify({
            number: formattedNumber,
            text: message,
            delay: options?.delay ?? 1200, // Simula digitação para evitar bloqueios
            linkPreview: options?.linkPreview ?? true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao enviar WhatsApp: ${response.status}`);
      }

      return await response.json() as EvolutionApiResponse;
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao enviar mensagem:", error);
      throw error;
    }
  }

  /**
   * Envia uma imagem com legenda opcional
   * Ideal para o mural/daily logs
   */
  static async sendImage(
    to: string,
    imageUrl: string,
    caption?: string,
    options?: {
      delay?: number;
    }
  ): Promise<EvolutionApiResponse> {
    const config = this.getConfig();
    const formattedNumber = this.formatNumber(to);
    
    // Valida o número
    const validation = this.validateNumber(to);
    if (!validation.valid) {
      throw new Error(`Número inválido: ${validation.reason}`);
    }

    try {
      const response = await fetch(
        `${config.url}/message/sendMedia/${config.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.apiKey,
          },
          body: JSON.stringify({
            number: formattedNumber,
            mediatype: "image",
            media: imageUrl,
            caption: caption || "",
            delay: options?.delay ?? 1200,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao enviar imagem: ${response.status}`);
      }

      return await response.json() as EvolutionApiResponse;
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao enviar imagem:", error);
      throw error;
    }
  }

  /**
   * Envia um documento/arquivo
   */
  static async sendDocument(
    to: string,
    documentUrl: string,
    fileName: string,
    caption?: string,
    options?: {
      delay?: number;
    }
  ): Promise<EvolutionApiResponse> {
    const config = this.getConfig();
    const formattedNumber = this.formatNumber(to);
    
    // Valida o número
    const validation = this.validateNumber(to);
    if (!validation.valid) {
      throw new Error(`Número inválido: ${validation.reason}`);
    }

    try {
      const response = await fetch(
        `${config.url}/message/sendMedia/${config.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.apiKey,
          },
          body: JSON.stringify({
            number: formattedNumber,
            mediatype: "document",
            media: documentUrl,
            fileName: fileName,
            caption: caption || "",
            delay: options?.delay ?? 1200,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao enviar documento: ${response.status}`);
      }

      return await response.json() as EvolutionApiResponse;
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao enviar documento:", error);
      throw error;
    }
  }

  /**
   * Verifica o status da conexão da instância
   */
  static async getConnectionStatus(): Promise<ConnectionStatus> {
    const config = this.getConfig();

    try {
      const response = await fetch(
        `${config.url}/instance/connectionState/${config.instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": config.apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao verificar status: ${response.status}`);
      }

      return await response.json() as ConnectionStatus;
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao verificar status:", error);
      throw error;
    }
  }

  /**
   * Gera o QR Code para conectar a instância
   */
  static async getQRCode(): Promise<{ code: string; base64: string }> {
    const config = this.getConfig();

    try {
      const response = await fetch(
        `${config.url}/instance/connect/${config.instanceName}`,
        {
          method: "GET",
          headers: {
            "apikey": config.apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao gerar QR Code: ${response.status}`);
      }

      return await response.json() as { code: string; base64: string };
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao gerar QR Code:", error);
      throw error;
    }
  }

  /**
   * Desconecta a instância (logout)
   */
  static async disconnect(): Promise<void> {
    const config = this.getConfig();

    try {
      const response = await fetch(
        `${config.url}/instance/logout/${config.instanceName}`,
        {
          method: "DELETE",
          headers: {
            "apikey": config.apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as EvolutionApiError;
        throw new Error(errorData.message || `Erro ao desconectar: ${response.status}`);
      }
    } catch (error) {
      console.error("[WhatsApp Service] Erro ao desconectar:", error);
      throw error;
    }
  }
}

// ============================================
// Templates de Mensagens para TeteCare
// ============================================

export const WhatsAppTemplates = {
  /**
   * Mensagem de check-in do pet
   */
  checkin: (petName: string, tutorName: string) =>
    `Olá ${tutorName}! 🐾\n\nO(a) ${petName} acabou de fazer check-in na TeteCare!\n\nQualquer novidade, entraremos em contato. Tenha um ótimo dia! 💙`,

  /**
   * Mensagem de check-out do pet
   */
  checkout: (petName: string, tutorName: string) =>
    `Olá ${tutorName}! 🐾\n\nO(a) ${petName} está pronto(a) para ir para casa!\n\nFoi um prazer cuidar do(a) seu(sua) pet hoje. Até a próxima! 💙`,

  /**
   * Lembrete de vacina
   */
  vaccineReminder: (petName: string, vaccineName: string, date: string) =>
    `🔔 Lembrete de Vacina\n\nOlá! O(a) ${petName} tem vacina de ${vaccineName} agendada para ${date}.\n\nNão se esqueça de trazer a carteirinha de vacinação! 💉`,

  /**
   * Lembrete de medicação
   */
  medicationReminder: (petName: string, medicationName: string, dosage: string) =>
    `💊 Lembrete de Medicação\n\nHora de dar ${medicationName} para o(a) ${petName}!\n\nDosagem: ${dosage}`,

  /**
   * Atualização do mural/daily log
   */
  dailyUpdate: (petName: string, updateType: string) =>
    `📸 Atualização de ${petName}\n\nAcabamos de publicar ${updateType} no mural do(a) ${petName}!\n\nAcesse o app para ver as novidades. 🐕`,

  /**
   * Confirmação de reserva
   */
  bookingConfirmation: (petName: string, date: string, service: string) =>
    `✅ Reserva Confirmada\n\nA reserva para ${petName} foi confirmada!\n\n📅 Data: ${date}\n🐾 Serviço: ${service}\n\nAguardamos vocês! 💙`,

  /**
   * Lembrete de reserva
   */
  bookingReminder: (petName: string, date: string, time: string) =>
    `⏰ Lembrete de Reserva\n\nOlá! Lembrando que amanhã (${date}) às ${time} você tem reserva para o(a) ${petName}.\n\nAté lá! 🐾`,

  /**
   * Alerta de comportamento
   */
  behaviorAlert: (petName: string, observation: string) =>
    `⚠️ Observação Importante\n\nNotamos algo sobre o(a) ${petName}:\n\n${observation}\n\nEntre em contato se precisar de mais informações.`,
};
