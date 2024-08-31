import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent{

  type:string="password";
  isText:boolean=false;
  eyeIcon:string="fa-eye-slash";
  hideShowPass(){
    this.isText=!this.isText;
    this.isText ? this.eyeIcon="fa-eye":this.eyeIcon="fa-eye-slash";
    this.isText ? this.type="text":this.type="password";
  }
  signupForm:FormGroup;
  constructor(private fb:FormBuilder){}
  ngOnInit(){
    this.signupForm=this.fb.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      email:['',Validators.required],
      username:['',Validators.required],
      password:['',Validators.required]
    });
  }

  onSubmit(){
    if(this.signupForm.valid)
    {
      // send data to database
      console.log(this.signupForm.value);
    }
    else{
      // console.log("Form is not valid");
      this.validateAllFormFields(this.signupForm);
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
