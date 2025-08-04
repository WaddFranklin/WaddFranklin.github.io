// src/components/bakery-actions.tsx
"use client";

import { Padaria } from "@/lib/types";
import { toast } from "sonner";
import { db } from "@/lib/firebase/client";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "./auth-provider"; // 1. Importar o useAuth

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";

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
  const { user } = useAuth(); // 2. Obter o usuário logado

  const handleDelete = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para realizar esta ação.");
      return;
    }

    try {
      // 3. CORREÇÃO: A consulta agora filtra por padariaId E por userId
      const clientesQuery = query(
        collection(db, "clientes"),
        where("padariaId", "==", padaria.id),
        where("userId", "==", user.uid) // <-- Linha adicionada
      );
      const clientesSnapshot = await getDocs(clientesQuery);

      const batch = writeBatch(db);

      clientesSnapshot.forEach((clienteDoc) => {
        batch.delete(clienteDoc.ref);
      });

      const padariaRef = doc(db, "padarias", padaria.id);
      batch.delete(padariaRef);

      await batch.commit();

      toast.success(
        "Padaria e clientes associados foram excluídos com sucesso!"
      );
      onDataChange();
    } catch (error) {
      toast.error("Erro ao excluir a padaria.");
      console.error("Erro ao excluir:", error); // Log para mais detalhes
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
            className="bg-red-600 hover:bg-red-700">
            Sim, excluir tudo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
