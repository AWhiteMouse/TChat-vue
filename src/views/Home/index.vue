<template>
    <div class="chatroom">
		<!--左侧-->
		<div class="left">
			<!--头像-->
			<div class="icon-container">
				<img src="https://i.niupic.com/images/2018/08/10/5yxS.jpg" />
			</div>

			<!--个人简介-->
			<div class="self-container">{{nickname}}</div>

			<!--聊天室默认话术集合-->
			<div class="function-container">
                <div
                    v-for="item in keyWords"
                    :key="item"
                    class="function-item"
                    :data-word="item"
                    @click="() => handleSendKeyword(item)"
                >
                    {{item}}
                </div>
			</div>

			<div class="note-help">
				如果您有什么好的页面设计方案，请将您的设计稿发送至 tanabalu@qq.com ，非常感谢！
			</div>
		</div>

		<!--右侧-->
		<div class="right">
			<!--顶部固定导航-->
			<div class="head">聊天室(<span id="count">{{count}}</span>)</div>

			<!-- <div class="head-exit">
				<img src="./static/images/exit.png" />
			</div> -->

			<!--聊天记录-->
			<div class="chat-container">
				<div class="message-other">
					<div class="message-container">
						<div class="icon">
							<img :src="robotIcon" />
						</div>
						<div class="message-content">
							<div class="speaker-name">机器人</div>
							<div class="message">你好呀，小主人，欢迎来到TAchat。</div>
						</div>
					</div>
				</div>
				<div class="message-other">
					<div class="message-container">
						<div class="icon">
							<img :src="robotIcon" />
						</div>
						<div class="message-content">
							<div class="speaker-name">机器人</div>
							<div class="message">
								<table class="message-table">
									<tr>
										<th class="message-table-th">您可尝试输入以下指令：</th>
									</tr>
                                    <tr v-for="(item, index) in keyWords" :key="item">
                                        <td class="message-table-td">{{index + 1}}、{{item}}</td>
                                    </tr>
									<tr>
										<td class="message-table-td">……</td>
									</tr>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div class="message-other">
					<div class="message-container">
						<div class="icon">
							<img :src="robotIcon" />
						</div>
						<div class="message-content">
							<div class="speaker-name">机器人</div>
							<div class="message">还可以邀请小伙伴打开本网址与您一起聊天呢！</div>
						</div>
					</div>
				</div>
                <template v-for="(message, index) in messageList" :key="index">
                    <div v-if="message.type === MessageType.NOTIFY" class="notify-container">
                        <div class="notify">
                            <span class="notify-name">
                                {{message.name}}
                            </span>
                            {{message.message}}
                        </div>
                    </div>
                    <div v-else-if="message.type === MessageType.MINE" class="message-self">
                        <div class="message-container">
                            <div class="message-content">
                                <div class="speaker-name">
                                    {{message.name}}
                                </div>
                                <div class="message">
                                    {{message.message}}
                                </div>
                            </div>
                            <div class="icon">
                                <img :src="userIcon" />
                            </div>
                        </div>
                    </div>
                    <div v-else-if="message.type === MessageType.OTHERS" class="message-other">
                        <div class="message-container">
                            <div class="icon">
                                <img :src="userIcon" />
                            </div>
                            <div class="message-content">
                                <div class="speaker-name">{{message.name}}</div>
                                <div class="message">{{message.message}}</div>
                            </div>
                        </div>
                    </div>
                </template>
			</div>

			<!--底部输入框-->
			<div class="input-container">
				<div class="input-content">
					<input
                        v-model="currentMessage"
                        placeholder="请输入聊天内容…"
                        :maxlength="maxInput"
                        @keyup.enter="send"
                    />
					<div class="num">{{currentMessage.length}}/{{maxInput}}</div>
				</div>
				<div class="send" @click="send">发送</div>
			</div>
		</div>

	</div>
</template>

<script lang="ts">
import {defineComponent, onBeforeMount, ref, nextTick} from 'vue';
import { useRouter } from 'vue-router';
import {useStore} from 'vuex';
import io from 'socket.io-client';
import { Socket } from 'dgram';

interface NotifyMessage {
    name: string;
    action: string;
}

interface SendMessage {
    id: number;
    name: string;
    message: string;
}

interface NotifySelfMessage {
    id: number;
    count: number;
}

enum MessageType {
    MINE,
    OTHERS,
    NOTIFY,
    ROBOT,
}

interface Message {
    type: MessageType;
    name: string;
    message: string;
}

// 允许输入的最大字数
const maxInput = 30;

// 用户头像
const userIcon = 'https://z3.ax1x.com/2021/07/12/WFQowt.jpg';

// 机器人头像
const robotIcon = 'https://z3.ax1x.com/2021/07/12/WFlSwq.jpg';

// 关键词
const keyWords = [
    "尬聊模式", "讲个笑话", "歇后语", "顺口溜",
    "北京天气", "名人名言", "静夜思",
];

export default defineComponent({
    setup() {
        const store = useStore();
        const nickname = ref(store.getters.getNickname);
        const router = useRouter();
        const messageList = ref([] as Message[]);
        const id = ref(0);
        const count = ref(0);
        const currentMessage = ref('');
        let socket: Socket;

        function handleSendKeyword(keyword: string) {
            // 点击了快捷消息
            const message: SendMessage = {
                id: id.value,
                name: nickname.value,
                message: keyword,
            };
            // 通过socket发送消息
            socket.send(message);
        }

		function notify(message: NotifyMessage) {
			if (message.name && message.action) {
                messageList.value.push({
                    type: MessageType.NOTIFY,
                    name: message.name,
                    message: message.action,
                });
                nextTick(() => {
                    scrollToBottom();
                });
			}
		}

		/**
		 * 固定滚动条到底部
		 */
		function scrollToBottom() {
            const dom = document.getElementsByClassName('chat-container')[0];
            dom.scrollTop = dom.scrollHeight;
		}

        /**
		 * 发送消息
		 */
		function send() {
            if (!currentMessage.value.trim().length) {
                return;
            }
            const message = {
                id: id.value,
                name: nickname.value,
                message: currentMessage.value,
            };
            // 通过socket发送消息
            socket.send(message);
            currentMessage.value = '';
		}

        onBeforeMount(() => {
            if (!nickname.value) {
                router.replace('/login');
                return;
            }

            //和后端服务建立链接
            socket = io('ws://localhost:3001') as unknown as Socket;

            // 如果监听到socket消息，那么执行该回调函数，并得到广播消息
            // 此处的message参数是后台广播的内容
            socket.on("message", function (message: SendMessage) {
                if (nickname.value === message.name) {
                    messageList.value.push({
                        type: MessageType.MINE,
                        name: nickname.value,
                        message: message.message,
                    });
                }
                else {
                    messageList.value.push({
                        type: MessageType.OTHERS,
                        name: message.name,
                        message: message.message,
                    });
                }
                nextTick(() => {
                    scrollToBottom();
                });
            });

            // 接收到系统通知
            socket.on("joinNoticeSelf", function (message: NotifySelfMessage) {
                console.log('joinNoticeSelf', message);
                count.value = message.count;
                id.value = message.id;
                notify({
                    name: nickname.value,
                    action: '您已进入聊天室，开始聊天吧'
                });
            });

            // 接收到系统通知
            socket.on("joinNoticeOther", function (message) {
                count.value = message.count;
                notify({
                    name: message.name,
                    action: message.action
                });
            });

            // 断开连接回调事件
            socket.on("disconnection", function (message) {
                count.value = message.count;
                notify({
                    name: message.name,
                    action: "退出了群聊"
                });
            });

            socket.emit("join", {name: nickname.value});
        });

        return {
            nickname,
            messageList,
            send,
            id,
            maxInput,
            userIcon,
            robotIcon,
            keyWords,
            handleSendKeyword,
            MessageType,
            count,
            currentMessage,
        };
    }
})
</script>

<style lang="scss" scoped>
.chatroom {
    display: flex;
    margin: 0 auto;
    padding-top: 30px;
    width: 1000px;
    height: 700px;
    border-radius: 20px;
    overflow: hidden;
}

.left {
    position: relative;
    display: flex;
    flex-direction: column;
    align-content: center;
    width: 30%;
    height: 100%;
    background-color: #478291;
}

.icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40px;
    height: 30%;

    img {
        border: 10px solid #333;
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 50%;

        &:hover {
            animation: rotate 2s linear infinite forwards;
        }
    }
}

.self-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 15%;
    line-height: 60px;
    font-size: 25px;
    font-weight: 700;
    color: #cadeea;
}

.function-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 0 30px;
    color: #617c8f;

    .function-item {
        margin: 5px;
        border: 3px solid #333;
        padding: 5px 10px;
        background: #fff;
        font-size: 14px;
        cursor: pointer;
    }
}

.note-help {
    position: absolute;
    bottom: 20px;
    padding: 0 30px;
    font-size: 12px;
    color: #9cadad;
    text-align: center;
}

.right {
    position: relative;
    width: 70%;
    height: 100%;
    background-color: #eee;
}

.head {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10%;
    width: 100%;
    background-color: #fff;
    font-size: 22px;
    font-weight: 700;
}

.head-exit {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    right: 25px;
    height: 10%;
}

.chat-container {
    height: 80%;
    overflow-y: scroll;
    box-sizing: border-box;
}

.message-self,
.message-other {
    display: flex;
    flex-wrap: nowrap;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
}

.speaker-name {
    padding: 5px 0;
    font-size: 12px;
    color: #888;
}

.message {
    border-radius: 10px;
    padding: 10px;
}

.message-self {
    justify-content: flex-end;

    .speaker-name {
        text-align: right;
    }

    .message {
        background-color: #54addb;
        color: #fff;
        float: right;
    }

    .message-content {
        padding-right: 10px;
    }
}

.message-container {
    display: flex;
    flex-direction: row;
    max-width: 80%;

    .icon img {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 50%;
    }
}

.message-other {
    .message-content {
        padding-left: 10px;
    }

    .speaker-name {
        text-align: left;
    }

    .message {
        background-color: #fff;
        color: #000;
        float: left;
    }
}

.message-table {
    border-collapse: collapse;
    border: 2px dashed #aaa;

    .message-table-th {
        border-bottom: 2px dashed #aaa;
        padding: 5px 10px;
    }

    .message-table-td {
        padding: 5px 10px;
    }
}

.notify-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 50px;
}

.notify {
    border-radius: 10px;
    padding: 5px 10px;
    background-color: #ddd;
    opacity: .9;
    font-size: 12px;
    color: #fff;
}

.notify-name {
    color: #00f;
}

.input-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 10%;
    background-color: #00f;
    font-size: 18px;

    .input-content {
        position: relative;
        width: 85%;
        background-color: #fff;

        input {
            border: 0;
            padding: 10px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            /* 去除input框外边框  */
            outline: none;
            font-size: 18px;

            &:-webkit-input-placeholder {
                font-size: 18px;
            }
        }

        .num {
            position: absolute;
            right: 0;
            top: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 70px;
            height: 100%;
            background: -webkit-linear-gradient(left, rgba(255, 255, 255, .6), rgba(255, 255, 255, 1));
            font-weight: 700;
            color: #333;
        }
    }

    .send {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 15%;
        background-color: #ffa500;
        font-weight: 700;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
