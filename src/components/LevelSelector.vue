<template>
    <div>
        <template v-for="(level, index) of levels">
            <button class="button" v-on:click="selectLevel(index)" v-bind:key="index">{{level}}</button>
        </template>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';


@Component
export default class LevelSelector extends Vue {
    private levels = this.$store.getters.levels;

    private selectLevel(level: number): void {
        this.$store.dispatch('setDifficulityLevel', level);
    }
}
</script>

<style scoped lang="scss">
</style>