import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {NgToastService} from "ng-angular-popup";
import {StoreUserService} from "../services/store-user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm:FormGroup;

  type:string="password";
  isText:boolean=false;
  eyeIcon:string="fa-eye-slash";
    hideShowPass(){
    this.isText=!this.isText;
    this.isText ? this.eyeIcon="fa-eye":this.eyeIcon="fa-eye-slash";
    this.isText ? this.type="text":this.type="password";
  }

  constructor(private fb:FormBuilder, private auth: AuthService, private router:Router, private toast: NgToastService, private store:StoreUserService){}
  ngOnInit(){
    this.loginForm=this.fb.group({
      username:['',Validators.required],
      password:['',Validators.required]
    });
  }

  private validateAllFormFields(formGroup:FormGroup){
    Object.keys(formGroup.controls).forEach(field=>{
      const control =formGroup.get(field);
      if(control instanceof FormControl){
        control.markAsDirty({onlySelf:true});
      }else if(control instanceof FormGroup){
        this.validateAllFormFields(control)
      }
    })
  }

  


onLogin() {
  if (this.loginForm.valid) {
    this.auth.loginUser(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('User logged in successfully:', response);
        
        this.toast.success({
          detail: 'Success',
          summary: 'Successfully logged in!',
          duration: 3000
        });

 
        setTimeout(() => {
          this.router.navigate(['Dashboard']);
        }, 3000);
      },
      error: (err) => {
        console.error('Error during login:', err);

        this.toast.error({
          detail: 'Error',
          summary: 'Login failed. Please check your credentials.',
          duration: 3000
        });
      }
    });
  } else {
    this.toast.warning({
      detail: 'Warning',
      summary: 'Please fill in all required fields.',
      duration: 3000
    });
  }
}

}

  
 


