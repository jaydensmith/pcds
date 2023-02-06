import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
import { createApolloProvider } from '@vue/apollo-option';

console.log(`Init HttpLink with uri: ${import.meta.env.VITE_API_URL}`);

// HTTP connection to the API
const httpLink = createHttpLink({
    // You should use an absolute URL here
    uri: import.meta.env.VITE_API_URL,
    headers: {
        'X-API-Key': import.meta.env.VITE_API_KEY,
    },
});

// Cache implementation
const cache = new InMemoryCache({
    typePolicies: {
        Mutation: {
            fields: {
                updateInventoryItemUnit: {
                    merge(existing = [], incoming) {
                        return incoming;
                    },
                },
            },
        },
    },
});

// Create the apollo client
const defaultClient = new ApolloClient({
    link: httpLink,
    cache,
});

export default createApolloProvider({
    defaultClient,
});
