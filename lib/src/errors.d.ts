import { GraphQLError } from 'graphql';
export declare class ApolloError extends Error {
    message: string;
    graphQLErrors: GraphQLError[];
    networkError: Error;
    extraInfo: any;
    constructor({graphQLErrors, networkError, errorMessage, extraInfo}: {
        graphQLErrors?: GraphQLError[];
        networkError?: Error;
        errorMessage?: string;
        extraInfo?: any;
    });
    private generateErrorMessage();
}
