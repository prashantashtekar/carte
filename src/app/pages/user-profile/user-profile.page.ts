import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";

import { AuthService } from '../../services/auth/auth.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit, OnDestroy {

  userProfileForm: FormGroup;

  userProfile: User = null;

  validation_messages = {
    firstName: [{ type: "required", message: "First name is required." }]
  };

  constructor(private router: Router, private authService: AuthService, private formBuilder: FormBuilder) {
    this.userProfileForm = this.formBuilder.group({
      email: [{ value: "", disabled: true }],
      firstName: ["", Validators.required],
      lastName: [""],
      phoneNumber: ["", Validators.required],
      address: [""]
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      console.log('current user: ', user);
      this.userProfile = user;
      this.setUserProfileForm();
    });
    //Old working
    // let userdata = this.authService.userDetails();
    // if (userdata != null) {
    //   this.authService.getUser(userdata.uid).subscribe((data: User) => {
    //     this.userProfile = data;
    //     this.setUserProfileForm();
    //   })
    // }

  }

  setUserProfileForm() {
    this.userProfileForm.controls['email'].setValue(this.userProfile.email);
    this.userProfileForm.controls['firstName'].setValue(this.userProfile.firstName);
    this.userProfileForm.controls['lastName'].setValue(this.userProfile.lastName);
    // this.userProfileForm.controls['phoneNumber'].setValue(this.userProfile.lastName);
    // this.userProfileForm.controls['address'].setValue(this.userProfile.lastName);
  }

  ngOnDestroy(): void { }

  navigateToHome() {
    this.router.navigateByUrl("/home");
  }

  updateUserProfile() {
    //Deep copy the form object
    const userFormData: User = Object.assign({}, this.userProfileForm.value);
    userFormData.uid = this.userProfile.uid;

    // Why do I need to do this?? Why does the 'disabled' property on the 
    // form control cause the email value to not exist??
    userFormData.email = this.userProfile.email;

    this.authService.updateUserDocumentInFirebase(userFormData)
    this.router.navigateByUrl("/home");
    this.userProfileForm.markAsPristine();
  }

}
