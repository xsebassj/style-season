import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializar cliente (Tu token debe estar en el .env.local como MP_ACCESS_TOKEN)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || "", 
  options: { timeout: 5000 } 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingCost, shippingName } = body;

    // Mapeamos los productos de la ropa
    const mercadopagoItems = items.map((item: any) => ({
      id: item.id,
      title: `${item.name} (Talle: ${item.size})`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "ARS",
      picture_url: item.image_url || "",
    }));

    // Si hay un costo de envío mayor a cero, lo agregamos como un producto extra al ticket
    if (shippingCost && Number(shippingCost) > 0) {
      mercadopagoItems.push({
        id: "ENVIO",
        title: `Envío: ${shippingName || 'Logística'}`,
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS"
      });
    }

    // Crear la preferencia
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mercadopagoItems,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
        },
        auto_return: "approved",
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error) {
    console.error("Error al crear preferencia MP:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}