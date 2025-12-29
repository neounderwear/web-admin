export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const baseUrl = config.komerceUrl.replace(/\/$/, "");
  const targetUrl = `${baseUrl}/calculate/district/domestic-cost`;

  const couriersToCheck = ["jne", "sicepat", "jnt", "ide", "anteraja", "pos"];

  const fetchCourierRate = async (courierCode: string) => {
    const params = new URLSearchParams();
    params.append("origin", String(config.originDistrictId).trim());
    params.append("destination", String(body.destination).trim());
    params.append("weight", String(body.weight));
    params.append("courier", courierCode);
    try {
      const response: any = await $fetch(targetUrl, {
        method: "POST",
        headers: {
          key: config.komerceApiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
      return response.data;
    } catch (err) {
      return null;
    }
  };

  try {
    const promises = couriersToCheck.map((c) => fetchCourierRate(c));
    const results = await Promise.all(promises);
    const combinedRates = results.filter((res) => res !== null).flat();
    return combinedRates;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Gagal menghitung ongkir global",
    });
  }
});
