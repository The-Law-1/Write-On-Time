<template>

    <div class=" flex justify-center">
      <div v-if="clockInfo" class=" w-2/3">

        <!-- MAIN SNIPPET -->
        <div>
          {{ splitSnippet[0] }}
          <span class=" font-bold">
            {{ splitSnippet[1] }}
          </span>
          {{ splitSnippet[2] }}
        </div>

        <!-- TITLE + AUTHOR -->
        <div class=" w-full text-end ">
          <a :href="clockInfo.preview" target="_blank" class=" text-xs">
            <span class=" text-xs italic">
              {{ clockInfo.title }}
            </span>
            <br>
            <span class=" text-xs">
              {{ clockInfo.author }}
            </span>
          </a>
        </div>
      </div>
    </div>
    <div>
      <button
        @click="(e) => {
          e.preventDefault();
          fetchClockInfo();
        }">
        Refresh
      </button>
    </div>
</template>

<script setup lang="ts">
import { fetchCurrentTime } from '@/store/clockStore';
import { ClockInfo } from '@/types/ClockInfo';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const clockInfo = ref<ClockInfo | null>(null);
const splitSnippet = ref<string[]>([]);

watch(clockInfo, (newVal) => {
  if (newVal) {
    splitSnippet.value = [];

    // if preview is empty or null, it's a gutenberg book and you have to build it
    if (!newVal.preview) {
      const bookNumber = newVal.bookNumber;
      const gutenbergLink = `https://www.gutenberg.org/ebooks/${bookNumber}`

      clockInfo.value.preview = gutenbergLink;
    }

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

const getTime = () => {
  const date = new Date();

  // const hours = date.getHours();
  let minutes = date.getMinutes();

  // convert to 12 hour format
  let hours = date.getHours();

  const meridium = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) {
    return {
      currentTime: `00:${minutes < 10 ? '0' + minutes : minutes}`,
      meridium
    };
  }
  else {
    hours = hours % 12 || 12;
    return {
      currentTime: `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`,
      meridium
    }
  }
};

const fetchClockInfo = async () => {
  const {currentTime, meridium} = getTime();

  clockInfo.value = await fetchCurrentTime("05:45", "PM");
  // clockInfo.value = await fetchCurrentTime(currentTime, meridium);
};

let initialTimeoutId: NodeJS.Timeout = null;
let intervalId: NodeJS.Timeout = null;

onMounted(async () => {

  // * run for the current time
  await fetchClockInfo();

  // Calculate the delay until the next minute
  // const now = new Date();
  // const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  // // Wait until the start of the next minute to align the interval with real-time minutes
  // initialTimeoutId = setTimeout(() => {
  //   fetchClockInfo(); // Call it once at the start of the next minute
  //   // Then set an interval to call it every 60 seconds
  //   intervalId = setInterval(fetchClockInfo, 60 * 1000);
  // }, delayUntilNextMinute);

});
// Cleanup on component unmount
onUnmounted(() => {
  clearTimeout(initialTimeoutId);
  clearInterval(intervalId);
});

</script>