// lib/types.ts
import { z } from 'zod';

// Define o schema de validação para o formulário usando Zod
export const vendaSchema = z.object({
  cliente: z
    .string()
    .min(3, { message: 'O nome do cliente deve ter pelo menos 3 caracteres.' }),
  farinha: z.string({ required_error: 'Por favor, selecione uma farinha.' }),
  quantidade: z.coerce
    .number()
    .min(1, { message: 'A quantidade deve ser no mínimo 1.' }),
  precoUnitario: z.coerce
    .number()
    .min(0.01, { message: 'O preço unitário deve ser positivo.' }),
  comissaoPercentual: z.coerce.number().min(0).max(100).default(0),
});

// Extrai o tipo do formulário a partir do schema
export type VendaFormValues = z.infer<typeof vendaSchema>;

// Define o tipo completo da Venda, como ela é salva no banco de dados
export type Venda = VendaFormValues & {
  id: string;
  data: string;
  totalVenda: number;
  // Adicionamos o ID do usuário para futuras regras de segurança
  userId: string;
};
