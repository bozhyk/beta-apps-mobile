import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AppListComponent } from './app-list/app-list.component';
import { AppListService } from './app-list/app-list.service';
import { DeviceDetectService } from './app-list/device-detect.service';
import { AppNavbarComponent } from './app-navbar/app-navbar.component';
import { AppTabsComponent } from './app-tabs/app-tabs.component';

@NgModule({
  declarations: [
    AppComponent,
    AppListComponent,
    AppNavbarComponent,
    AppTabsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [AppListService, DeviceDetectService],
  bootstrap: [AppComponent]
})
export class AppModule { }
