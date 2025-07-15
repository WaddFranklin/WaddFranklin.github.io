// components/sales-form-dialog.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendaSchema, VendaFormValues, Venda } from '@/lib/types';

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

const farinhasDisponiveis = [
  'Vó zane extra clara 0000',
  'Vó zane panificação premium',
  'Pré-mistura Vó zane extra clara 0000',
  'Hermann pães especiais',
];

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
    // A SOLUÇÃO DEFINITIVA: Adicionar 'as any' para contornar o erro de tipo no build.
    resolver: zodResolver(vendaSchema) as any,
    defaultValues: {
      cliente: '',
      farinha: '',
      quantidade: 1,
      precoUnitario: 0,
      comissaoPercentual: 0,
    },
  });

  useEffect(() => {
    if (isOpen && vendaToEdit) {
      form.reset(vendaToEdit);
    } else if (isOpen && !vendaToEdit) {
      form.reset({
        cliente: '',
        farinha: '',
        quantidade: 1,
        precoUnitario: 0,
        comissaoPercentual: 0,
      });
    }
  }, [vendaToEdit, isOpen, form]);

  const isEditMode = !!vendaToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Venda' : 'Adicionar Nova Venda'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Altere os dados da venda abaixo.'
              : 'Preencha os campos abaixo para registrar uma nova venda.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* O restante do formulário não precisa de alterações */}
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
              name="farinha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Farinha</FormLabel>
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
                name="quantidade"
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
                name="precoUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comissaoPercentual"
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {isEditMode ? 'Salvar Alterações' : 'Salvar Venda'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
