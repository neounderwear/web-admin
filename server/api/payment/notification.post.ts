// Pastikan Anda sudah setup firebase-admin di server side (nitro plugin)
// ATAU gunakan REST API Firestore jika tidak ingin setup admin SDK.
// Agar simpel, kita asumsikan logic update DB ada di sini.
// Karena setup firebase-admin di Nitro agak panjang,
// untuk tutorial ini saya gunakan fetch ke Firestore REST API atau mock logic.
// TAPI, solusi terbaik adalah menggunakan `firebase-admin`.

// Setup Firebase Admin (Hanya jalan di server)
// Anda butuh serviceAccountKey.json dari Firebase Console -> Project Settings -> Service Accounts
// Simpan json itu di root project (jangan commit ke git) atau taruh di ENV variable.
// Untuk sementara, saya tulis kerangkanya.

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Logika Verifikasi Signature Midtrans (Sebaiknya dilakukan untuk keamanan)
    // ...

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    console.log(`🔔 Webhook Received for ${orderId}: ${transactionStatus}`);

    let newStatus = "";

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
            newStatus = 'pending_payment'; // Challenge
        } else if (fraudStatus == 'accept') {
            newStatus = 'payment_verified'; // Sukses CC
        }
    } else if (transactionStatus == 'settlement') {
        newStatus = 'payment_verified'; // Sukses VA/QRIS/Ewallet
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        newStatus = 'cancelled';
    } else if (transactionStatus == 'pending') {
        newStatus = 'pending_payment';
    }

    if (newStatus) {
        // TODO: Update status di Firestore
        // Karena kita di server route, kita tidak bisa pakai 'useNuxtApp().$firestore' (Client SDK).
        // Kita harus pakai Firebase Admin SDK atau Client SDK versi Node.
        // Untuk simplifikasi sekarang, kita anggap status diupdate.

        // JIKA Anda deploy ke Firebase Functions, logic ini mudah.
        // JIKA deploy ke Node server biasa, harus setup Admin SDK.

        // (Code update firestore di server side di sini)
        // const db = getFirestore();
        // await db.collection('orders').doc(orderId).update({ status: newStatus, updatedAt: new Date() });
    }

    return {status: 'ok'};
});