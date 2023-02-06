<template>
    <div ref="lavContainer" :style="style" />
</template>

<script>
    import lottie from 'lottie-web';

    export default {
        name: 'Lottie',

        props: {
            options: {
                type: Object,
                required: true,
            },
            height: {
                type: Number,
                default: 30,
            },
            width: {
                type: Number,
                default: 30,
            },
        },

        emits: ['loaded'],

        data() {
            return {
                animation: null,
                style: {
                    width: this.width ? `${this.width}px` : '100%',
                    height: this.height ? `${this.height}px` : '100%',
                    overflow: 'hidden',
                    margin: '0 auto',
                },
            };
        },

        mounted() {
            this.animation = lottie.loadAnimation({
                container: this.$refs.lavContainer,
                renderer: 'svg',
                loop: this.options.loop !== false,
                autoplay: this.options.autoplay !== false,
                animationData: this.options.animationData,
                rendererSettings: this.options.rendererSettings,
            });

            this.$emit('loaded', this.animation);
        },

        beforeUnmount() {
            this.animation.destroy();
        },
    };
</script>
