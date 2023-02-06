import { gql } from 'graphql-tag';

export const inventoryItemUnit = gql`
    fragment inventoryItemUnit on InventoryItemUnit {
        id
        epc
        item {
            id
            name
            supplierVariant
            supplierPartNumber
            displayStock
            category {
                id
                name
            }
            supplier {
                id
                name
            }
            primaryUnitNormal
            subunitNormal
        }
        capacity
        stock
    }
`;
