// src/lib/types.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore'; // Importa o tipo Timestamp do Firebase

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

export const vendaSchema = z.object({
  cliente: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),
  // O campo data agora pode ser do tipo Date ou Timestamp do Firebase
  data: z.union([z.date(), z.instanceof(Timestamp)]),
  itens: z
    .array(itemSchema)
    .min(1, { message: 'A venda deve ter pelo menos um item.' }),
});

export type ItemVenda = z.infer<typeof itemSchema>;
export type VendaFormValues = z.infer<typeof vendaSchema>;

// Este será o nosso tipo principal para representar uma venda vinda do Firestore
export type Venda = {
  id: string; // ID do documento no Firestore
  cliente: string;
  data: Timestamp; // Usaremos o tipo Timestamp do Firebase para datas
  itens: ItemVenda[];
  totalVenda: number;
  totalComissao: number;
  userId: string; // Para saber qual usuário criou a venda
};

// --- SCHEMA DE CADASTRO DE USUÁRIO (permanece o mesmo) ---
export const signUpSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  email: z.email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
