<template>
    <div class="flex h-full">
        <div class="w-[25rem] pr-8">
            <div class="bg-gray-200 p-8 h-full">
                <div v-if="scannedUnits.length > 0" class="mb-8">
                    <button
                        class="btn p-4 w-full text-left font-bold"
                        @click.prevent="onCancel"
                    >
                        <icon icon="xmark" />
                        Cancel
                    </button>

                    <button
                        v-if="scannedUnits.length > 1"
                        class="btn p-4 w-full text-left font-bold mt-2"
                        :disabled="step === 'combine' && isInvalid"
                        @click.prevent="onNext"
                    >
                        <icon icon="arrow-right" />
                        {{ step === 'combine' ? 'Finish' : 'Next' }}
                    </button>

                    <p class="mt-2 font-bold text-xl">Total: {{ totalWeight }} KG</p>
                </div>

                <ul>
                    <li v-for="unit in scannedUnits" :key="unit.id" class="mb-2 last:mb-0">
                        <button class="btn p-4 w-full text-left" :disabled="step === 'combine'">
                            {{ unit.item.name }}<br />
                            <span class="font-bold">{{ unit.stock }} {{ unit.item.subunitNormal }}</span>
                        </button>
                    </li>
                </ul>

                <div v-if="isSuper" class="mt-4">
                    <button
                        class="btn px-4 py-2"
                        @click.prevent="onSimulateScan"
                    >
                        {{ simulationStarted ? 'Stop Simulation' : 'Simulate Scan' }}
                    </button>
                </div>
            </div>
        </div>

        <div class="flex items-center text-center flex-1">
            <div class="w-full">
                <div v-if="status === null">
                    <div v-if="weight <= 0 && step === 'scan'" class="text-2xl mb-2">
                        Place boxes to combine on the scale,<br />one at a time.
                    </div>

                    <div v-else-if="step === 'combine'" class="text-2xl mb-2">
                        Place the heaviest box on the scale and empty the other
                        <span v-if="scannedUnits.length > 2">{{ scannedUnits.length - 1 }} boxes</span>
                        <span v-else>box</span>
                        into it.
                    </div>

                    <div class="text-6xl">
                        {{ weight }}{{ unit }}
                        <span v-if="!stable && weight > 0">*</span>
                    </div>
                </div>

                <div v-show="status !== null">
                    <lottie
                        :options="animationOptions"
                        :width="200"
                        :height="200"
                        @loaded="onAnimationLoaded"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { library } from '@fortawesome/fontawesome-svg-core';
    import { faXmark } from '@fortawesome/pro-solid-svg-icons/faXmark';
    import { faArrowRight } from '@fortawesome/pro-solid-svg-icons/faArrowRight';

    import rfid from '~/mixins/rfid';
    import scale from '~/mixins/scale';
    import sim from '~/mixins/sim';
    import Lottie from '~/components/Lottie.vue';
    import animationData from '~/animations/success.json';
    import { COMBINE_UNITS_MUTATION } from '~/graphql/mutations/units';
    import { GET_UNIT_QUERY } from '~/graphql/queries/units';
    import cloneDeep from 'lodash-es/cloneDeep';
    import successSoundData from '~/assets/sounds/success.mp3';

    library.add(faXmark, faArrowRight);

    export default {
        name: 'CombinePage',

        components: {
            Lottie,
        },

        mixins: [
            rfid,
            scale,
            sim,
        ],

        data() {
            return {
                isSuper: import.meta.env.MODE === 'development',

                step: 'scan',
                scannedUnits: [],

                // Statuses
                status: null,
                animationOptions: {
                    autoplay: false,
                    loop: true,
                    animationData,
                },
            };
        },

        computed: {
            totalWeight() {
                return this.scannedUnits.reduce((previousValue, currentValue) => previousValue + currentValue.stock, 0);
            },
            isInvalid() {
                if (this.scannedUnits.length === 0) {
                    return true;
                }

                const [ firstUnit ] = this.scannedUnits;
                return firstUnit.item.id !== this.inventoryItemUnit?.item?.id;
            },
        },

        watch: {
            status() {
                this.onStatusChange();
            },
            inventoryItemUnit: {
                deep: true,
                handler(newValue) {
                    if (newValue && this.step === 'scan') {
                        this.testStableWeight();
                    }
                },
            },
        },

        methods: {
            onAnimationLoaded(animation) {
                this.animation = animation;
                this.onStatusChange();
            },
            onStatusChange() {
                switch (this.status) {
                    case 'loading':
                        this.animation.loop = true;
                        this.animation.playSegments([0, 25], true);
                        break;
                    case 'success':
                        this.animation.loop = false;
                        this.animation.playSegments([44, 100], true);
                        break;
                    default:
                        this.animation.goToAndStop(0);
                }
            },
            onCancel() {
                this.scannedUnits = [];
                this.step = 'scan';
            },
            onNext() {
                switch (this.step) {
                    case 'scan':
                        this.step = 'combine';
                        break;
                    case 'combine':
                        this.onFinish();
                        break;
                }
            },
            async onWeightStable() {
                if (this.step === 'combine' || this.inventoryItemUnit?.item?.subunitNormal !== 'KG') {
                    return;
                }

                if (this.scannedUnits.length > 0 && this.scannedUnits[0].item.id !== this.inventoryItemUnit.item.id) {
                    return;
                }

                const ids = this.scannedUnits.map(u => u.id);
                if (!ids.includes(this.inventoryItemUnit.id)) {
                    this.scannedUnits.push(this.inventoryItemUnit);
                }
            },
            async onFinish() {
                const secondaryIds = this.scannedUnits.map(unit => unit.id).filter(id => id !== this.inventoryItemUnit.id);

                try {
                    await this.$apollo.mutate({
                        mutation: COMBINE_UNITS_MUTATION,
                        variables: {
                            primaryId: this.inventoryItemUnit.id,
                            secondaryIds,
                            stock: this.weight,
                        },
                        optimisticResponse: {
                            __typename: 'Mutation',
                            combineInventoryItemUnits: {
                                id: this.inventoryItemUnit.id,
                                epc: this.inventoryItemUnit.epc,
                                capacity: this.inventoryItemUnit.capacity,
                                item: this.inventoryItemUnit.item,
                                stock: this.totalWeight,
                                __typename: 'InventoryItemUnit',
                            },
                        },
                        update: (store, { data: { combineInventoryItemUnits } }) => {
                            const data = store.readQuery({
                                query: GET_UNIT_QUERY,
                                variables: {
                                    epc: this.inventoryItemUnit.epc,
                                },
                            });

                            store.writeQuery({
                                query: GET_UNIT_QUERY,
                                variables: {
                                    epc: this.inventoryItemUnit.epc,
                                },
                                data: {
                                    inventoryItemUnit: {
                                        ...(data?.inventoryItemUnit ? cloneDeep(data.inventoryItemUnit) : {}),
                                        ...combineInventoryItemUnits,
                                    },
                                },
                            });
                        },
                    });

                    this.status = 'success';

                    setTimeout(() => {
                        this.status = null;
                        this.step = 'scan';
                        this.scannedUnits = [];
                        this.$router.replace({ name: 'scale' });
                    }, 3000);

                    const sound = new Audio(successSoundData);
                    await sound.play();
                } catch (e) {
                    alert(e.toString());
                    this.status = null;
                }
            },
        },
    };
</script>

