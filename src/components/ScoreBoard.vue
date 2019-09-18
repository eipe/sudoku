<template>
    <div class="content">
        <ol type="1">
            <li v-for="(record, index) in orderedRecords" v-bind:key="index">{{ record.secondsSpent }} seconds</li>
        </ol>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Record } from '../store';

@Component
export default class ScoreBoard extends Vue {

    private get orderedRecords(): Record[] {
        return this.$store.state.records.filterRecordsByDifficulityLevel(
            this.$store.state.difficulityLevel,
        ).sortRecords();
    }
}
</script>

<style scoped lang="scss">
</style>