<script setup lang="ts">
import { Github, Instagram, Mail, Linkedin } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['open-contact']);

// Mobile detection
const isMobile = ref(false);

function checkMobile() {
    isMobile.value = window.innerWidth < 768;
}

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
</script>

<template>
    <div class="fixed bottom-10 left-0 right-0 flex justify-center z-50">
        <div class="flex gap-3 md:gap-6 px-4 md:px-8 py-3 md:py-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300 hover:bg-black/40">
            <a href="https://github.com/N0Arxan" target="_blank" class="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 ease-out">
                <Github :size="isMobile ? 20 : 24" />
            </a>
            <a href="https://www.instagram.com/arshan.hz/" target="_blank" class="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 ease-out">
                <Instagram :size="isMobile ? 20 : 24" />
            </a>
            <a href="https://www.linkedin.com/in/arshan-hassanzadeh-93a3b1346/" target="_blank" class="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 ease-out">
                <Linkedin :size="isMobile ? 20 : 24" />
            </a>
            <button @click="$emit('open-contact')" class="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 ease-out">
                <Mail :size="isMobile ? 20 : 24" />
            </button>
        </div>
    </div>
</template>
