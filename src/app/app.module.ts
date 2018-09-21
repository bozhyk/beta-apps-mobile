import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SidebarModule } from 'ng-sidebar';

import { AppComponent } from './app.component';
import { AppListComponent } from './app-list/app-list.component';

import { AppTabsComponent } from './app-tabs/app-tabs.component';
import { RegisterComponent } from './register/register.component';
import { AppNavbarComponent } from './app-navbar/app-navbar.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './login/auth.service';
import { AppListService } from './app-list/app-list.service';
import { DeviceDetectService } from './app-list/device-detect.service';
import { InputContentService } from './app-navbar/input-content.service';
import { SafePipe } from './app-list/safe.pipe';




@NgModule({
  declarations: [
    AppComponent,
    AppListComponent,
    AppTabsComponent,
    RegisterComponent,
    LoginComponent,
    AppNavbarComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot(), 
    SidebarModule.forRoot(), 
    AppRoutingModule,
    InfiniteScrollModule
  ],
  providers: [AppListService, DeviceDetectService, AuthService, InputContentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
