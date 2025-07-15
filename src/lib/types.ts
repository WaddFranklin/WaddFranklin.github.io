// lib/types.ts
import { z } from 'zod';

// Schema para validação. Usamos z.preprocess para garantir a conversão de tipo.
export const vendaSchema = z.object({
  cliente: z
    .string()
    .min(3, { message: 'O nome do cliente deve ter pelo menos 3 caracteres.' }),
  farinha: z.string().min(1, { message: 'Por favor, selecione uma farinha.' }),

  // Converte explicitamente o valor para número ANTES de validar.
  // Isso resolve o problema de inferência de tipo no build da Vercel.
  quantidade: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: 'Quantidade deve ser um número.' })
      .min(1, { message: 'A quantidade deve ser no mínimo 1.' }),
  ),

  precoUnitario: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: 'Preço deve ser um número.' })
      .min(0.01, { message: 'O preço unitário deve ser positivo.' }),
  ),

  comissaoPercentual: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: 'Comissão deve ser um número.' })
      .min(0, 'Comissão não pode ser negativa.')
      .max(100, 'Comissão não pode ser maior que 100.'),
  ),
});

// A inferência de tipo agora funcionará corretamente.
export type VendaFormValues = z.infer<typeof vendaSchema>;

// Define o tipo completo da Venda, como ela é salva no banco de dados
export type Venda = VendaFormValues & {
  id: string;
  data: string;
  totalVenda: number;
  userId: string;
};
