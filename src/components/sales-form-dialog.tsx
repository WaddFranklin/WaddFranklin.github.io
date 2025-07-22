'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Venda, VendaFormValues, vendaSchema } from '@/lib/types';

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
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle } from 'lucide-react';

const farinhasDisponiveis = [
  'Vó zane extra clara 0000',
  'Vó zane panificação premium',
  'Pré-mistura Vó zane extra clara 0000',
  'Hermann pães especiais',
];

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
}

export function SalesFormDialog({
  isOpen,
  setIsOpen,
  vendaToEdit,
  onSubmit,
}: SalesFormDialogProps) {
  const form = useForm<VendaFormValues>({
    resolver: zodResolver(vendaSchema), // Removido o 'as any'
    defaultValues: {
      cliente: '',
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
    if (isOpen) {
      if (vendaToEdit) {
        form.reset({
          cliente: vendaToEdit.cliente,
          data: vendaToEdit.data.toDate(),
          itens: vendaToEdit.itens,
        });
      } else {
        form.reset({
          cliente: '',
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

  const totalVenda = watchedItens.reduce((acc, item) => {
    const preco = item.precoUnitario || 0;
    const qtd = item.quantidade || 0;
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
              : 'Preencha os dados do cliente e adicione os itens da venda.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4">
          <Form {...form}>
            <form
              id="venda-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Padaria do Zé" {...field} />
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
                          onChange={(e) => field.onChange(e.target.valueAsDate)}
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
                                <SelectItem key={farinha} value={farinha}>
                                  {farinha}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
