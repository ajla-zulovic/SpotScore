import {importProvidersFrom, NgModule} from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormsModule,FormsModule  } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptors
} from "@angular/common/http";
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about/about.component';
import { FooterComponent } from './footer/footer.component'
import { NgToastModule } from 'ng-angular-popup';
import { DashboardComponent } from './dashboard/dashboard.component';
import {authGuard} from "./guards/auth.guard";
import {tokenInterceptor} from "./interceptors/token.interceptor";
import { ProfileComponent } from './profile/profile.component';
import { RequestsComponent } from './requests/requests.component';
import { PreviewRequestComponent } from './preview-request/preview-request.component';
import { ServiceDetailComponent } from './service-detail/service-detail.component';
import { RatingStarsComponent } from './rating-stars/rating-stars.component';
import { NewServiceComponent } from './new-service/new-service.component';
import { NewStateComponent } from './new-state/new-state.component';
import { NewCityComponent } from './new-city/new-city.component';
import { NewGenreComponent } from './new-genre/new-genre.component';
import { MessagePopupComponent } from './message-popup/message-popup.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}


const appRoute:Routes=[
  {path:'',redirectTo:'Home',pathMatch:'full'},
  // { path: '', component: HomeComponent },
  {path:'Home', component:HomeComponent},
  {path:'service/:id',component:ServiceDetailComponent},
  {path:'Signup', component:SignupComponent},
  {path:'Login', component:LoginComponent},
  {path:'Privacy', component:PrivacyComponent},
  {path:'About', component:AboutComponent},
  {path:'Dashboard', component:DashboardComponent, canActivate:[authGuard]},
]


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SignupComponent,
    PrivacyComponent,
    AboutComponent,
    FooterComponent,
    DashboardComponent,
    ProfileComponent,
    RequestsComponent,
    PreviewRequestComponent,
    ServiceDetailComponent,
    RatingStarsComponent,
    NewServiceComponent,
    NewStateComponent,
    NewCityComponent,
    NewGenreComponent,
    MessagePopupComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoute),
    HttpClientModule,
    NgToastModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    importProvidersFrom(HttpClientModule),

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
