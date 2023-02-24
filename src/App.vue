<template>
  <v-app>
    <v-main>
      <v-container class="fill-height">
        <v-responsive class="d-flex align-center text-center fill-height">
          <chatbox />
        </v-responsive>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import chatbox from '@/components/chatbox/index.vue'
</script>
