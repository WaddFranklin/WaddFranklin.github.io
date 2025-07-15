// components/sales-table.tsx
'use client';

import { useState } from 'react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { SalesActions } from './sales-actions';

interface SalesTableProps {
  data: Venda[];
  onEdit: (venda: Venda) => void;
}

// Função para formatar datas
const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Função para formatar valores como moeda brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function SalesTable({ data, onEdit }: SalesTableProps) {
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const totalGeralVendas = data.reduce(
    (acc, venda) => acc + venda.totalVenda,
    0,
  );
  const totalGeralComissao = data.reduce(
    (acc, venda) => acc + venda.totalComissao,
    0,
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]"></TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead className="text-right">Comissão Total</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((venda) => (
              <Collapsible
                asChild
                key={venda.id}
                open={openRowId === venda.id}
                onOpenChange={() =>
                  setOpenRowId(openRowId === venda.id ? null : venda.id)
                }
              >
                <>
                  <TableRow className="cursor-pointer">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openRowId === venda.id ? 'rotate-180' : ''
                            }`}
                          />
                          <span className="sr-only">Detalhes</span>
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>{formatDate(venda.data)}</TableCell>
                    <TableCell className="font-medium">
                      {venda.cliente}
                    </TableCell>
                    <TableCell className="text-right">
                      {venda.itens.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(venda.totalComissao)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(venda.totalVenda)}
                    </TableCell>
                    <TableCell className="text-center">
                      <SalesActions
                        venda={venda}
                        onEdit={() => onEdit(venda)}
                      />
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <tr className="bg-muted/50">
                      <TableCell colSpan={7} className="p-0">
                        <div className="p-4">
                          <h4 className="font-semibold mb-2">
                            Itens da Venda:
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Farinha</TableHead>
                                <TableHead className="text-right">
                                  Qtd.
                                </TableHead>
                                <TableHead className="text-right">
                                  Preço Unit.
                                </TableHead>
                                <TableHead className="text-right">
                                  Comissão
                                </TableHead>
                                <TableHead className="text-right">
                                  Subtotal
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {venda.itens.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.farinha}</TableCell>
                                  <TableCell className="text-right">
                                    {item.quantidade}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(item.precoUnitario)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.comissaoPercentual}%
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(
                                      item.quantidade * item.precoUnitario,
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhuma venda registrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="font-bold text-lg">
              TOTAIS GERAIS
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(totalGeralComissao)}
            </TableCell>
            <TableCell className="text-right font-bold text-lg">
              {formatCurrency(totalGeralVendas)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
