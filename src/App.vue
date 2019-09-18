<template>
  <div>
    <div class="hero is-fullheight has-background-grey-lighter has-text-centered text-centered">
      <div class="hero-body">
        <template v-if="difficulityLevel === 0">
          <div class="container has-text-centered">
            <h1 class="title">Select level</h1>
            <level-selector></level-selector>
          </div>
        </template>
        <template v-else>
          <div class="container has-text-centered">
            <h2 class="title">{{selectedLevel}}</h2>
            <h3 class="subtitle"><timer ref="timer"></timer></h3>
            <button class="button is-success" v-if="valid" v-on:click="reset">Start a new one</button>
            <button class="button is-danger" v-else v-on:click="giveUp">Give up</button>
            <score-board v-if="valid"></score-board>
          </div>
          <div class="container">
            <board ref="board"></board>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import Vuex from 'vuex';

// Components
import Board from './components/Board.vue';
import Timer from './components/Timer.vue';
import ScoreBoard from './components/ScoreBoard.vue';
import LevelSelector from './components/LevelSelector.vue';
import { Record as IRecord } from './store';

// Store
import store from './store';

declare global {
    interface Array<T> {
        sortRecords(): T[];
        filterRecordsByDifficulityLevel(difficulityLevel: number): T[];
    }
}

interface Array<T> {
    sortRecords(): T[];
    filterRecordsByDifficulityLevel(difficulityLevel: number): T[];
}

Array.prototype.sortRecords = function() {
    return this.sort((a: IRecord, b: IRecord) => {
      return a.secondsSpent - b.secondsSpent;
    });
};

Array.prototype.filterRecordsByDifficulityLevel = function(difficulityLevel: number) {
  return this.filter((record: IRecord) => {
      return record.difficulityLevel === difficulityLevel;
  });
};

@Component({
  components: {
    Timer,
    Board,
    ScoreBoard,
    LevelSelector,
  },
})
export default class App extends Vue {
  public $refs!: {
    board: Board,
    timer: Timer,
  };

  private get selectedLevel(): string {
    return this.$store.getters.levelName;
  }

  private get ready(): boolean {
    return this.$store.state.ready;
  }

  private get valid(): boolean {
    return this.$store.state.valid;
  }

  private get difficulityLevel(): number {
    return this.$store.state.difficulityLevel;
  }

  private mounted(): void {
    // Secure that page is not reload unintentionally
    window.onbeforeunload = () => {
      return false;
    };
  }

  private reset(): void {
    this.$store.dispatch('reset');
    this.$refs.board.reset();
  }

  private giveUp(): void {
    if (confirm('Please confirm that you will give up')) {
      this.$store.dispatch('reset');
      this.$refs.board.reset();
    }
  }
}
</script>

<style lang="scss">
</style>
