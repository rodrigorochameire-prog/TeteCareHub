/**
 * Services - Camada de Serviços (Cérebro Central)
 * 
 * Este módulo exporta todos os serviços centralizados da aplicação.
 * Os serviços implementam o padrão "Service Pattern" para garantir:
 * 
 * 1. Operações atômicas com transações de banco
 * 2. Lógica de negócio centralizada
 * 3. Reações em cadeia (calcular tempo, debitar crédito, registrar transação)
 * 4. Inteligência preditiva (alertas proativos)
 * 5. Consistência de dados entre entidades
 */

// Serviço de Creche - Check-in/out Inteligente
export { DaycareService } from "./daycare.service";

// Serviço de Alimentação - Smart Stock
export { FoodService } from "./food.service";

// Serviço de Créditos - Operações atômicas
export {
  performCreditOperation,
  addCredits,
  debitCredits,
  hasCredits,
  getCreditsBalance,
  refundCredits,
  addBonusCredits,
  adjustCredits,
  getCreditHistory,
  getCreditReport,
  type CreditOperationType,
  type CreditOperation,
  type CreditOperationResult,
} from "./credit-engine";

// Serviço de Atendimento - Check-in/out (legado, usar DaycareService)
export {
  performCheckIn,
  performCheckOut,
  validateCheckIn,
  type CheckInResult,
  type CheckOutResult,
  type CheckInOptions,
  type CheckOutOptions,
} from "./attendance.service";

// Serviço de WhatsApp - Notificações
export {
  WhatsAppService,
  WhatsAppTemplates,
  MetaTemplateNames,
  type WhatsAppCredentials,
  type WhatsAppMessageResponse,
  type WhatsAppBusinessProfile,
  type MessageStatus,
  type MessageContext,
} from "./whatsapp";
