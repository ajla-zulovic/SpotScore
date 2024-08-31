import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import{HttpClientModule} from '@angular/common/http';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';
import { FooterComponent } from './footer/footer.component';
import { SigninComponent } from './signin/signin.component';
import { LoginComponent } from './login/login.component';
import { OffersDetailsComponent } from './offers-details/offers-details.component';
import { NotificationComponent } from './notification/notification.component';
import { StarsComponent } from './stars/stars.component';
import { CommentsComponent } from './comments/comments.component';

const appRoute:Routes=[
  {path:'',redirectTo:'Home',pathMatch:'full'},
  {path:'Home',component:HomeComponent},
  {path:'Home/Offer/:id',component:HomeComponent},
  {path:'About',component:AboutComponent},
  {path:'Privacy',component:PrivacyComponent},
  {path:'Signup',component:SigninComponent},
  {path:'Login',component:LoginComponent},
  {path:'Offers/:id',component:OffersDetailsComponent},
  {path:'**',component:ErrorComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    PrivacyComponent,
    ErrorComponent,
    FooterComponent,
    SigninComponent,
    LoginComponent,
    OffersDetailsComponent,
    NotificationComponent,
    StarsComponent,
    CommentsComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoute)
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
