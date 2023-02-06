import { gql } from 'graphql-tag';
import { inventoryItemUnit } from '~/graphql/fragments/inventoryItemUnit';

export const UPDATE_UNIT_STOCK_MUTATION = gql`
    mutation UpdateUnitStock($id: ID!, $stock: Float!) {
        updateInventoryItemUnitStock(pk: $id, stock: $stock) {
            ...inventoryItemUnit
        }
    }

    ${inventoryItemUnit}
`;

export const COMBINE_UNITS_MUTATION = gql`
    mutation CombineUnitsStock($primaryId: ID!, $secondaryIds: [ID!]!, $stock: Float!) {
        combineInventoryItemUnits(primaryPk: $primaryId, secondaryPks: $secondaryIds, stock: $stock) {
            ...inventoryItemUnit
        }
    }

    ${inventoryItemUnit}
`;

export const DELETE_UNIT_MUTATION = gql`
    mutation DeleteUnit($id: ID!) {
        deleteInventoryItemUnit(pk: $id) {
            success
        }
    }
`;
