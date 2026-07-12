import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Check expiry dynamically
    const now = new Date();
    const formattedCoupons = coupons.map(coupon => {
      const isExpired = new Date(coupon.expiresAt) < now;
      return {
        ...coupon,
        isExpired,
        status: coupon.isActive && !isExpired ? 'active' : 'expired',
      };
    });

    return NextResponse.json(formattedCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupons.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, discount, durationHours } = body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json({ error: 'Nome/Código do cupom é obrigatório.' }, { status: 400 });
    }

    if (!discount || typeof discount !== 'string' || discount.trim() === '') {
      return NextResponse.json({ error: 'Valor do desconto é obrigatório.' }, { status: 400 });
    }

    const hours = Number(durationHours);
    if (isNaN(hours) || hours <= 0) {
      return NextResponse.json({ error: 'Tempo ativo inválido.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: 'Já existe um cupom cadastrado com esse código.' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discount: discount.trim(),
        expiresAt,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Erro ao criar cupom de desconto.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: 'ID do cupom não fornecido.' }, { status: 400 });
    }

    const id = Number(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID do cupom inválido.' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Erro ao deletar cupom de desconto.' }, { status: 500 });
  }
}
