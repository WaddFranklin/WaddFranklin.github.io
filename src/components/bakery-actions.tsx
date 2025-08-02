// src/components/bakery-actions.tsx
'use client';

import { Padaria } from '@/lib/types';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/client';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

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

interface BakeryActionsProps {
  padaria: Padaria;
  onEdit: () => void;
  onDataChange: () => void;
}

export function BakeryActions({
  padaria,
  onEdit,
  onDataChange,
}: BakeryActionsProps) {
  const handleDelete = async () => {
    try {
      // 1. Encontrar todos os clientes associados a esta padaria
      const clientesQuery = query(
        collection(db, 'clientes'),
        where('padariaId', '==', padaria.id),
      );
      const clientesSnapshot = await getDocs(clientesQuery);

      // 2. Usar um batch para deletar a padaria e todos os seus clientes
      const batch = writeBatch(db);

      // Adicionar os clientes ao batch para exclusão
      clientesSnapshot.forEach((clienteDoc) => {
        batch.delete(clienteDoc.ref);
      });

      // Adicionar a própria padaria ao batch para exclusão
      const padariaRef = doc(db, 'padarias', padaria.id);
      batch.delete(padariaRef);

      // 3. Executar o batch
      await batch.commit();

      toast.success(
        'Padaria e clientes associados foram excluídos com sucesso!',
      );
      onDataChange();
    } catch (error) {
      toast.error('Erro ao excluir a padaria.');
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
            Essa ação não pode ser desfeita. Isso excluirá permanentemente a
            padaria <span className="font-semibold">{padaria.nome}</span> e
            todos os seus clientes associados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Sim, excluir tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
