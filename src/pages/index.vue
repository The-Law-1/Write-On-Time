<template>
    <div class=" text-3xl">
      Title
    </div>

    <div 
      v-if="clockInfo">
      {{ clockInfo.sentence }}
    </div>
</template>

<script setup lang="ts">
import { fetchCurrentTime } from '@/store/clockStore';
import { ClockInfo } from '@/types/ClockInfo';
import { onMounted, ref } from 'vue';

const clockInfo = ref<ClockInfo | null>(null);

onMounted(async () => {

  const getTime = () => {
    const date = new Date();

    // const hours = date.getHours();
    let minutes = date.getMinutes();

    // convert to 12 hour format
    let hours = date.getHours();

    const meridium = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0)
      return {
        currentTime: `00:${minutes < 10 ? '0' + minutes : minutes}`,
        meridium
      };
    else
      hours = hours % 12 || 12;
      return {
        currentTime: `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`,
        meridium
      }
  };
  const {currentTime, meridium} = getTime();
  console.log("Current time: ", currentTime)
  clockInfo.value = await fetchCurrentTime(currentTime, meridium);
});

</script>