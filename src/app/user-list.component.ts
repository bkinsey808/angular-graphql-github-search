import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, debounceTime, shareReplay, tap } from 'rxjs/operators';

import gql from 'graphql-tag';

import { User, GithubUserSearch } from './types';

const ITEMS_PER_PAGE = 5;

const getQuery = (options: { before?: string; after?: string } = {}) => {
  const { before, after } = options;
  const beforeOrAfter = before
    ? `, before: "${before}"`
    : after
    ? `, after: "${after}"`
    : '';
  return gql`
    query UserSearch($searchString: String!) {
      search(type: USER, query: $searchString, last: ${ITEMS_PER_PAGE}${beforeOrAfter}) {
        pageInfo {
          startCursor
          hasNextPage
          hasPreviousPage
          endCursor
        }
        userCount
        nodes {
          ... on User {
            login
            name
            location
            bio
            avatarUrl
            repositories {
              totalCount
            }
            followers {
              totalCount
            }
          }
        }
      }
    }
  `;
};

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="(userCount$ | async) > 0">
      User Count: {{ userCount$ | async }}<br />
      Page: {{ currentPage$ | async }} of {{ totalPages$ | async }}<br />
      <button
        (click)="firstPage()"
        [disabled]="!(hasPrevPage$ | async) || (loading$ | async)"
      >
        First Page
      </button>
      <button
        (click)="prevPage()"
        [disabled]="!(hasPrevPage$ | async) || (loading$ | async)"
      >
        Prev Page
      </button>
      <button
        (click)="nextPage()"
        [disabled]="!(hasNextPage$ | async) || (loading$ | async)"
      >
        Next Page
      </button>
    </div>
    <div *ngIf="!(loading$ | async)">
      <app-user *ngFor="let user of (users$ | async)" [user]="user"></app-user>
    </div>
  `
})
export class UserListComponent {
  @Input()
  set searchString(newSearchString: string) {
    if (newSearchString !== this._searchString$.getValue()) {
      this._searchString$.next(newSearchString);
      this._beforeOrAfter$.next({});
      this.currentPage$.next(1);
    }
  }
  get searchString() {
    return this._searchString$.getValue();
  }

  githubUserSearchResponse$: Observable<GithubUserSearch>;
  users$: Observable<User[]>;
  userCount$: Observable<number>;
  hasNextPage$: Observable<boolean>;
  hasPrevPage$: Observable<boolean>;
  startCursor$: Observable<string>;
  endCursor$: Observable<string>;
  totalPages$: Observable<number>;

  currentPage$ = new BehaviorSubject<number>(1);
  loading$ = new BehaviorSubject<boolean>(true);

  private _searchString$ = new BehaviorSubject<string>('');
  private _beforeOrAfter$ = new BehaviorSubject<{}>({});

  constructor(private apollo: Apollo) {
    this.githubUserSearchResponse$ = this.getGithubUserSearchResponse$();
    this.users$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.nodes) || [])
    );
    this.userCount$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.userCount) || 0)
    );
    this.hasNextPage$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.pageInfo.hasNextPage) || false)
    );
    this.hasPrevPage$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.pageInfo.hasPreviousPage) || false)
    );
    this.startCursor$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.pageInfo.startCursor) || '')
    );
    this.endCursor$ = this.githubUserSearchResponse$.pipe(
      map(r => (r && r.search && r.search.pageInfo.endCursor) || '')
    );
    this.totalPages$ = this.userCount$.pipe(
      map(userCount => Math.ceil(userCount / ITEMS_PER_PAGE))
    );
  }

  getGithubUserSearchResponse$(): Observable<GithubUserSearch> {
    return combineLatest(this._searchString$, this._beforeOrAfter$).pipe(
      debounceTime(200),
      switchMap(([searchString, beforeOrAfter]) => {
        this.loading$.next(true);
        return this.apollo
          .watchQuery<GithubUserSearch>({
            variables: { searchString },
            query: getQuery(beforeOrAfter)
          })
          .valueChanges.pipe(
            tap(r => this.loading$.next(r.loading)),
            map(r => r.data)
          );
      }),
      shareReplay(1)
    );
  }

  firstPage() {
    this.startCursor$
      .subscribe(_startCursor => {
        this._beforeOrAfter$.next({});
        this.currentPage$.next(1);
      })
      .unsubscribe();
  }

  prevPage() {
    this.startCursor$
      .subscribe(startCursor => {
        this._beforeOrAfter$.next({ before: startCursor });
        this.currentPage$.next(this.currentPage$.getValue() - 1);
      })
      .unsubscribe();
  }

  nextPage() {
    this.endCursor$
      .subscribe(endCursor => {
        this._beforeOrAfter$.next({ after: endCursor });
        this.currentPage$.next(this.currentPage$.getValue() + 1);
      })
      .unsubscribe();
  }
}
