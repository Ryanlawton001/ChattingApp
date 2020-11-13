/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');
import Vue from 'vue'

import VueChatScroll from 'vue-chat-scroll'
Vue.use(VueChatScroll)


import Toaster from 'v-toaster'
import 'v-toaster/dist/v-toaster.css'

Vue.use(Toaster, {timeout: 5000})

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.component('message', require('./components/message.vue').default);



const app = new Vue({
    el: '#app',
    data:{
        typing:'',
        numberOfUsers:0,
        message:'',
        chat:{
            message:[],
            user:[],
            colour:[],
            time:[]
        },


    },
    watch:{
        message(){
            Echo.private('chat')
                .whisper('typing', {
                    name: this.message
                });
        }
    },

    methods:{
        send(){
            if(this.message.length != 0) {
                this.chat.message.push(this.message);
                this.chat.colour.push('success');
                this.chat.user.push('you');
                this.chat.time.push(this.getTime());

                axios.post('/send', {

                    message : this.message,

                    chat:this.chat

                })
                    .then(response => {
                        console.log(response);
                        this.message = ''
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        },
        getTime(){
            let time = new Date();
            return time.getHours()+':'+time.getMinutes();
        },
        getOldMessages() {
            axios.post('/getOldMessage')
                .then(response =>{
                    if(response.data != ''){
                        this.chat = response.data
                    }

                })
                .catch(error=> {
                    console.log(error);
                    }
                )
        },
        deleteSession(){

            axios.post('/deleteSession')

        }

    },
    mounted(){

        this.getOldMessages();

        Echo.private('chat')
            .listen('ChatEvent', (e) => {
                console.log(e.user);
                this.chat.message.push(e.message);
                this.chat.colour.push('warning');
                this.chat.user.push(e.user);
                this.chat.time.push(this.getTime());

                axios.post('/saveToSession', {
                    chat : this.chat
                })
                    .then(response =>{

                    })
                    .catch(error=> {
                            console.log(error);
                        }
                    )

                // console.log(e);
            })
            .listenForWhisper('typing', (e) => {
                if(e.name != ''){
                    this.typing = 'typing...'
                }else {
                    this.typing = ''
                }
            })

        Echo.join(`chat`)
            .here((users) => {
                this.numberOfUsers = users.length;

            })
            .joining((user) => {
                this.numberOfUsers += 1;
                this.$toaster.success(user.name +' has joined the chat!')
            })
            .leaving((user) => {
                this.numberOfUsers -= 1;
                this.$toaster.warning(user.name +' has left the chat!')
            })
    }
});
