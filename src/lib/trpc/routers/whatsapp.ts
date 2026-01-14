import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../init";
import { WhatsAppService, WhatsAppTemplates } from "@/lib/services/whatsapp";
import { TRPCError } from "@trpc/server";

/**
 * Router tRPC para integração com WhatsApp via Evolution API
 * 
 * Todas as operações requerem autenticação:
 * - Envio de mensagens: apenas admins
 * - Verificação de status: admins
 * - Gestão da instância: admins
 */
export const whatsappRouter = router({
  /**
   * Verifica se a Evolution API está configurada
   */
  isConfigured: protectedProcedure.query(() => {
    return WhatsAppService.isConfigured();
  }),

  /**
   * Verifica o status da conexão da instância WhatsApp
   */
  getConnectionStatus: adminProcedure.query(async () => {
    if (!WhatsAppService.isConfigured()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Evolution API não está configurada. Configure as variáveis de ambiente.",
      });
    }

    try {
      const status = await WhatsAppService.getConnectionStatus();
      return {
        connected: status.state === "open",
        state: status.state,
        instance: status.instance,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Erro ao verificar status",
      });
    }
  }),

  /**
   * Gera QR Code para conectar a instância
   */
  getQRCode: adminProcedure.query(async () => {
    if (!WhatsAppService.isConfigured()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Evolution API não está configurada.",
      });
    }

    try {
      const qr = await WhatsAppService.getQRCode();
      return qr;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Erro ao gerar QR Code",
      });
    }
  }),

  /**
   * Desconecta a instância WhatsApp
   */
  disconnect: adminProcedure.mutation(async () => {
    if (!WhatsAppService.isConfigured()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Evolution API não está configurada.",
      });
    }

    try {
      await WhatsAppService.disconnect();
      return { success: true, message: "Instância desconectada com sucesso" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Erro ao desconectar",
      });
    }
  }),

  /**
   * Envia uma mensagem de texto para um número
   */
  sendText: adminProcedure
    .input(
      z.object({
        phone: z.string().min(10, "Número deve ter pelo menos 10 dígitos"),
        message: z.string().min(1, "Mensagem não pode estar vazia").max(4096, "Mensagem muito longa"),
        delay: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!WhatsAppService.isConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Evolution API não está configurada.",
        });
      }

      // Valida o número antes de enviar
      const validation = WhatsAppService.validateNumber(input.phone);
      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.reason || "Número inválido",
        });
      }

      try {
        const result = await WhatsAppService.sendText(input.phone, input.message, {
          delay: input.delay,
        });
        return {
          success: true,
          messageId: result.key.id,
          to: result.key.remoteJid,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Erro ao enviar mensagem",
        });
      }
    }),

  /**
   * Envia uma imagem com legenda
   */
  sendImage: adminProcedure
    .input(
      z.object({
        phone: z.string().min(10),
        imageUrl: z.string().url("URL da imagem inválida"),
        caption: z.string().max(1024).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!WhatsAppService.isConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Evolution API não está configurada.",
        });
      }

      const validation = WhatsAppService.validateNumber(input.phone);
      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.reason || "Número inválido",
        });
      }

      try {
        const result = await WhatsAppService.sendImage(
          input.phone,
          input.imageUrl,
          input.caption
        );
        return {
          success: true,
          messageId: result.key.id,
          to: result.key.remoteJid,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Erro ao enviar imagem",
        });
      }
    }),

  /**
   * Envia um documento/arquivo
   */
  sendDocument: adminProcedure
    .input(
      z.object({
        phone: z.string().min(10),
        documentUrl: z.string().url("URL do documento inválida"),
        fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
        caption: z.string().max(1024).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!WhatsAppService.isConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Evolution API não está configurada.",
        });
      }

      const validation = WhatsAppService.validateNumber(input.phone);
      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.reason || "Número inválido",
        });
      }

      try {
        const result = await WhatsAppService.sendDocument(
          input.phone,
          input.documentUrl,
          input.fileName,
          input.caption
        );
        return {
          success: true,
          messageId: result.key.id,
          to: result.key.remoteJid,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Erro ao enviar documento",
        });
      }
    }),

  /**
   * Envia mensagem de teste (útil para validar configuração)
   */
  sendTestMessage: adminProcedure
    .input(
      z.object({
        phone: z.string().min(10),
      })
    )
    .mutation(async ({ input }) => {
      if (!WhatsAppService.isConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Evolution API não está configurada.",
        });
      }

      const validation = WhatsAppService.validateNumber(input.phone);
      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.reason || "Número inválido",
        });
      }

      try {
        const testMessage = `🐾 *TeteCare Hub - Teste de Conexão*\n\n✅ A integração com WhatsApp está funcionando corretamente!\n\n_Mensagem enviada em ${new Date().toLocaleString("pt-BR")}_`;
        
        const result = await WhatsAppService.sendText(input.phone, testMessage);
        return {
          success: true,
          messageId: result.key.id,
          to: result.key.remoteJid,
          message: "Mensagem de teste enviada com sucesso!",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Erro ao enviar mensagem de teste",
        });
      }
    }),

  /**
   * Formata um número de telefone (útil para preview)
   */
  formatNumber: protectedProcedure
    .input(z.object({ phone: z.string() }))
    .query(({ input }) => {
      const formatted = WhatsAppService.formatNumber(input.phone);
      const validation = WhatsAppService.validateNumber(input.phone);
      return {
        original: input.phone,
        formatted,
        valid: validation.valid,
        reason: validation.reason,
      };
    }),

  /**
   * Retorna os templates de mensagens disponíveis
   */
  getTemplates: protectedProcedure.query(() => {
    return {
      checkin: {
        name: "Check-in",
        description: "Notificação quando pet faz check-in",
        example: WhatsAppTemplates.checkin("Max", "João"),
      },
      checkout: {
        name: "Check-out",
        description: "Notificação quando pet está pronto para ir embora",
        example: WhatsAppTemplates.checkout("Max", "João"),
      },
      vaccineReminder: {
        name: "Lembrete de Vacina",
        description: "Lembrete de vacina agendada",
        example: WhatsAppTemplates.vaccineReminder("Max", "V10", "15/01/2026"),
      },
      medicationReminder: {
        name: "Lembrete de Medicação",
        description: "Lembrete de medicação",
        example: WhatsAppTemplates.medicationReminder("Max", "Frontline", "1 pipeta"),
      },
      dailyUpdate: {
        name: "Atualização Diária",
        description: "Notificação de nova postagem no mural",
        example: WhatsAppTemplates.dailyUpdate("Max", "uma foto nova"),
      },
      bookingConfirmation: {
        name: "Confirmação de Reserva",
        description: "Confirmação de reserva agendada",
        example: WhatsAppTemplates.bookingConfirmation("Max", "20/01/2026", "Day Care"),
      },
      bookingReminder: {
        name: "Lembrete de Reserva",
        description: "Lembrete de reserva para o dia seguinte",
        example: WhatsAppTemplates.bookingReminder("Max", "20/01/2026", "08:00"),
      },
      behaviorAlert: {
        name: "Alerta de Comportamento",
        description: "Notificação sobre observação importante",
        example: WhatsAppTemplates.behaviorAlert("Max", "O pet está um pouco mais quieto que o normal hoje."),
      },
    };
  }),
});
