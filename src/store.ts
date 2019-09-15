import Vue from 'vue';
import Vuex from 'vuex';

export interface IState {
  gridSize: number;
  difficulityLevel: number;
  ready: boolean;
  valid: boolean;
  timeSpent: number;
  records: number[][];
}

Vue.use(Vuex);

let timer: number = 0;

const model: IState = {
  gridSize: 9,
  difficulityLevel: 0,
  ready: false,
  valid: false,
  timeSpent: 0,
  records: JSON.parse(sessionStorage.getItem('records') || '{}'),
};

const difficulityLevels: any = {
  1: 'Beginner',
  8: 'Intermediate',
  14: 'Advanced',
  20: 'Expert',
};

export default new Vuex.Store({
  state: model,
  getters: {
    levels(): object {
      return difficulityLevels;
    },
    levelName(): string {
      return difficulityLevels[model.difficulityLevel];
    },
  },
  mutations: {
    saveRecord(state) {
      if (typeof state.records[state.difficulityLevel] === 'undefined') {
        state.records[state.difficulityLevel] = [];
      }
      state.records[state.difficulityLevel].push(state.timeSpent);
      sessionStorage.setItem('records', JSON.stringify(state.records));
    },
    setDifficulityLevel(state, level: number) {
      state.difficulityLevel = level;
    },
    setValid(state, valid: boolean) {
      state.valid = valid;
    },
    setReady(state, ready: boolean) {
      state.ready = ready;
    },
    setTimeSpent(state, timeSpent: number) {
      state.timeSpent = timeSpent;
    },
  },
  actions: {
    reset(context) {
      return new Promise((resolve) => {
        context.commit('setDifficulityLevel', 0);
        context.dispatch('stopTimer').then(() => {
          context.commit('setTimeSpent', 0);
        });
        context.commit('setReady', false);
        context.commit('setValid', false);
        resolve();
      });
    },
    saveRecord(context) {
      context.commit('saveRecord');
    },
    setDifficulityLevel(context, level: number) {
      return new Promise((resolve) => {
        context.commit('setDifficulityLevel', level);
        resolve();
      });
    },
    setValid(context, valid: boolean) {
      return new Promise((resolve) => {
        context.commit('setValid', valid);
        context.dispatch('stopTimer').then(() => {
          context.dispatch('saveRecord');
        });
        resolve();
      });
    },
    setReady(context, ready: boolean) {
      return new Promise((resolve) => {
        context.commit('setReady', ready);
        resolve();
      });
    },
    startTimer(context) {
      return new Promise((resolve) => {
        if (timer) {
          resolve();
        }
        timer = setInterval(() => {
          context.commit('setTimeSpent', context.state.timeSpent + 1);
        }, 1000);
        resolve();
      });
    },
    stopTimer() {
      return new Promise((resolve) => {
        clearTimeout(timer);
        resolve();
      });
    },
  },
});
