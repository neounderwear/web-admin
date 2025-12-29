export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const isProd = config.midtransIsProduction === "true";
  const apiUrl = isProd ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const authString = Buffer.from(config.midtransServerKey + ":").toString("base64");

  try {
    const itemDetails = body.items.map((item: any) => ({
      id: item.productId.substring(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.productName.substring(0, 50),
    }));

    if (body.shippingCost > 0) {
      itemDetails.push({
        id: "SHIPPING",
        price: Math.round(body.shippingCost),
        quantity: 1,
        name: "Biaya Pengiriman",
      });
    }

    const calculatedGrossAmount = itemDetails.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

    const payload = {
      transaction_details: {
        order_id: body.orderId,
        gross_amount: calculatedGrossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
      },
      credit_card: { secure: true },
      expiry: {
        unit: "minutes",
        duration: 60 * 2,
      },
    };

    const response: any = await $fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: payload,
    });

    return {
      token: response.token,
      redirect_url: response.redirect_url,
    };
  } catch (error: any) {
    console.error("Midtrans Error:", error.data || error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal generate token Midtrans",
      data: error.data,
    });
  }
});
