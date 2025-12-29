export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  let url = "";

  if (query.type === "province") {
    url = `${config.komerceUrl}/destination/province`;
  } else if (query.type === "city") {
    url = `${config.komerceUrl}/destination/city/${query.id}`;
  } else if (query.type === "subdistrict" || query.type === "district") {
    url = `${config.komerceUrl}/destination/district/${query.id}`;
  }

  if (!url) {
    throw createError({
      statusCode: 400,
      message: `Tipe lokasi tidak valid: ${query.type}`,
    });
  }

  try {
    const response: any = await $fetch(url, {
      method: "GET",
      headers: {
        key: config.komerceApiKey,
        accept: "application/json",
      },
    });

    return response.data || response;
  } catch (error: any) {
    throw createError({ statusCode: 500, message: "Gagal mengambil data lokasi" });
  }
});
