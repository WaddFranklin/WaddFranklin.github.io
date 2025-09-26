// src/components/sales-dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-provider";
import { Venda, VendaFormValues, ItemVenda, Padaria } from "@/lib/types";
import { toast } from "sonner";

import { db } from "@/lib/firebase/client";
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
} from "firebase/firestore";

import { SalesTable } from "./sales-table";
import { SalesFormDialog } from "./sales-form-dialog";
import { Button } from "./ui/button";
import { Plus, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SalesDashboard() {
  const { user } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vendaToEdit, setVendaToEdit] = useState<Venda | null>(null);
  const [padarias, setPadarias] = useState<Padaria[]>([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  const fetchVendasEComplementos = useCallback(
    async (isRefreshing = false) => {
      if (!user) return;
      setLoading(true);

      try {
        const padariasCol = collection(db, "padarias");
        const qPadarias = query(padariasCol, where("userId", "==", user.uid));
        const padariasSnap = await getDocs(qPadarias);
        const padariasData = padariasSnap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Padaria)
        );
        setPadarias(padariasData);

        const inicioDoMes = Timestamp.fromDate(
          new Date(selectedYear, selectedMonth - 1, 1)
        );
        const fimDoMes = Timestamp.fromDate(
          new Date(selectedYear, selectedMonth, 0, 23, 59, 59)
        );

        const vendasCol = collection(db, "vendas");
        const qVendas = query(
          vendasCol,
          where("userId", "==", user.uid),
          where("data", ">=", inicioDoMes),
          where("data", "<=", fimDoMes),
          orderBy("data", "desc")
        );

        const vendasSnapshot = await getDocs(qVendas);
        const vendasData = vendasSnapshot.docs.map((doc) => {
          const data = doc.data();
          const { totalVenda, totalComissao } = data.itens.reduce(
            (
              acc: { totalVenda: number; totalComissao: number },
              item: ItemVenda
            ) => {
              const subtotal = item.quantidade * item.precoUnitario;
              acc.totalVenda += subtotal;
              acc.totalComissao += subtotal * (item.comissaoPercentual / 100);
              return acc;
            },
            { totalVenda: 0, totalComissao: 0 }
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
          toast.success("Dados atualizados!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    },
    [user, selectedMonth, selectedYear]
  );

  useEffect(() => {
    fetchVendasEComplementos();
  }, [fetchVendasEComplementos]);

  // --- INÍCIO DA CORREÇÃO: Funções adicionadas de volta ---
  const handleOpenEditDialog = (venda: Venda) => {
    setVendaToEdit(venda);
    setIsFormOpen(true);
  };

  const handleOpenAddDialog = () => {
    setVendaToEdit(null);
    setIsFormOpen(true);
  };
  // --- FIM DA CORREÇÃO ---

  const handleFormSubmit = async (values: VendaFormValues) => {
    if (!user) {
      toast.error("Você precisa estar logado.");
      return;
    }

    try {
      const padariaSelecionada = padarias.find(
        (p) => p.id === values.padariaId
      );
      if (!padariaSelecionada) {
        toast.error(
          "Padaria selecionada não foi encontrada. Tente atualizar a lista."
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
        const vendaRef = doc(db, "vendas", vendaToEdit.id);
        await updateDoc(vendaRef, vendaData);
        toast.success("Venda atualizada com sucesso!");
      } else {
        const vendasCol = collection(db, "vendas");
        await addDoc(vendasCol, vendaData);
        toast.success("Venda registrada com sucesso!");
      }

      fetchVendasEComplementos();
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
      toast.error("Ocorreu um erro ao salvar a venda.");
    } finally {
      setIsFormOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={String(mes.value)}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(selectedYear)}
            onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={String(ano)}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchVendasEComplementos(true)}
            disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Atualizar dados</span>
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Venda
          </Button>
        </div>
      </div>

      <SalesFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        vendaToEdit={vendaToEdit}
        padarias={padarias}
      />
      {loading ? (
        <p className="text-center py-10">Carregando vendas...</p>
      ) : (
        <SalesTable
          data={vendas}
          onEdit={handleOpenEditDialog}
          onDataChange={fetchVendasEComplementos}
        />
      )}
    </div>
  );
}
