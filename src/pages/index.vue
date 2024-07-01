<template>
  <div class=" h-full bg-paper">

    <div class=" flex justify-center items-center h-3/4">
      <div v-if="clockInfo" class=" w-2/3">

        <div class="min-h-[14rem]"
          :class="{'animate-fade_out opacity-0': fadeOut, 'animate-fade_in opacity-100': !fadeOut}"
        >
          <!-- MAIN SNIPPET -->
          <div class="text-4xl">
            <span v-show="splitSnippet[0].length > 0">
              {{ splitSnippet[0] }}
            </span>

            <span class="font-bold">
              {{ splitSnippet[1] }}
            </span>
            <span v-if="splitSnippet.length > 2">
              {{ splitSnippet[2] }}
            </span>
          </div>

          <!-- TITLE + AUTHOR -->
          <div class="w-full text-end pt-2 ">
            <a :href="clockInfo.preview" target="_blank" class=" text-xs">
              <span class=" text-base italic">
                {{ clockInfo.title }}
              </span>
              <br>
              <span class=" text-base">
                {{ clockInfo.author }}
              </span>
            </a>
          </div>

        </div>

        <div class=" w-full flex justify-center pt-5">
          <button title="Refresh"
            @click="(e: MouseEvent) => {
              e.preventDefault();
              if (refreshLoading) return;
              fetchClockInfo();
            }">
            <ArrowPathIcon
            :class="{'animate-spin': refreshLoading, 'w-12 h-12 cursor-pointer': true}"/>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { fetchCurrentTime } from '@/store/clockStore';
import { ClockInfo } from '@/types/ClockInfo';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

const clockInfo = ref<ClockInfo | null>(null);
const splitSnippet = ref<string[]>([]);

const fadeOut = ref(false);

const refreshLoading = ref(false);

watch(clockInfo, (newVal) => {
  if (newVal) {
    splitSnippet.value = [];

    // if preview is empty or null, it's a gutenberg book and you have to build it
    if (!newVal.preview) {
      const bookNumber = newVal.bookNumber;
      const gutenbergLink = `https://www.gutenberg.org/ebooks/${bookNumber}`

      clockInfo.value!.preview = gutenbergLink;
    }

    try {
      const sentenceCopy = newVal.sentence;
      const expressionCopy = newVal.expression;
      const lowerCaseSentence = sentenceCopy.toLowerCase();
      const lowerCaseExpression = expressionCopy.toLowerCase();
      if (lowerCaseSentence.startsWith(lowerCaseExpression)) {
        splitSnippet.value.push("");
        splitSnippet.value.push(newVal.expression);
        splitSnippet.value.push(newVal.sentence.slice(newVal.expression.length));
      } else if (lowerCaseSentence.endsWith(lowerCaseExpression)) {
        splitSnippet.value.push("");
        splitSnippet.value.push(newVal.sentence.slice(0, newVal.sentence.length - newVal.expression.length));
        splitSnippet.value.push(newVal.expression);
      } else {

        
        const splitSentence = newVal.sentence.split(newVal.expression);
        
        if (splitSentence.length !== 2)
          throw new Error('Invalid sentence');
        
        splitSnippet.value.push(splitSentence[0]);
        splitSnippet.value.push(newVal.expression);
        splitSnippet.value.push(splitSentence[1]);
      }

      // first letter of final snippet
      const firstLetter = splitSnippet.value[2].trim().charAt(0);
      // if firstletter is alphabetical, add a space
      if (firstLetter.match(/[a-z]/i)) {
        splitSnippet.value[2] = ` ${splitSnippet.value[2]}`;
      }
      if (splitSnippet.value[0].length > 0) {
        splitSnippet.value[0] = `${splitSnippet.value[0]} `;
      }


    } catch (error) {
      splitSnippet.value = ["", "", ""];
      fetchClockInfo();
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

  // fade out
  fadeOut.value = true;
  refreshLoading.value = true;
  setTimeout(async () => {
    // clockInfo.value = await fetchCurrentTime("05:45", "PM");
    clockInfo.value = await fetchCurrentTime(currentTime, meridium);
    refreshLoading.value = false;
    fadeOut.value = false;
  }, 200); // wait for 500ms to in

};

let initialTimeoutId: (NodeJS.Timeout | null) = null;
let intervalId: (NodeJS.Timeout | null) = null;

onMounted(async () => {

  // * run for the current time
  await fetchClockInfo();

  // Calculate the delay until the next minute
  const now = new Date();
  const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  // Wait until the start of the next minute to align the interval with real-time minutes
  initialTimeoutId = setTimeout(() => {
    fetchClockInfo(); // Call it once at the start of the next minute
    // Then set an interval to call it every 60 seconds
    intervalId = setInterval(fetchClockInfo, 60 * 1000);
  }, delayUntilNextMinute);

});
// Cleanup on component unmount
onUnmounted(() => {
  if (initialTimeoutId)
    clearTimeout(initialTimeoutId);
  if (intervalId)
    clearInterval(intervalId);
});

</script>