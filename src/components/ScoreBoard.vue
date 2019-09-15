<template>
    <div class="content">
        <ol type="1">
            <li v-for="(time, index) in orderedRecords" v-bind:key="index">{{ time }} seconds</li>
        </ol>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class ScoreBoard extends Vue {

    private get orderedRecords(): number[][] {
        const records = this.$store.state.records;
        const level = this.$store.state.difficulityLevel;
        if (typeof records[level] === 'undefined') {
            return [];
        }
        return records[level].sort((a: any, b: any) => a - b);
    }
}
</script>

<style scoped lang="scss">
</style>