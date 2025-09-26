// src/app/api/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

export async function POST(req: NextRequest) {
  try {
    // 1. Inicializa o cliente do Mercado Pago com o seu Access Token
    const client = new MercadoPagoConfig({
      accessToken: process.env.NEXT_PUBLIC_MERCADOPAGO_ACCESS_TOKEN!,
    });
    const preapproval = new PreApproval(client);

    // 2. Extrai os dados do usuário do corpo da requisição
    const { userEmail, userName } = await req.json();

    // 3. Define os detalhes do plano de assinatura
    const planData = {
      body: {
        reason: 'Assinatura Plano PRO',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transactions_amount: 30,
          currency_id: 'BRL',
        },
        back_url: `${req.nextUrl.origin}/`, // URL de retorno após sucesso
        payer_email: userEmail,
        payer_first_name: userName,
        status: 'pending',
      },
    };

    // 4. Cria o plano de assinatura no Mercado Pago
    const result = await preapproval.create(planData);

    // 5. Retorna a URL de checkout para o frontend
    if (result && result.init_point) {
      return NextResponse.json({ checkoutUrl: result.init_point });
    } else {
      console.error('Resposta inesperada da API do Mercado Pago:', result);
      return NextResponse.json(
        { error: 'Não foi possível criar a assinatura.' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: errorMessage },
      { status: 500 },
    );
  }
}
