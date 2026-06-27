import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    // 1. Mercado Pago envía parámetros en la URL de la notificación
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || searchParams.get('type');
    const id = searchParams.get('id') || searchParams.get('data.id');

    console.log(`🔔 WEBHOOK RECIBIDO - Topic: ${topic}, ID: ${id}`);

    // 2. Solo nos interesan las notificaciones de pagos
    if (topic === 'payment' && id) {
      const payment = new Payment(client);
      
      // Consultamos a Mercado Pago de forma segura para validar el estado real del pago
      const paymentData = await payment.get({ id: String(id) });
      
      const status = paymentData.status;
      const orderItems = paymentData.additional_info?.items || [];

      console.log(`💳 Estado del pago ${id}: ${status}`);

      if (status === 'approved') {
        console.log('✅ ¡Pago aprobado! Iniciando actualización de stock...');

        // 3. Recorremos los productos vendidos para descontar stock en Payload CMS
        for (const item of orderItems) {
          const productId = item.id;
          const quantitySold = Number(item.quantity);

          console.log(`📦 Descontando ${quantitySold} unidades del producto ID: ${productId}`);

          // NOTA: Aquí conectamos con la API interna de tu Payload CMS para restar stock.
          // Hacemos un fetch PATCH a tu colección de productos.
          try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
            
            // Primero obtenemos el producto actual para saber cuánto stock tiene
            const productRes = await fetch(`${serverUrl}/api/products/${productId}`);
            if (productRes.ok) {
              const product = await productRes.json();
              
              // Calculamos el nuevo stock (asegurándonos de no ir a negativo)
              const currentStock = Number(product.stock || 0);
              const newStock = Math.max(0, currentStock - quantitySold);

              // Actualizamos el stock en Payload
              await fetch(`${serverUrl}/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  // Si configuraste API Keys en Payload, irían acá
                },
                body: JSON.stringify({
                  stock: newStock,
                }),
              });
              
              console.log(`📉 Stock actualizado para ${product.title}. Antes: ${currentStock} | Ahora: ${newStock}`);
            }
          } catch (stockError) {
            console.error(`❌ Error al actualizar stock del producto ${productId}:`, stockError);
          }
        }
        
        // Aquí también podrías crear una colección "Orders" (Órdenes) en Payload 
        // para guardar los datos del comprador y el estado de la entrega.
      }
    }

    // Mercado Pago exige que respondamos con un HTTP 200 rápido para saber que recibimos el aviso
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('❌ Error crítico en el Webhook de MP:', error);
    // Aunque falle, devolvemos 200 o 500 controlado para que MP no se quede reintentando infinitamente
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}