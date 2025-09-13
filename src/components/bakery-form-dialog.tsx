// src/components/bakery-form-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Padaria, padariaSchema, PadariaFormValues } from '@/lib/types';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios';
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
import { Input } from '@/components/ui/input';
import { Separator } from './ui/separator';
import { Trash2, PlusCircle, LoaderCircle } from 'lucide-react';

interface BakeryFormDialogProps {
  padariaToEdit?: Padaria | null;
  onSubmit: (values: PadariaFormValues) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function BakeryFormDialog({
  isOpen,
  setIsOpen,
  padariaToEdit,
  onSubmit,
}: BakeryFormDialogProps) {
  const { user } = useAuth();
  const [isCepLoading, setIsCepLoading] = useState(false);

  const form = useForm<PadariaFormValues>({
    resolver: zodResolver(padariaSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      numero: '',
      bairro: '',
      cep: '',
      cpf: '',
      cnpj: '',
      telefone: '',
      clientes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'clientes',
  });

  const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const cep = event.target.value.replace(/\D/g, '');

    if (cep.length !== 8) {
      return;
    }

    setIsCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

      if (data.erro) {
        toast.error('CEP não encontrado.');
        form.setValue('endereco', '');
        form.setValue('bairro', '');
        return;
      }

      form.setValue('endereco', data.logradouro, { shouldValidate: true });
      form.setValue('bairro', data.bairro, { shouldValidate: true });
    } catch (error) {
      toast.error('Não foi possível consultar o CEP.');
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsCepLoading(false);
    }
  };

  useEffect(() => {
    const fetchClientes = async (padariaId: string) => {
      if (!user) return [];
      const clientesCol = collection(db, 'clientes');
      const q = query(
        clientesCol,
        where('padariaId', '==', padariaId),
        where('userId', '==', user.uid),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    if (isOpen) {
      if (padariaToEdit) {
        fetchClientes(padariaToEdit.id).then((clientes) => {
          form.reset({
            ...padariaToEdit,
            clientes: clientes.length > 0 ? clientes : [],
          });
        });
      } else {
        form.reset({
          nome: '',
          endereco: '',
          numero: '',
          bairro: '',
          cep: '',
          cpf: '',
          cnpj: '',
          telefone: '',
          clientes: [],
        });
      }
    }
  }, [padariaToEdit, isOpen, form, user]);

  const isEditMode = !!padariaToEdit;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Padaria' : 'Nova Padaria'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da padaria e adicione os clientes/proprietários.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4">
          <Form {...form}>
            <form
              id="bakery-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                name="nome"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Padaria/Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Padaria do Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 1. Grid de CPF/CNPJ ajustado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="cpf"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="000.000.000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="cnpj"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="telefone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Telefone{' '}
                      <span className="text-muted-foreground">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="(82) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 2. Grid de Endereço ajustado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  name="cep"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onBlur={handleCepBlur}
                          />
                          {isCepLoading && (
                            <LoaderCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="endereco"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* 3. Grid de Número/Bairro ajustado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="numero"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número{' '}
                        <span className="text-muted-foreground">
                          (Opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="bairro"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Contatos Adicionais (Opcional)
                </h3>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    {/* 4. Grid de Contatos Adicionais ajustado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name={`clientes.${index}.nome`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Contato</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name={`clientes.${index}.telefone`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Telefone do Contato{' '}
                              <span className="text-muted-foreground">
                                (Opcional)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="(82) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ nome: '', telefone: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar outro contato
              </Button>
            </form>
          </Form>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="bakery-form">
            {isEditMode ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
