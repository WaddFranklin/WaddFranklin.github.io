// src/components/bakery-form-dialog.tsx
'use client';

import { useEffect, useState } from 'react'; // 1. Importar useState
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Padaria, padariaSchema, PadariaFormValues } from '@/lib/types';
import { useAuth } from './auth-provider';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios'; // 2. Importar axios
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
import { Trash2, PlusCircle, LoaderCircle } from 'lucide-react'; // 3. Importar um ícone de loading

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
  // 4. Estado para controlar o loading da busca de CEP
  const [isCepLoading, setIsCepLoading] = useState(false);

  const form = useForm<PadariaFormValues>({
    resolver: zodResolver(padariaSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      bairro: '',
      cep: '',
      cnpj: '',
      telefone: '',
      clientes: [{ nome: '', telefone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'clientes',
  });

  // 5. Função para buscar o CEP
  const handleCepBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const cep = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length !== 8) {
      return; // Só busca se tiver 8 dígitos
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

      // Preenche os campos do formulário com os dados da API
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
            clientes:
              clientes.length > 0 ? clientes : [{ nome: '', telefone: '' }],
          });
        });
      } else {
        form.reset({
          nome: '',
          endereco: '',
          bairro: '',
          cep: '',
          cnpj: '',
          telefone: '',
          clientes: [{ nome: '', telefone: '' }],
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
                    <FormLabel>Nome da Padaria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Padaria do Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  name="telefone"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(82) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  name="cep"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CEP{' '}
                        <span className="text-muted-foreground">
                          (Opcional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {/* 6. Adicionamos o evento onBlur */}
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
                      <FormLabel>
                        Endereço{' '}
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
              </div>
              <FormField
                name="bairro"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Bairro{' '}
                      <span className="text-muted-foreground">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Clientes / Proprietários
                </h3>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4 relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        name={`clientes.${index}.nome`}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Cliente</FormLabel>
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
                              Telefone do Cliente{' '}
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
                onClick={() => append({ nome: '', telefone: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar outro cliente
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
