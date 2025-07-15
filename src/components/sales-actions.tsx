// components/sales-actions.tsx
'use client';

import { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Venda, VendaFormValues } from '@/lib/types';
import { toast } from 'sonner';

// Importando os ícones que vamos usar
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SalesFormDialog } from './sales-form-dialog';

interface SalesActionsProps {
  venda: Venda;
}

export function SalesActions({ venda }: SalesActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    const promise = deleteDoc(doc(db, 'vendas', venda.id));
    toast.promise(promise, {
      loading: 'Excluindo venda...',
      success: 'Venda excluída com sucesso!',
      error: 'Erro ao excluir a venda.',
    });
  };

  const handleUpdate = async (values: VendaFormValues) => {
    const totalVenda = values.quantidade * values.precoUnitario;
    const vendaRef = doc(db, 'vendas', venda.id);

    const promise = updateDoc(vendaRef, {
      ...values,
      totalVenda,
    });

    toast.promise(promise, {
      loading: 'Atualizando venda...',
      success: () => {
        setIsEditDialogOpen(false);
        return 'Venda atualizada com sucesso!';
      },
      error: 'Erro ao atualizar a venda.',
    });
  };

  return (
    <>
      {/* Dialog de Edição */}
      <SalesFormDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        vendaToEdit={venda}
        onSubmit={handleUpdate}
      />

      {/* Dialog de Confirmação para Excluir */}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> {/* Ícone de Editar */}
              <span>Editar</span>
            </DropdownMenuItem>

            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> {/* Ícone de Excluir */}
                <span>Excluir</span>
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a
              venda do cliente{' '}
              <span className="font-semibold">{venda.cliente}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
