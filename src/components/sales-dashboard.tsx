// components/sales-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { Venda, VendaFormValues } from '@/lib/types';
import { toast } from 'sonner';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';

export function SalesDashboard() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, 'vendas'),
      where('userId', '==', user.uid),
      orderBy('data', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const vendasData: Venda[] = [];
      querySnapshot.forEach((doc) => {
        vendasData.push({ id: doc.id, ...doc.data() } as Venda);
      });
      setVendas(vendasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOpenEditDialog = (venda: Venda) => {
    setVendaToEdit(venda);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendaToEdit(null);
    setIsFormOpen(true);
  };

  const calculateTotals = (items: VendaFormValues['itens']) => {
    const totalVenda = items.reduce(
      (acc, item) => acc + item.quantidade * item.precoUnitario,
      0,
    );
    const totalComissao = items.reduce((acc, item) => {
      const itemTotal = item.quantidade * item.precoUnitario;
      return acc + itemTotal * (item.comissaoPercentual / 100);
    }, 0);
    return { totalVenda, totalComissao };
  };

  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    const { totalVenda, totalComissao } = calculateTotals(values.itens);

    // Prepara o objeto de dados para salvar, convertendo a data para string ISO
    const firestoreData = {
      cliente: values.cliente,
      data: values.data.toISOString(), // Garante que a data do formulário seja usada
      itens: values.itens,
      totalVenda,
      totalComissao,
    };

    if (vendaToEdit) {
      // ATUALIZAR VENDA
      const vendaRef = doc(db, 'vendas', vendaToEdit.id);
      const promise = updateDoc(vendaRef, firestoreData);
      toast.promise(promise, {
        loading: 'Atualizando venda...',
        success: 'Venda atualizada com sucesso!',
        error: 'Erro ao atualizar a venda.',
      });
    } else {
      // ADICIONAR NOVA VENDA
      const promise = addDoc(collection(db, 'vendas'), {
        ...firestoreData,
        userId: user.uid,
      });
      toast.promise(promise, {
        loading: 'Salvando venda...',
        success: 'Venda adicionada com sucesso!',
        error: 'Não foi possível adicionar a venda.',
      });
    }
    setIsFormOpen(false);
  };

  if (loading) {
    return <p>Carregando vendas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAddDialog}>Registrar Venda</Button>
      </div>

      <SalesFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        vendaToEdit={vendaToEdit}
      />

      <SalesTable data={vendas} onEdit={handleOpenEditDialog} />
    </div>
  );
}
