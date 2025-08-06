// src/components/sales-dashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
// 1. Remover 'Cliente' dos imports, pois não será mais usado aqui
import { Venda, VendaFormValues, ItemVenda, Padaria } from '@/lib/types';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export function SalesDashboard() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);

  // 2. Remover o estado 'clientes'
  const [padarias, setPadarias] = useState<Padaria[]>([]);

  const fetchVendasEComplementos = useCallback(
    async (isRefreshing = false) => {
      if (!user) return;
      setLoading(true);

      try {
        // 3. Remover toda a lógica de busca de Clientes

        // Busca de Padarias
        const padariasCol = collection(db, 'padarias');
        const qPadarias = query(padariasCol, where('userId', '==', user.uid));
        const padariasSnap = await getDocs(qPadarias);
        const padariasData = padariasSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Padaria),
        );
        setPadarias(padariasData);

        // Busca de Vendas
        const vendasCol = collection(db, 'vendas');
        const qVendas = query(
          vendasCol,
          where('userId', '==', user.uid),
          orderBy('data', 'desc'),
        );

        const vendasSnapshot = await getDocs(qVendas);
        const vendasData = vendasSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { totalVenda, totalComissao } = data.itens.reduce(
            (
              acc: { totalVenda: number; totalComissao: number },
              item: ItemVenda,
            ) => {
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

        if (isRefreshing) {
          toast.success('Dados atualizados!');
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchVendasEComplementos();
  }, [fetchVendasEComplementos]);

  const handleOpenEditDialog = (venda: Venda) => {
    setVendaToEdit(venda);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendaToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    try {
      // Esta lógica já estava correta, usando apenas a lista de padarias
      const padariaSelecionada = padarias.find(
        (p) => p.id === values.padariaId,
      );
      if (!padariaSelecionada) {
        toast.error(
          'Padaria selecionada não foi encontrada. Tente atualizar a lista.',
        );
        return;
      }

      const vendaData = {
        padariaId: values.padariaId,
        padariaNome: padariaSelecionada.nome,
        data: Timestamp.fromDate(values.data as Date),
        itens: values.itens,
        userId: user.uid,
      };

      if (vendaToEdit) {
        const vendaRef = doc(db, 'vendas', vendaToEdit.id);
        await updateDoc(vendaRef, vendaData);
        toast.success('Venda atualizada com sucesso!');
      } else {
        const vendasCol = collection(db, 'vendas');
        await addDoc(vendasCol, vendaData);
        toast.success('Venda registrada com sucesso!');
      }

      fetchVendasEComplementos();
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
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchVendasEComplementos(true)}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Atualizar dados</span>
        </Button>
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
        padarias={padarias}
        // 4. Remover a prop 'clientes' que não é mais necessária
      />

      <SalesTable
        data={vendas}
        onEdit={handleOpenEditDialog}
        onDataChange={fetchVendasEComplementos}
      />
    </div>
  );
}
