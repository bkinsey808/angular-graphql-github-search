import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { User } from './types';

@Component({
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      login: {{ user.login }}<br />
      name: {{ user.name }}<br />
      followers: {{ user.followers.totalCount }}<br />
      repositories: {{ user.repositories.totalCount }}<br />
      location: {{ user.location }}<br />
      bio: {{ user.bio }}<br />
      avatar: <img width="50" height="50" src="{{ user.avatarUrl }}" /><br />
      github profile:
      <a target="_blank" href="https://github.com/{{ user.login }}"
        >https://github.com/{{ user.login }}</a
      >
    </div>
  `,
  styles: [
    `
      div {
        border: 1px solid lightgray;
        margin-top: 5px;
        margin-bottom: 10px;
        margin-right: 10px;
        padding: 10px;
      }
    `
  ]
})
export class UserComponent {
  @Input() user: User;
}
