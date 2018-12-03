import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

const uri = 'https://api.github.com/graphql';

const authLink = setContext((_, { headers }) => {
  // in a real app this would be an environment variable
  const token = '309f14201dd8518ff4af3d3750f4d1beb81447c6';
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
});

export function createApollo(httpLink: HttpLink) {
  return {
    link: authLink.concat(httpLink.create({ uri })),
    cache: new InMemoryCache()
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
