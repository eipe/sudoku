<template>
    <div>
        Time spent: {{timeSpentText}}
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
    private get timeSpentText() {
        return this.$store.state.timeSpent.toString() + ' seconds';
    }
}
</script>

<style scoped lang="scss">
</style>