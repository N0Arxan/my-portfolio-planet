<script setup lang="ts">
import { ref } from 'vue';
import { X, Check, AlertCircle } from 'lucide-vue-next';

const emit = defineEmits(['close']);

const form = ref({
    name: '',
    email: '',
    message: '',
    honey_pot_field: '', // Hidden honeypot
});

const processing = ref(false);
const errors = ref<Record<string, string>>({});
const successMessage = ref('');
const generalError = ref('');

// Character counters
const nameLength = ref(0);
const emailLength = ref(0);
const messageLength = ref(0);

const MAX_LENGTHS = {
    name: 100,
    email: 255,
    message: 2000
};

function updateCharCount(field: 'name' | 'email' | 'message') {
    if (field === 'name') nameLength.value = form.value.name.length;
    if (field === 'email') emailLength.value = form.value.email.length;
    if (field === 'message') messageLength.value = form.value.message.length;
}

async function submit() {
    processing.value = true;
    errors.value = {};
    successMessage.value = '';
    generalError.value = '';

    try {
        const response = await $fetch<{ success: boolean; message?: string }>('/api/contact', {
            method: 'POST',
            body: form.value
        });
        
        // Success
        successMessage.value = response.message || 'Your message has been sent successfully!';
        
        // Clear form after 2 seconds and close modal
        setTimeout(() => {
            form.value = { name: '', email: '', message: '', honey_pot_field: '' };
            nameLength.value = 0;
            emailLength.value = 0;
            messageLength.value = 0;
            emit('close');
        }, 2000);
        
    } catch (e: any) {
        if (e.statusCode === 429) {
            generalError.value = e.message || 'Too many requests. Please try again later.';
        } else if (e.statusCode === 422 && e.data?.errors) {
            errors.value = e.data.errors;
        } else {
            generalError.value = e.message || 'An error occurred. Please try again.';
        }
    } finally {
        processing.value = false;
    }
}
</script>

<template>
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-scale-in max-h-[90vh] overflow-y-auto">
            <button @click="$emit('close')" class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
                <X :size="20" />
            </button>

            <h2 class="text-2xl font-thin text-white mb-6 text-center pr-8">Contact</h2>

            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-start gap-3">
                <Check :size="20" class="text-green-400 flex-shrink-0 mt-0.5" />
                <p class="text-green-100 text-sm">{{ successMessage }}</p>
            </div>

            <!-- General Error Message -->
            <div v-if="generalError" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle :size="20" class="text-red-400 flex-shrink-0 mt-0.5" />
                <p class="text-red-100 text-sm">{{ generalError }}</p>
            </div>

            <form @submit.prevent="submit" class="space-y-4">
                <!-- Honeypot (Hidden) -->
                <input v-model="form.honey_pot_field" type="text" class="opacity-0 absolute -z-10" tabindex="-1" autocomplete="off" aria-hidden="true">

                <!-- Name Field -->
                <div>
                    <div class="relative">
                        <input 
                            v-model="form.name" 
                            type="text" 
                            placeholder="Name" 
                            :maxlength="MAX_LENGTHS.name"
                            @input="updateCharCount('name')"
                            class="w-full px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                            :class="{ 'border-red-500/50': errors.name }"
                            required
                        >
                        <span v-if="nameLength > 0" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                            {{ nameLength }}/{{ MAX_LENGTHS.name }}
                        </span>
                    </div>
                    <div v-if="errors.name" class="text-red-400 text-xs mt-1.5 ml-2 flex items-center gap-1">
                        <AlertCircle :size="12" />
                        {{ errors.name }}
                    </div>
                </div>

                <!-- Email Field -->
                <div>
                    <div class="relative">
                        <input 
                            v-model="form.email" 
                            type="email" 
                            placeholder="Email" 
                            :maxlength="MAX_LENGTHS.email"
                            @input="updateCharCount('email')"
                            class="w-full px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                            :class="{ 'border-red-500/50': errors.email }"
                            required
                        >
                        <span v-if="emailLength > 0" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                            {{ emailLength }}/{{ MAX_LENGTHS.email }}
                        </span>
                    </div>
                    <div v-if="errors.email" class="text-red-400 text-xs mt-1.5 ml-2 flex items-center gap-1">
                        <AlertCircle :size="12" />
                        {{ errors.email }}
                    </div>
                </div>

                <!-- Message Field -->
                <div>
                    <div class="relative">
                        <textarea 
                            v-model="form.message" 
                            placeholder="Message (minimum 10 characters)" 
                            rows="4"
                            :maxlength="MAX_LENGTHS.message"
                            @input="updateCharCount('message')"
                            class="w-full px-4 sm:px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all resize-none"
                            :class="{ 'border-red-500/50': errors.message }"
                            required
                        ></textarea>
                        <span v-if="messageLength > 0" class="absolute right-3 bottom-3 text-xs text-white/30">
                            {{ messageLength }}/{{ MAX_LENGTHS.message }}
                        </span>
                    </div>
                    <div v-if="errors.message" class="text-red-400 text-xs mt-1.5 ml-2 flex items-center gap-1">
                        <AlertCircle :size="12" />
                        {{ errors.message }}
                    </div>
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit" 
                    :disabled="processing || !!successMessage" 
                    class="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                    <span v-if="processing" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </span>
                    <span v-else-if="successMessage" class="flex items-center justify-center gap-2">
                        <Check :size="16" />
                        Sent!
                    </span>
                    <span v-else>Send Message</span>
                </button>

                <!-- Privacy Notice -->
                <p class="text-xs text-white/40 text-center mt-4">
                    Your information is protected and will never be shared.
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Smooth scrolling for mobile */
.overflow-y-auto {
    -webkit-overflow-scrolling: touch;
}

/* Better touch targets for mobile */
button, input, textarea {
    -webkit-tap-highlight-color: transparent;
}

/* Animation */
@keyframes scale-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-scale-in {
    animation: scale-in 0.2s ease-out;
}
</style>
