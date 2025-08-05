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

export const padariaSchema = z
  .object({
    nome: z.string().min(3, { message: 'O nome da padaria é obrigatório.' }),
    endereco: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    // --- INÍCIO DA ALTERAÇÃO ---
    // 1. Adicionamos o campo CPF como opcional
    cpf: z.string().optional(),
    // 2. Tornamos o CNPJ opcional
    cnpj: z.string().optional(),
    // 3. Tornamos o Telefone opcional
    telefone: z.string().optional(),
    // --- FIM DA ALTERAÇÃO ---
    clientes: z.array(clienteSchema),
  })
  // 4. Adicionamos a regra de validação customizada
  .refine((data) => !!data.cpf || !!data.cnpj, {
    message: 'É obrigatório preencher o CPF ou o CNPJ.',
    // Isso fará a mensagem de erro aparecer em ambos os campos
    path: ['cpf', 'cnpj'],
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
  endereco?: string;
  bairro?: string;
  cep?: string;
  cpf?: string; // Adicionado ao tipo
  cnpj?: string; // Marcado como opcional
  telefone?: string; // Marcado como opcional
};

// --- SCHEMA DE VENDA ---
export const itemSchema = z.object({
  farinha: z.string().min(1, { message: 'Selecione uma farinha.' }),
  quantidade: z.coerce
    .number({ message: 'Deve ser um número.' })
    .min(1, { message: 'A qtd. deve ser no mínimo 1.' }),
  precoUnitario: z.coerce
    .number({ message: 'Deve ser um número.' })
    .min(0.01, { message: 'O preço deve ser positivo.' }),
  comissaoPercentual: z.coerce
    .number({ message: 'Deve ser um número.' })
    .min(0, { message: 'Comissão não pode ser negativa.' })
    .max(100, { message: 'Comissão não pode ser maior que 100.' })
    .default(0),
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
  cliente?: string;
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
