<template>
    <div class="flex h-full">
        <div class="w-[25rem] pr-8">
            <div class="bg-gray-200 p-8 h-full">
                <div v-if="rfidData && inventoryItemUnit && !$apollo.queries.inventoryItemUnit.loading">
                    <div class="text-2xl">
                        {{ inventoryItemUnit.item.name }}
                    </div>

                    <table class="w-full mt-4">
                        <tbody>
                            <tr>
                                <td class="font-bold">Supplier</td>
                                <td class="pl-3 text-right">{{ inventoryItemUnit.item.supplier.name }}</td>
                            </tr>

                            <tr>
                                <td class="font-bold">Code</td>
                                <td class="pl-3 text-right">{{ inventoryItemUnit.item.supplierPartNumber }}</td>
                            </tr>

                            <tr>
                                <td class="font-bold">Cap.</td>
                                <td class="pl-3 text-right">{{ inventoryItemUnit.capacity }} {{ inventoryItemUnit.item.subunitNormal }}</td>
                            </tr>

                            <tr>
                                <td class="font-bold">Stock</td>
                                <td class="pl-3 text-right">{{ inventoryItemUnit.stock }} {{ inventoryItemUnit.item.subunitNormal }}</td>
                            </tr>

                            <tr>
                                <td class="font-bold">Total Stock</td>
                                <td class="pl-3 text-right">{{ inventoryItemUnit.item.displayStock }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="isNearlyEmpty" class="mt-6">
                        <button
                            type="button"
                            class="btn flex items-center justify-center w-full text-center px-4 py-6"
                            @click.prevent="onEmptyBox"
                        >
                            <icon class="text-2xl" icon="trash" />
                            <span class="block text-lg ml-2">Empty Box</span>
                        </button>
                    </div>
                </div>

                <div v-else class="text-2xl">
                    No item loaded.
                </div>

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
                    <div v-if="weight <= 0" class="text-2xl mb-2">
                        Place box on scale.
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
    import { faTrash } from '@fortawesome/pro-solid-svg-icons/faTrash';
    import cloneDeep from 'lodash-es/cloneDeep';
    import { GET_UNIT_QUERY } from '~/graphql/queries/units';
    import { DELETE_UNIT_MUTATION, UPDATE_UNIT_STOCK_MUTATION } from '~/graphql/mutations/units';
    import rfid from '~/mixins/rfid';
    import scale from '~/mixins/scale';
    import sim from '~/mixins/sim';
    import Lottie from '~/components/Lottie.vue';
    import animationData from '~/animations/success.json';
    import successSoundData from '~/assets/sounds/success.mp3';

    library.add(faTrash);

    export default {
        name: 'ScalePage',

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

                submitted: false,

                // Simulation
                simulationStarted: false,
                simulate1: null,
                simulate2: null,
                simulate3: null,

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
            isNearlyEmpty() {
                return this.weight <= 2.0;
            },
        },

        watch: {
            status() {
                this.onStatusChange();
            },
            inventoryItemUnit(newValue) {
                if (newValue) {
                    this.testStableWeight();
                }
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
            onResetWeight() {
                this.submitted = false;
            },
            async onWeightStable() {
                if (this.inventoryItemUnit?.item?.subunitNormal !== 'KG' || this.submitted) {
                    return;
                }

                this.status = 'loading';
                this.submitted = true;

                try {
                    await this.$apollo.mutate({
                        mutation: UPDATE_UNIT_STOCK_MUTATION,
                        variables: {
                            id: this.inventoryItemUnit.id,
                            itemId: this.inventoryItemUnit.item.id,
                            stock: this.weight,
                        },
                        optimisticResponse: {
                            __typename: 'Mutation',
                            updateInventoryItemUnitStock: {
                                id: this.inventoryItemUnit.id,
                                epc: this.inventoryItemUnit.epc,
                                capacity: this.inventoryItemUnit.capacity,
                                item: this.inventoryItemUnit.item,
                                stock: this.weight,
                                __typename: 'InventoryItemUnit',
                            },
                        },
                        update: (store, { data: { updateInventoryItemUnitStock } }) => {
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
                                        ...updateInventoryItemUnitStock,
                                    },
                                },
                            });
                        },
                    });

                    this.status = 'success';

                    setTimeout(() => {
                        this.status = null;
                    }, 1500);

                    const sound = new Audio(successSoundData);
                    await sound.play();
                } catch (e) {
                    alert(e.toString());
                    this.status = null;
                }
            },
            async onEmptyBox() {
                if (!this.isNearlyEmpty) {
                    return;
                }

                this.status = 'loading';
                this.submitted = true;

                try {
                    const { data } = await this.$apollo.mutate({
                        mutation: DELETE_UNIT_MUTATION,
                        variables: {
                            id: this.inventoryItemUnit.id,
                        },
                    });

                    if (data?.deleteInventoryItemUnit?.success) {
                        this.status = 'success';
                        this.inventoryItemUnit = null;

                        setTimeout(() => {
                            this.status = null;
                        }, 1500);

                        const sound = new Audio(successSoundData);
                        await sound.play();
                    } else {
                        this.status = null;
                    }
                } catch (e) {
                    alert(e.toString());
                    this.status = null;
                }
            },
        },
    };
</script>

