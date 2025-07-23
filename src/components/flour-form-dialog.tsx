// src/components/flour-form-dialog.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Farinha, FarinhaFormValues, farinhaSchema } from '@/lib/types';

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
import { Input } from '@/components/ui/input';

interface FlourFormDialogProps {
  farinhaToEdit?: Farinha | null;
  onSubmit: (values: FarinhaFormValues) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function FlourFormDialog({
  isOpen,
  setIsOpen,
  farinhaToEdit,
  onSubmit,
}: FlourFormDialogProps) {
  const form = useForm<FarinhaFormValues>({
    resolver: zodResolver(farinhaSchema),
    defaultValues: {
      nome: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (farinhaToEdit) {
        form.reset({
          nome: farinhaToEdit.nome,
        });
      } else {
        form.reset({
          nome: '',
        });
      }
    }
  }, [farinhaToEdit, isOpen, form]);

  const isEditMode = !!farinhaToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Farinha' : 'Nova Farinha'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Altere o nome da farinha.'
              : 'Preencha o nome da nova farinha.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="flour-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Farinha</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Vó Zane Panificação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="flour-form">
            {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}