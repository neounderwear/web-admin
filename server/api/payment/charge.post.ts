import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event); 
  // body: { payment_type, bank, order_data: { items, grossAmount, customer, ... } }

  const isProd = config.midtransIsProduction === 'true';
  const apiUrl = isProd 
    ? "https://api.midtrans.com/v2/charge"
    : "https://api.sandbox.midtrans.com/v2/charge";

  const authString = Buffer.from(config.midtransServerKey + ":").toString("base64");

  // --- 1. MAPPING ITEM DETAILS (FIX VALIDATION ERROR) ---
  // Midtrans wajib punya properti: id, price, quantity, name
  
  const rawItems = body.order_data.items || [];
  const grossAmountTarget = Math.round(body.order_data.grossAmount);

  // Mapping array produk dari format Internal ke format Midtrans
  const itemDetails = rawItems.map((item: any) => ({
    id: (item.productId || item.id).substring(0, 50), // Limit ID 50 char
    price: Math.round(item.price),       // Wajib integer
    quantity: parseInt(item.quantity),
    name: (item.productName || item.name || 'Produk').substring(0, 50), // FIX: productName -> name
  }));

  // --- 2. HITUNG ONGKIR OTOMATIS ---
  // Midtrans akan error jika total item_details != gross_amount
  // Kita hitung selisihnya, selisih itu adalah Ongkir.
  
  const itemsTotal = itemDetails.reduce((acc: number, item: any) => {
    return acc + (item.price * item.quantity);
  }, 0);

  const shippingCost = grossAmountTarget - itemsTotal;

  // Jika ada selisih positif, masukkan sebagai item 'Biaya Pengiriman'
  if (shippingCost > 0) {
    itemDetails.push({
      id: "SHIPPING",
      price: shippingCost,
      quantity: 1,
      name: "Biaya Pengiriman"
    });
  }

  // --- 3. SUSUN PAYLOAD UTAMA ---
  const payload: any = {
    payment_type: body.payment_type,
    transaction_details: {
      order_id: body.order_data.orderId,
      gross_amount: grossAmountTarget, 
    },
    customer_details: body.order_data.customer,
    item_details: itemDetails, // Gunakan array yang sudah dimapping
  };

  // Konfigurasi Spesifik per Metode
  if (body.payment_type === 'bank_transfer') {
    payload.bank_transfer = { bank: body.bank };
  } else if (body.payment_type === 'qris') {
    payload.qris = { acquirer: 'gopay' };
  }

  // --- 4. KIRIM KE MIDTRANS ---
  try {
    console.log("--- MIDTRANS CHARGE DEBUG ---");
    console.log("Order ID:", body.order_data.orderId);
    console.log("Items Validated:", itemDetails.length);
    console.log("Total Amount:", grossAmountTarget);

    const response: any = await $fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: payload
    });

    return response; 

  } catch (error: any) {
    console.error("Midtrans Charge Error:", error.data);
    throw createError({ 
      statusCode: 500, 
      message: "Gagal memproses pembayaran ke Midtrans", 
      data: error.data 
    });
  }
});