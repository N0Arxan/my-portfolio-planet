<script setup lang="ts">
import { ref } from 'vue';
import TheHeader from '~/components/TheHeader.vue';
import TheDock from '~/components/TheDock.vue';
import ContactModal from '~/components/ContactModal.vue';
import TheGlobe from '~/components/TheGlobe.vue';

const showContact = ref(false);
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
    <!-- Background / Globe -->
    <ClientOnly>
      <TheGlobe />
    </ClientOnly>

    <!-- UI Overlay -->
    <TheHeader />

    <TheDock @open-contact="showContact = true" />

    <!-- Modals -->
    <Transition name="fade">
      <ContactModal v-if="showContact" @close="showContact = false" />
    </Transition>
  </div>
</template>

<style>
/* Global transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
