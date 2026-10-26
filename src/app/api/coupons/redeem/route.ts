import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Registers one use of a coupon. Fails if it is inactive, expired or out of uses.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== 'string' || code.trim() === '') {
      return NextResponse.json({ error: 'Código do cupom é obrigatório.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Atomic increment so concurrent uses can't exceed the limit
    const result = await prisma.coupon.updateMany({
      where: {
        code: cleanCode,
        isActive: true,
        expiresAt: { gt: new Date() },
        OR: [
          { maxUses: null },
          { usedCount: { lt: prisma.coupon.fields.maxUses } },
        ],
      },
      data: { usedCount: { increment: 1 } },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Cupom inválido, expirado ou esgotado.' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    return NextResponse.json({ error: 'Erro ao usar cupom de desconto.' }, { status: 500 });
  }
}
