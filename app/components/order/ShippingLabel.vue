<script setup lang="ts">
import type { Order } from "~/types/order";

// Data Toko
const shopInfo = {
  name: "Gudang Pakaian Dalam",
  phone: "0812-1013-2385",
};

const props = defineProps<{
  order: Order;
}>();
</script>

<template>
  <div class="print-container">
    <div class="shipping-label">
      
      <div class="header-section">
        <div class="flex-1">
          <h1 class="courier-name">{{ order.shipping.courier }}</h1>
          <h2 class="service-name">{{ order.shipping.service }}</h2>
        </div>
        <div class="text-right">
          <p class="label-xs">No. Resi:</p>
          <p class="resi-number">{{ order.shipping.trackingNumber || 'NON-RESI' }}</p>
        </div>
      </div>

      <hr class="divider border-2 border-black" />

      <div class="address-grid">
        <div class="recipient-box">
          <p class="label-xs">KEPADA (PENERIMA):</p>
          <p class="name">{{ order.shipping.recipientName }}</p>
          <p class="phone">{{ order.shipping.recipientPhone }}</p>
          <p class="address">{{ order.shipping.fullAddress }}</p>
          <p class="address font-bold mt-1" v-if="order.shipping.cityId">
            {{ order.shipping.cityId }} (Kecamatan ID)
          </p>
        </div>

        <div class="sender-box">
          <p class="label-xs">DARI (PENGIRIM):</p>
          <p class="name">{{ shopInfo.name }}</p>
          <p class="phone">{{ shopInfo.phone }}</p>
        </div>
      </div>

      <hr class="divider dashed" />

      <div class="product-section">
        <p class="label-xs mb-1">ISI PAKET:</p>
        <ul class="product-list">
          <li v-for="(item, idx) in order.items" :key="idx">
            {{ item.quantity }}x {{ item.productName }} 
            <span v-if="item.variantName">({{ item.variantName }})</span>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <div class="flex justify-between items-end">
          <p class="weight">Berat: {{ (order.shipping.weightTotal / 1000).toFixed(2) }} Kg</p>
          <p class="print-meta">Dicetak: {{ new Date().toLocaleDateString('id-ID') }}</p>
        </div>
        <div v-if="order.notes" class="notes">
          Note: {{ order.notes }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Sembunyikan container di tampilan normal (layar) */
.print-container {
  display: none;
}

/* HANYA MUNCUL SAAT PRINT */
@media print {
  /* 1. Reset Halaman & Paksa Tampil */
  .print-container {
    display: block;
    position: fixed; /* Menimpa seluruh konten lain */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 99999; /* Pastikan di atas Sidebar/Header */
    padding: 0;
    margin: 0;
  }

  /* 2. Sembunyikan elemen bawaan browser/layout Nuxt lain */
  body > *:not(.print-container) {
    display: none !important;
  }

  /* 3. Setup Ukuran Kertas A6 (105mm x 148mm) - Standar Resi Thermal */
  @page {
    size: 100mm 150mm; 
    margin: 0; /* Hilangkan margin browser default */
  }

  /* 4. Styling Label */
  .shipping-label {
    width: 96mm; /* Sedikit lebih kecil dari kertas agar aman */
    height: 146mm;
    margin: 2mm;
    border: 2px solid #000;
    padding: 10px;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
    color: black;
    display: flex;
    flex-direction: column;
  }

  /* Typography & Layout */
  .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .courier-name { font-size: 24px; font-weight: 900; text-transform: uppercase; line-height: 1; }
  .service-name { font-size: 16px; font-weight: bold; margin-top: 4px; }
  .resi-number { font-size: 16px; font-family: monospace; font-weight: bold; letter-spacing: 1px; }
  
  .divider { margin: 10px 0; border-color: black; }
  .divider.dashed { border-style: dashed; border-width: 1px; }

  .label-xs { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 2px; }
  
  .address-grid { display: flex; flex-direction: column; gap: 15px; }
  .name { font-size: 14px; font-weight: bold; }
  .phone { font-size: 12px; }
  .address { font-size: 11px; line-height: 1.3; margin-top: 2px; }

  .product-section { flex: 1; overflow: hidden; }
  .product-list { font-size: 10px; padding-left: 12px; margin: 0; }
  
  .footer-section { margin-top: auto; padding-top: 10px; border-top: 2px solid black; }
  .weight { font-size: 12px; font-weight: bold; }
  .print-meta { font-size: 8px; font-style: italic; }
  .notes { font-size: 10px; font-weight: bold; margin-top: 5px; border: 1px dashed black; padding: 4px; }
}
</style>