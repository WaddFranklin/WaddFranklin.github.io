'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { Venda, VendaFormValues } from '@/lib/types';
import { toast } from 'sonner';

import { SalesTable } from './sales-table';
import { SalesFormDialog } from './sales-form-dialog';
import { Button } from './ui/button';

export function SalesDashboard() {
  const { user, supabase } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);

  const fetchVendas = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('vendas')
      .select(`*, itens_venda (*)`)
      .order('data', { ascending: false });

    if (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Não foi possível carregar as vendas.');
      setVendas([]);
    } else if (data) {
      // CORREÇÃO: Removida a anotação de tipo (venda: VendaComItens).
      // TypeScript agora infere o tipo de 'venda' corretamente a partir de 'data'.
      const vendasFormatadas = data.map((venda) => {
        const itens = venda.itens_venda || [];

        const { totalVenda, totalComissao } = itens.reduce(
          (acc, item) => {
            const subtotal = item.quantidade * item.preco_unitario;
            acc.totalVenda += subtotal;
            acc.totalComissao += subtotal * (item.comissao_percentual / 100);
            return acc;
          },
          { totalVenda: 0, totalComissao: 0 },
        );

        return {
          id: venda.id,
          cliente: venda.cliente_nome,
          data: venda.data,
          itens: itens.map((item) => ({
            farinha: item.farinha,
            quantidade: item.quantidade,
            precoUnitario: Number(item.preco_unitario),
            comissaoPercentual: Number(item.comissao_percentual),
          })),
          totalVenda,
          totalComissao,
          userId: venda.user_id,
        };
      });
      setVendas(vendasFormatadas);
    }
    setLoading(false);
  }, [user, supabase]);

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

  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error('Você precisa estar logado.');
      return;
    }

    if (!vendaToEdit) {
      // ADICIONAR NOVA VENDA
      const { data: vendaData, error: vendaError } = await supabase
        .from('vendas')
        .insert({
          cliente_nome: values.cliente,
          data: values.data.toISOString(),
          user_id: user.id,
        })
        .select()
        .single();

      if (vendaError) {
        toast.error('Erro ao criar a venda.');
        console.error(vendaError);
        return;
      }

      const itensToInsert = values.itens.map((item) => ({
        venda_id: vendaData.id,
        user_id: user.id,
        farinha: item.farinha,
        quantidade: item.quantidade,
        preco_unitario: item.precoUnitario,
        comissao_percentual: item.comissaoPercentual,
      }));

      const { error: itensError } = await supabase
        .from('itens_venda')
        .insert(itensToInsert);

      if (itensError) {
        toast.error('Erro ao salvar os itens da venda.');
        console.error(itensError);
      } else {
        toast.success('Venda registrada com sucesso!');
        fetchVendas();
      }
    } else {
      // ATUALIZAR VENDA
      const { error } = await supabase
        .from('vendas')
        .update({
          cliente_nome: values.cliente,
          data: values.data.toISOString(),
        })
        .eq('id', vendaToEdit.id);

      if (error) {
        toast.error('Erro ao atualizar a venda.');
      } else {
        toast.success('Venda atualizada!');
        fetchVendas();
      }
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

      <SalesTable
        data={vendas}
        onEdit={handleOpenEditDialog}
        onDataChange={fetchVendas}
      />
    </div>
  );
}
