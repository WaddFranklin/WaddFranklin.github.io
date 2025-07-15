// lib/types.ts
import { z } from 'zod';

// O itemSchema não precisa de alterações.
export const itemSchema = z.object({
  farinha: z.string().min(1, { message: 'Selecione uma farinha.' }),

  quantidade: z.preprocess(
    (val) => Number(String(val).trim() || 0),
    z.number().min(1, { message: 'A qtd. deve ser no mínimo 1.' }),
  ),

  precoUnitario: z.preprocess(
    (val) => Number(String(val).trim() || 0),
    z.number().min(0.01, { message: 'O preço deve ser positivo.' }),
  ),

  comissaoPercentual: z.preprocess(
    (val) => Number(String(val).trim() || 0),
    z
      .number()
      .min(0, { message: 'Comissão não pode ser negativa.' })
      .max(100, { message: 'Comissão não pode ser maior que 100.' })
      .default(0),
  ),
});

// Schema da venda com a correção definitiva para o campo 'data'
export const vendaSchema = z.object({
  cliente: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),

  // SOLUÇÃO: Usar z.preprocess para a data, tornando a conversão explícita e segura.
  // Isso resolve o conflito de tipos no build da Vercel.
  data: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return new Date(); // Fallback para data atual se o valor for inválido
    },
    z.date({
      required_error: 'A data é obrigatória.',
    }),
  ),

  itens: z
    .array(itemSchema)
    .min(1, { message: 'A venda deve ter pelo menos um item.' }),
});

// Os tipos abaixo são atualizados automaticamente pela inferência do Zod.
export type ItemVenda = z.infer<typeof itemSchema>;
export type VendaFormValues = z.infer<typeof vendaSchema>;

export type Venda = {
  id: string;
  cliente: string;
  data: string; // Continuamos salvando como string (formato ISO) no Firestore.
  itens: ItemVenda[];
  totalVenda: number;
  totalComissao: number;
  userId: string;
};
