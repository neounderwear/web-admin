import {createError, defineEventHandler, readBody} from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    // body: { payment_type: 'bank_transfer', bank: 'bca', order_data: {...} }

    const isProd = config.midtransIsProduction === 'true';
    const apiUrl = isProd
        ? "https://api.midtrans.com/v2/charge"
        : "https://api.sandbox.midtrans.com/v2/charge";

    const authString = Buffer.from(config.midtransServerKey + ":").toString("base64");

    // Susun Payload Core API
    const payload: any = {
        payment_type: body.payment_type,
        transaction_details: {
            order_id: body.order_data.orderId,
            gross_amount: Math.round(body.order_data.grossAmount),
        },
        customer_details: body.order_data.customer,
        item_details: body.order_data.items, // Opsional di Core API, tapi bagus ada
    };

    // Konfigurasi Spesifik per Metode
    if (body.payment_type === 'bank_transfer') {
        payload.bank_transfer = {bank: body.bank};
    } else if (body.payment_type === 'qris') {
        payload.qris = {acquirer: 'gopay'};
    } else if (body.payment_type === 'echannel') {
        // Mandiri Bill
        payload.echannel = {bill_info1: 'Payment For:', bill_info2: 'Order'};
    }

    try {
        const response: any = await $fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`
            },
            body: payload
        });

        return response; // Mengembalikan VA number, QR URL, dll.

    } catch (error: any) {
        console.error("Midtrans Charge Error:", error.data);
        throw createError({statusCode: 500, message: "Gagal membuat pembayaran", data: error.data});
    }
});