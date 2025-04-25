import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {NgToastService} from "ng-angular-popup";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})

export class SignupComponent {
  constructor(private fb:FormBuilder, private auth:AuthService, private router:Router, private toast: NgToastService){}
  signupForm:FormGroup;
  type:string="password";
  isText:boolean=false;
  eyeIcon:string="fa-eye-slash";
    hideShowPass(){
    this.isText=!this.isText;
    this.isText ? this.eyeIcon="fa-eye":this.eyeIcon="fa-eye-slash";
    this.isText ? this.type="text":this.type="password";
  }
  ngOnInit(){
    this.signupForm=this.fb.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      email:['',Validators.required],
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


  onSignUp(){
    if(this.signupForm.valid)
    {
      console.log(this.signupForm.value);
      // send data to database
      this.auth.signUp(this.signupForm.value)
        .subscribe({
          next:(res)=>{
            this.signupForm.reset();
            this.toast.success({detail:"Success!", summary:res.message, duration:5000});
            this.router.navigate(['Login']);
          },
          error:(err)=>{
            this.toast.error({detail:"Error!", summary:err.error.message, duration:5000});
          }
        })
    }
    else{
      this.validateAllFormFields(this.signupForm);
    }
  }
}
