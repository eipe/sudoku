<template>
  <div>
    <template v-if="difficulityLevel === 0">
      <h1>Select level</h1>
      <level-selector></level-selector>
    </template>
    <template v-else>
      <div style="width: 30vw; float: left;">
        <h1>{{selectedLevel}}</h1>
        <timer ref="timer"></timer>
        <button v-if="valid" v-on:click="reset">Start a new one</button>
        <button v-else v-on:click="giveUp">Give up</button>
        <score-board></score-board>
      </div>
      <div style="width: 60vw; float: left;">
        <board ref="board"></board>
      </div>
    </template>
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

// Store
import store from './store';

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
