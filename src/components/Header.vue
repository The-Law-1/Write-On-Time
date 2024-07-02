<template>
  <div>

    <div class=" p-2 flex justify-around">
      <div>
        Inspired and impressed by
          <a class=" hover:text-gray-700 underline underline-offset-2 decoration-dashed" href="https://www.authorclock.com/" target="_blank">Author Clock</a>
      </div>
 
      <div class=" flex items-center space-x-2 ">
        <!-- Talk to me: -->
        <a class=" w-6 h-6 rounded-full bg-black border-black border " href="https://github.com/The-Law-1/Write-On-Time" target="_blank" rel="noreferrer">
          <img class="w-full h-full" :src="githubSVG" alt="githubIcon"/>
        </a>
        <!-- github -->
        <a class=" w-5 h-5 " href="https://x.com/The_Lawful_" target="_blank" rel="noreferrer">
          <img class="w-full h-full" :src="twitterSVG" alt="twitterIcon"/>
        </a>
         
         <!-- Discord -->
          <!-- https://support.discord.com/hc/en-us/community/posts/360037884532-Link-to-enter-in-DM -->
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import githubSVG from "@/assets/github.svg";
import twitterSVG from "@/assets/x_logo.svg";

</script>