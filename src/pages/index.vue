<template>
    <div class=" text-3xl">
      Title
    </div>

    <div 
      v-if="clockInfo">
      {{ splitSnippet[0] }}
      <span class=" font-bold">
        {{ splitSnippet[1] }}
      </span>
      {{ splitSnippet[2] }}
    </div>
</template>

<script setup lang="ts">
import { fetchCurrentTime } from '@/store/clockStore';
import { ClockInfo } from '@/types/ClockInfo';
import { onMounted, ref, watch } from 'vue';

const clockInfo = ref<ClockInfo | null>(null);
const splitSnippet = ref<string[]>([]);

watch(clockInfo, (newVal) => {
  if (newVal) {
    splitSnippet.value = [];

    try {
      if (newVal.sentence.startsWith(newVal.expression)) {
        splitSnippet.value.push(newVal.expression);
        splitSnippet.value.push(newVal.sentence.slice(newVal.expression.length));
        return;
      }

      if (newVal.sentence.endsWith(newVal.expression)) {
        splitSnippet.value.push(newVal.sentence.slice(0, newVal.sentence.length - newVal.expression.length));
        splitSnippet.value.push(newVal.expression);
        return;
      }

      const splitSentence = newVal.sentence.split(newVal.expression);

      if (splitSentence.length !== 2)
        throw new Error('Invalid sentence');

      splitSnippet.value.push(splitSentence[0]);
      splitSnippet.value.push(newVal.expression);
      splitSnippet.value.push(splitSentence[1]);
    } catch (error) {
      console.warn('Invalid sentence');
    }

  }
});

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