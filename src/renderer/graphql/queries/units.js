import { gql } from 'graphql-tag';
import { inventoryItemUnit } from '~/graphql/fragments/inventoryItemUnit';

export const GET_UNIT_QUERY = gql`
    query GetUnit($epc: String!) {
        inventoryItemUnit(epc: $epc) {
            ...inventoryItemUnit
        }
    }

    ${inventoryItemUnit}
`;
