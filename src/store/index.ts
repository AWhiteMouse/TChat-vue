import { Commit, createStore } from 'vuex';

export interface State {
    nickname: string;
}

const store = createStore({
    state(): State {
        return {
            nickname: '',
        }
    },
    getters: {
        getNickname(state: State) {
            return state.nickname;
        },
    },
    mutations: {
        setNickname(state: State, payload: string) {
            state.nickname = payload;
        },
    },
    actions: {
        setNickname({commit}: {commit: Commit}, params: string) {
            commit('setNickname', params);
        }
    }
})

export default store;
