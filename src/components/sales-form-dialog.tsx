// src/components/sales-form-dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Venda,
  VendaFormValues,
  vendaSchema,
  Farinha,
  Padaria,
} from '@/lib/types';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from './ui/separator';
import { Trash2, PlusCircle } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface SalesFormDialogProps {
  vendaToEdit?: Venda | null;
  onSubmit: (values: VendaFormValues) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  padarias: Padaria[];
}

export function SalesFormDialog({
  isOpen,
  setIsOpen,
  vendaToEdit,
  onSubmit,
  padarias,
}: SalesFormDialogProps) {
  const { user } = useAuth();
  const [farinhasDisponiveis, setFarinhasDisponiveis] = useState<Farinha[]>([]);

  const form = useForm<VendaFormValues>({
    resolver: zodResolver(vendaSchema) as Resolver<VendaFormValues>,
    defaultValues: {
      padariaId: '',
      data: new Date(),
      itens: [
        { farinha: '', quantidade: 1, precoUnitario: 0, comissaoPercentual: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  });

  useEffect(() => {
    const fetchFarinhas = async () => {
      if (user && isOpen) {
        try {
          const farinhasCol = collection(db, 'farinhas');
          const qFarinhas = query(
            farinhasCol,
            where('userId', '==', user.uid),
            orderBy('nome', 'asc'),
          );
          const farinhasSnapshot = await getDocs(qFarinhas);
          setFarinhasDisponiveis(
            farinhasSnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Farinha),
            ),
          );
        } catch (error) {
          console.error('Erro ao buscar farinhas:', error);
          toast.error('Não foi possível carregar as farinhas.');
        }
      }
    };
    fetchFarinhas();
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (vendaToEdit) {
        form.reset({
          padariaId: vendaToEdit.padariaId,
          data: vendaToEdit.data.toDate(),
          itens: vendaToEdit.itens,
        });
      } else {
        form.reset({
          padariaId: '',
          data: new Date(),
          itens: [
            {
              farinha: '',
              quantidade: 1,
              precoUnitario: 0,
              comissaoPercentual: 0,
            },
          ],
        });
      }
    }
  }, [vendaToEdit, isOpen, form]);

  const isEditMode = !!vendaToEdit;

  const watchedItens = useWatch({
    control: form.control,
    name: 'itens',
  });

  const totalVenda = (watchedItens ?? []).reduce((acc, item) => {
    const preco = Number(item.precoUnitario) || 0;
    const qtd = Number(item.quantidade) || 0;
    return acc + preco * qtd;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Venda' : ' Nova Venda'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Altere os dados da comanda abaixo.'
              : 'Selecione a padaria e adicione os itens da venda.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4">
          <Form {...form}>
            <form
              id="venda-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* 1. Grid de Padaria/Data ajustado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="padariaId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Padaria / Cliente</FormLabel>
                      <FormControl>
                        <Combobox
                          placeholder="Selecione uma padaria"
                          emptyMessage="Nenhuma padaria encontrada."
                          options={padarias.map((p) => ({
                            value: p.id,
                            label: p.nome,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Venda</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(e.target.valueAsDate ?? new Date())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    <h4 className="font-semibold">Item {index + 1}</h4>
                    <FormField
                      control={form.control}
                      name={`itens.${index}.farinha`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farinha</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma farinha" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {farinhasDisponiveis.map((farinha) => (
                                <SelectItem
                                  key={farinha.id}
                                  value={farinha.nome}
                                >
                                  {farinha.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* 2. Grid dos detalhes do item ajustado */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.quantidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`itens.${index}.precoUnitario`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Unit. (R$)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`itens.${index}.comissaoPercentual`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comissão (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  append({
                    farinha: '',
                    quantidade: 1,
                    precoUnitario: 0,
                    comissaoPercentual: 0,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar outro item
              </Button>
            </form>
          </Form>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
          <div className="flex-grow text-lg font-semibold">
            Total da Venda: {formatCurrency(totalVenda)}
          </div>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="venda-form">
            {isEditMode ? 'Salvar Alterações' : 'Finalizar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
