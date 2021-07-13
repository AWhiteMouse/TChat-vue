<template>
    <div :class="$style.wrapper">
        <div :class="$style.main">
			<input
				v-model="nickname"
				:class="$style.input"
				placeholder="请输入聊天昵称"
                maxlength="10"
                @keyup.enter="enter"
			/>
			<div v-if="showMessage" :class="$style.message">请先输入聊天昵称</div>
			<button
				:class="$style.enter"
				@click="enter"
			>进入聊天室</button>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent, onBeforeMount, ref, watch} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
    setup() {
		const router = useRouter();
		const store = useStore();
        const nickname = ref(store.getters.getNickname);
		const showMessage = ref(false);

		onBeforeMount(() => {
			if (nickname.value) {
				router.replace('/');
			}
		});

		watch(nickname, () => {
			showMessage.value = !(nickname.value.trim().length)
		});

		function enter() {
			if (!showMessage.value && nickname.value.trim().length) {
				store.dispatch('setNickname', nickname.value);
				router.replace('/');
			}
			else {
				showMessage.value = true;
			}
		}

        return {
            nickname,
			showMessage,
			enter,
        };
    },
})
</script>

<style lang = "scss" module>
.wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
}

.main {
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 250px;
}

.input {
    font-family: sans-serif;
    outline: 0;
    background: #f2f2f2;
    width: 100%;
    border: 0;
    padding: 15px;
    box-sizing: border-box;
    font-size: 14px;
}

.message {
    margin-top: 5px;
    text-align: left;
    font-size: 12px;
    color: #f00;
}

.enter {
    margin-top: 10px;
    font-family: sans-serif;
    text-transform: uppercase;
    outline: 0;
    background: #4caf50;
    width: 100%;
    border: 0;
    padding: 15px;
    color: #fff;
    font-size: 14px;
    transition: all .3s ease;
    cursor: pointer;

    &:hover,
    &:active,
    &:focus {
        background: #44a248;
    }
}
</style>