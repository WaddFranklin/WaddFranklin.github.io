// components/sales-table.tsx
'use client';

import { Venda } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SalesActions } from './sales-actions'; // Importa o novo componente

interface SalesTableProps {
  data: Venda[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function SalesTable({ data }: SalesTableProps) {
  const totalGeralVendas = data.reduce(
    (acc, venda) => acc + venda.totalVenda,
    0,
  );
  const totalGeralComissao = data.reduce((acc, venda) => {
    const comissao = venda.totalVenda * (venda.comissaoPercentual / 100);
    return acc + comissao;
  }, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Farinha</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="text-right">Preço Unit.</TableHead>
            <TableHead className="text-right">Total Venda</TableHead>
            <TableHead className="text-right">Comissão</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((venda) => {
              const valorComissao =
                venda.totalVenda * (venda.comissaoPercentual / 100);
              return (
                <TableRow key={venda.id}>
                  <TableCell>{venda.data}</TableCell>
                  <TableCell className="font-medium">{venda.cliente}</TableCell>
                  <TableCell>{venda.farinha}</TableCell>
                  <TableCell className="text-right">
                    {venda.quantidade}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(venda.precoUnitario)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(venda.totalVenda)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(valorComissao)}
                  </TableCell>
                  <TableCell className="text-center">
                    {/* Substitui os botões por nosso componente de ações */}
                    <SalesActions venda={venda} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhuma venda registrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="font-bold text-lg">
              TOTAIS
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(totalGeralVendas)}
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(totalGeralComissao)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
