import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  type:string="password";
  isText:boolean=false;
  eyeIcon:string="fa-eye-slash";
  loginForm:FormGroup;
  hideShowPass(){
    this.isText=!this.isText;
    this.isText ? this.eyeIcon="fa-eye":this.eyeIcon="fa-eye-slash";
    this.isText ? this.type="text":this.type="password";
  }
  constructor(private fb:FormBuilder){}
  ngOnInit(){
    this.loginForm=this.fb.group({
      username:['',Validators.required],
      password:['',Validators.required]
    });
  }

  onSubmit(){
    if(this.loginForm.valid)
    {
      // send data to database
      console.log(this.loginForm.value);
    }
    else{
      // console.log("Form is not valid");
      this.validateAllFormFields(this.loginForm);
      alert("Your form is invalid")
    }
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
}
