import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { UserListComponent } from './user-list.component';
import { UserComponent } from './user.component';

@NgModule({
  declarations: [AppComponent, UserListComponent, UserComponent],
  imports: [
    BrowserModule,
    GraphQLModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
