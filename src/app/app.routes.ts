import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SingleCategoryComponent } from './pages/single-category/single-category.component';
import { SinglePostComponent } from './pages/single-post/single-post.component';
import { AboutComponent } from './pages/about/about.component';
import { TermsNConditionsComponent } from './pages/terms-n-conditions/terms-n-conditions.component';
import { ConatactUsComponent } from './pages/conatact-us/conatact-us.component';
import { LoginComponent } from './admin/auth/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CategoryComponent } from './admin/category/category.component';
import { PostsComponent } from './admin/posts/posts.component';
import { CratePostComponent } from './admin/crate-post/crate-post.component';
import { RegisterComponent } from './admin/auth/register/register.component';
import { UpdatePostComponent } from './admin/update-post/update-post.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category', component: SingleCategoryComponent },
  { path: 'blog/:id', component: SinglePostComponent },
  { path: 'about', component: AboutComponent },
  { path: 'term-conditions', component: TermsNConditionsComponent },
  { path: 'contact', component: ConatactUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'categories', component: CategoryComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'create-post', component: CratePostComponent },
  { path: 'edit-post/:id', component: UpdatePostComponent },
  { path: 'profile/:id', component: HomeComponent },
];
