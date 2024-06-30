<template>
    <div class=" text-3xl">
        Title
    </div>
</template>

<script setup lang="ts">
import { fetchCurrentTime } from '@/store/clockStore';
import { onMounted } from 'vue';

onMounted(async () => {

  const getTime = () => {
    const date = new Date();

    // const hours = date.getHours();
    let minutes = date.getMinutes();

    // convert to 12 hour format
    let hours = date.getHours();


    if (hours === 0)
      return `00:${minutes < 10 ? '0' + minutes : minutes}`;
    else
      hours = hours % 12 || 12;
      return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };
  const currentTime = getTime();
  console.log("Current time: ", currentTime)
  await fetchCurrentTime("02:56");
});

</script>