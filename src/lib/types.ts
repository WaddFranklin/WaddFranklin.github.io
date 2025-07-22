// lib/types.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// Usamos z.coerce para converter os valores do formulário (que chegam como string)
// para os tipos corretos (number), mantendo a inferência de tipo para o TypeScript.
export const itemSchema = z.object({
  farinha: z.string().min(1, { message: 'Selecione uma farinha.' }),

  quantidade: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .min(1, { message: 'A qtd. deve ser no mínimo 1.' }),

  precoUnitario: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .min(0.01, { message: 'O preço deve ser positivo.' }),

  comissaoPercentual: z.coerce
    .number({ invalid_type_error: 'Deve ser um número.' })
    .min(0, { message: 'Comissão não pode ser negativa.' })
    .max(100, { message: 'Comissão não pode ser maior que 100.' })
    .default(0),
});

export const vendaSchema = z.object({
  cliente: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),

  // Use z.preprocess para garantir que o tipo seja sempre Date
  data: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return new Date();
    },
    z.date().refine((d) => d instanceof Date && !isNaN(d.getTime()), {
      message: 'A data é obrigatória.',
    }),
  ),

  itens: z
    .array(itemSchema)
    .min(1, { message: 'A venda deve ter pelo menos um item.' }),
});

export type ItemVenda = z.infer<typeof itemSchema>;
export type VendaFormValues = z.infer<typeof vendaSchema>;

export type Venda = {
  id: string;
  cliente: string;
  data: Timestamp;
  itens: ItemVenda[];
  totalVenda: number;
  totalComissao: number;
  userId: string;
};

// --- SCHEMA DE CADASTRO DE USUÁRIO (permanece o mesmo) ---
export const signUpSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
