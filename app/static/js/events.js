'use strict'
/* global Vue io */
/* eslint-disable no-console */

if(window.hasOwnProperty('Vue')) {



    Vue.component('participant-item', {
        props: ['participant', 'event'],
        template: '#participant-item-template',
        methods: {
            leave: function() {
                console.log('leaving: ' + event.id)

            }
        }
        
    })

    Vue.component('event-item', {
        props: ['event'],
        template: '#event-item-template',
        methods: {
            toggleVisible: function() {
                this.event.visible = !this.event.visible
            },
            join: function(type) {
                console.log('join as ' + type)
            }
        }
    })

    Vue.component('group-item', {
        props: ['group'],
        template: '#group-item-template',
        data: function() {
            return {
                newEvent: false,
                event: {
                    name: '',
                    date: '',
                    hour: '',
                    group: '',
                    max_participants: 4
                }
            }
        },
        methods: {
            toggleVisible: function() {
                this.group.visible = !this.group.visible
            }
        }
    })

    window.app = new Vue({
        el: '#app',
        data: {
            token: {},
            inProgress: false,
            warning: {
                message: ''
            },
            error: {
                message: '',
                detail: '',
                detailVisible: false
            },
            groups: [],
            platforms: [],
            showPlatforms: false,
            datePicker: {}
        
        },
        methods: {
            mergeVisible: function(oldData, newData) {
                var that = this
                // merge the current and new visible states
                newData.forEach(function (n) {
                    for (var i=0; i < oldData.length; i++) {
                        if (oldData[i].id === n.id) {
                            // found it, set the visibility
                            n.visible = oldData[i].visible
                            // now merge the events if they exist
                            if(n.events) that.mergeVisible(oldData[i].events, n.events)
                            break // our work here is done
                        }
                    }
                })
              
            }
        },
        created: function() {

            this.inProgress = true

            var token = (function() {
                // get the session cookie
                // should already be URL safe
                var c = document.cookie.match(/8bn-team=([^;]+)/)
                if(c && c.length > 1) return c[1]
            })()

            var that = this
            that.io = io('/events?token=' + token)

            that.io.on('connect', function() {
                console.log('socket.io connected')
                that.warning.message = ''
            })

            that.io.on('disconnect', function() {
                console.log('socket.io disconnected')
                that.warning.message = 'disconnected from server'
            })

            that.io.on('token', function(token) {
                that.token = token
            })

            that.io.on('events', function(data) {
                that.platforms = data.platforms
                
                that.showPlatforms = data.platforms.length > 1

                that.mergeVisible(that.groups, data.groups)
                that.groups = data.groups

                that.inProgress = false
            })

        }
    })

}

