// src/lib/types.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// --- SCHEMA DE FARINHA (Existente) ---
export const farinhaSchema = z.object({
  nome: z.string().min(3, { message: 'O nome da farinha é obrigatório.' }),
});
export type FarinhaFormValues = z.infer<typeof farinhaSchema>;
export type Farinha = {
  id: string;
  nome: string;
  userId: string;
};

// --- SCHEMAS PARA CLIENTE E PADARIA ---
export const clienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),
  telefone: z.string().optional(),
});

export const padariaSchema = z.object({
  nome: z.string().min(3, { message: 'O nome da padaria é obrigatório.' }),
  // Campos agora opcionais
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  // Campos que permanecem obrigatórios
  cnpj: z
    .string()
    .length(18, { message: 'CNPJ inválido (deve ter 18 caracteres).' }),
  telefone: z.string().min(10, { message: 'O telefone é obrigatório.' }),
  clientes: z.array(clienteSchema).min(1, {
    message: 'A padaria deve ter pelo menos um cliente/proprietário.',
  }),
});

export type Cliente = z.infer<typeof clienteSchema> & {
  id: string;
  padariaId: string;
  userId: string;
};
export type PadariaFormValues = z.infer<typeof padariaSchema>;
export type Padaria = {
  id: string;
  userId: string;
  nome: string;
  endereco?: string; // Marcado como opcional
  bairro?: string; // Marcado como opcional
  cep?: string; // Marcado como opcional
  cnpj: string;
  telefone: string;
};

// --- SCHEMA DE VENDA ---
export const itemSchema = z.object({
  farinha: z.string().min(1, { message: 'Selecione uma farinha.' }),
  // Trocamos z.coerce por z.preprocess para evitar o conflito de tipos
  quantidade: z.preprocess(
    (val) => Number(String(val).trim()),
    z
      .number({ message: 'Deve ser um número.' })
      .min(1, { message: 'A qtd. deve ser no mínimo 1.' }),
  ),
  precoUnitario: z.preprocess(
    (val) => Number(String(val).trim()),
    z
      .number({ message: 'Deve ser um número.' })
      .min(0.01, { message: 'O preço deve ser positivo.' }),
  ),
  comissaoPercentual: z.preprocess(
    (val) => Number(String(val).trim()),
    z
      .number({ message: 'Deve ser um número.' })
      .min(0, { message: 'Comissão não pode ser negativa.' })
      .max(100, { message: 'Comissão não pode ser maior que 100.' })
      .default(0),
  ),
});

export const vendaSchema = z.object({
  clienteId: z.string().min(1, { message: 'Selecione um cliente.' }),
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
  clienteId: string;
  clienteNome: string;
  padariaNome: string;
  data: Timestamp;
  itens: ItemVenda[];
  totalVenda: number;
  totalComissao: number;
  userId: string;
  cliente?: string; // Adicionamos o campo antigo 'cliente' como opcional
};

// --- SCHEMA DE CADASTRO (Existente) ---
export const signUpSchema = z.object({
  fullName: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
});
export type SignUpFormValues = z.infer<typeof signUpSchema>;
