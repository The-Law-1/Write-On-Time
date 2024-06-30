<template>
    <div class=" text-3xl">
        Title
    </div>
</template>

<script setup lang="ts">
import { fetchFilteredData } from '@/store/clockStore';
import { onMounted } from 'vue';

onMounted(async () => {
  await fetchFilteredData();
});

</script>