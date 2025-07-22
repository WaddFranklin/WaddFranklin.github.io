// src/components/sales-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Venda, VendaFormValues } from '@/lib/types';
import { toast } from 'sonner';

// Importações do Firestore
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  // deleteDoc,
  doc,
  Timestamp,
  orderBy,
  // writeBatch,
} from 'firebase/firestore';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function SalesDashboard() {
  const { user } = useAuth(); // Agora só precisamos do 'user'
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);

  // Função para buscar as vendas do Firestore
  const fetchVendas = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Cria uma referência para a coleção 'vendas'
      const vendasCol = collection(db, 'vendas');
      // Cria uma query para buscar apenas as vendas do usuário logado, ordenadas pela data
      const q = query(
        vendasCol,
        where('userId', '==', user.uid),
        orderBy('data', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const vendasData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const { totalVenda, totalComissao } = data.itens.reduce(
          (acc: { totalVenda: number; totalComissao: number }, item: any) => {
            const subtotal = item.quantidade * item.precoUnitario;
            acc.totalVenda += subtotal;
            acc.totalComissao += subtotal * (item.comissaoPercentual / 100);
            return acc;
          },
          { totalVenda: 0, totalComissao: 0 },
        );

        return {
          id: doc.id,
          ...data,
          totalVenda,
          totalComissao,
        } as Venda;
      });

      setVendas(vendasData);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Não foi possível carregar as vendas.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVendas();
  }, [fetchVendas]);

  const handleOpenEditDialog = (venda: Venda) => {
    setVendaToEdit(venda);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendaToEdit(null);
    setIsFormOpen(true);
  };

  // Função para salvar (adicionar ou editar) uma venda no Firestore
  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    try {
      const vendaData = {
        cliente: values.cliente,
        // Converte a data para o formato Timestamp do Firestore
        data: Timestamp.fromDate(new Date(values.data)),
        itens: values.itens,
        userId: user.uid, // Armazena o ID do usuário que criou a venda
      };

      if (vendaToEdit) {
        // Atualiza um documento existente
        const vendaRef = doc(db, 'vendas', vendaToEdit.id);
        await updateDoc(vendaRef, vendaData);
        toast.success('Venda atualizada com sucesso!');
      } else {
        // Adiciona um novo documento
        const vendasCol = collection(db, 'vendas');
        await addDoc(vendasCol, vendaData);
        toast.success('Venda registrada com sucesso!');
      }

      fetchVendas(); // Recarrega os dados da tabela
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Ocorreu um erro ao salvar a venda.');
    } finally {
      setIsFormOpen(false);
    }
  };

  if (loading) {
    return <p>Carregando vendas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Venda
        </Button>
      </div>

      <SalesFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        vendaToEdit={vendaToEdit}
      />

      <SalesTable
        data={vendas}
        onEdit={handleOpenEditDialog}
        onDataChange={fetchVendas}
      />
    </div>
  );
}
