// src/components/flour-actions.tsx
'use client';

import { Farinha } from '@/lib/types';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/client';
import { doc, deleteDoc } from 'firebase/firestore';

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

interface FlourActionsProps {
  farinha: Farinha;
  onEdit: () => void;
  onDataChange: () => void;
}

export function FlourActions({
  farinha,
  onEdit,
  onDataChange,
}: FlourActionsProps) {
  const handleDelete = async () => {
    try {
      const farinhaRef = doc(db, 'farinhas', farinha.id);
      await deleteDoc(farinhaRef);

      toast.success('Farinha excluída com sucesso!');
      onDataChange();
    } catch (error) {
      toast.error('Erro ao excluir a farinha.');
      console.error(error);
    }
  };

  return (
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
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente o
            tipo de farinha{' '}
            <span className="font-semibold">{farinha.nome}</span>.
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
  );
}