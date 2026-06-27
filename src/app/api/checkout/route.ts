import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const dynamic = 'force-dynamic'; 

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    console.log("🔥 INICIANDO CHECKOUT NUEVO..."); 
    
    const body = await request.json();
    const { cart } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const items = cart.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: `Talle: ${item.size}`,
      picture_url: item.image,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }));

    const preference = new Preference(client);

    const preferenceBody = {
      items,
      back_urls: {
        success: "http://localhost:3000/success",
        failure: "http://localhost:3000/carrito",
        pending: "http://localhost:3000/carrito",
      },
      // 👇 APAGAMOS ESTO TEMPORALMENTE POR RESTRICCIONES DE HTTP/LOCALHOST 👇
      // auto_return: "approved",
    };

    const result = await preference.create({
      body: preferenceBody
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error) {
    console.error('❌ Error al crear preferencia de MP:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}