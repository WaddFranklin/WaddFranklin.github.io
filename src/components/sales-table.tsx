// src/components/sales-table.tsx
'use client';
import React from 'react';
import { useState } from 'react';
import { Venda } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { SalesActions } from './sales-actions';

interface SalesTableProps {
  data: Venda[];
  onEdit: (venda: Venda) => void;
  onDataChange: () => void;
}

const formatDate = (date: Date | Timestamp | string) => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function SalesTable({ data, onEdit, onDataChange }: SalesTableProps) {
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const totalGeralVendas = data.reduce(
    (acc, venda) => acc + (venda.totalVenda || 0),
    0,
  );
  const totalGeralComissao = data.reduce(
    (acc, venda) => acc + (venda.totalComissao || 0),
    0,
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Data</TableHead>
            {/* 1. SEPARAMOS AS COLUNAS AQUI */}
            <TableHead>Cliente</TableHead>
            <TableHead>Padaria</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead className="text-right">Comissão Total</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((venda) => (
              <React.Fragment key={venda.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setOpenRowId(openRowId === venda.id ? null : venda.id)
                      }
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openRowId === venda.id ? 'rotate-180' : ''
                        }`}
                      />
                      <span className="sr-only">Detalhes</span>
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(venda.data)}</TableCell>
                  {/* 2. EXIBIMOS OS DADOS EM CÉLULAS SEPARADAS */}
                  <TableCell className="font-medium">
                    {/* Agora não precisamos mais do 'any' */}
                    {venda.clienteNome
                      ? `${venda.clienteNome} (${venda.padariaNome})`
                      : venda.cliente}
                  </TableCell>
                  <TableCell>{venda.padariaNome || 'N/A'}</TableCell>
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
                    <div>
                      <SalesActions
                        venda={venda}
                        onEdit={() => onEdit(venda)}
                        onDataChange={onDataChange}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                {openRowId === venda.id && (
                  <TableRow className="bg-muted/50">
                    {/* 3. ATUALIZAMOS O COLSPAN PARA O NOVO TOTAL DE COLUNAS */}
                    <TableCell colSpan={8} className="p-0">
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">Itens da Venda:</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Farinha</TableHead>
                              <TableHead className="text-right">Qtd.</TableHead>
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
                  </TableRow>
                )}
              </React.Fragment>
            ))
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
