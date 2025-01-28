// crate-post.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AngularEditorConfig,
  AngularEditorModule,
  UploadResponse,
} from '@kolkov/angular-editor';
import { Post } from '../../models/post';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { UploadServiceService } from '../../services/upload-service.service';
import { UserService } from '../../services/user.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';


@Component({
  selector: 'app-crate-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,AdminNavbarComponent
  ],
  templateUrl: './crate-post.component.html',
  styleUrls: ['./crate-post.component.css'],
})
export class CratePostComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageContainer') imageContainer!: ElementRef;
  categories: any[] = [];
  permalink = '';
  imgSrc: string | null =
    'https://cms-images-project.s3.eu-north-1.amazonaws.com/uploads/1737996539270_placeholder-image.jpg';
  postForm: FormGroup;
  content: string = ''; // To hold the content of the editor
  imageUrls: string[] = []; // Store image URLs for later use
  submitted = false;
  isLoading: boolean = false;
  preURLSigned!: string;
  private userProfile = JSON.parse(localStorage.getItem('userProfile')!);
  private userId = this.userProfile.userId;
  private userService = inject(UserService);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private uploadService: UploadServiceService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]+$/),
          Validators.minLength(5),
        ],
      ],
      permalink: [''],
      category: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      excerpt: ['', [Validators.required, Validators.minLength(10)]],
      image: ['', [Validators.required]],
      userId: [this.userId],
    });
  }

  ngOnInit() {
    this.getCategories();
  }

  // Function to fetch categories
  getCategories() {
    this.userService.getCategories().subscribe(
      (data: any) => {
        this.categories = data.data;
        console.log(this.categories);
      },
      (error) => {
        this.toastr.error('Failed to fetch categories');
      }
    );
  }

  // Handle image upload and get S3 URL
  onImageUpload(event: any): void {
    const files = event.target.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    this.http
      .post<{ url: string }[]>('http://your-backend-url/upload', formData)
      .subscribe((response) => {
        // Assuming backend returns an array of image URLs
        response.forEach((image) => {
          this.imageUrls.push(image.url);
        });

        // Replace content with the image URLs (you can add logic to replace image tags in content)
        this.addImagesToContent();
      });
  }

  getSanitizedContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this.content);
  }

  removeImage() {
    this.imgSrc = null;
    this.postForm.get('image')?.setValue(null); // Clear the image field
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the file input
    }
  }

  // Add image URLs to content (this would be done dynamically as well)
  addImagesToContent(): void {
    this.imageUrls.forEach((url) => {
      const imageTag = `<img src="${url}" alt="Image">`;
      this.content += imageTag; // Append the image to the content
    });
  }

  onTitleChanged(event: any) {
    const title = event.target.value;
    this.permalink = title.toLowerCase().replace(/\s/g, '-');
  }

  showPreview(event: any) {
    const file = event.target.files[0];
    this.isLoading = true; // Start loading

    this.imgSrc = file;
    if (file) {
      // Step 1: Generate the presigned URL from the backend
      this.uploadService.generatePresignedUrl(file.name, file.type).subscribe(
        (data) => {
          console.log('Presigned URL:', data.presignedUrl);

          this.preURLSigned = data.presignedUrl; // Store the presigned URL

          // Step 2: Upload the file to S3 using the presigned URL
          this.uploadService
            .uploadFileToS3(data.presignedUrl, file, data.fileUrl)
            .subscribe(
              (fileUrl: string) => {
                console.log('File uploaded to S3. File URL:', fileUrl);

                console.log('before', this.imgSrc);

                this.imgSrc = fileUrl; // Update the image source for preview
                console.log('after', this.imgSrc);
                this.isLoading = false; // Stop loading
              },
              (error) => {
                console.error('Error uploading file to S3:', error);
              }
            );
        },
        (error) => {
          console.error('Error generating presigned URL:', error);
        }
      );
    } else {
      console.error('No file selected');
    }
  }

  setImageContent(url: string, fileName: string) {
    const tempImageId = 'uploadedImage'; // Generate a unique ID if necessary
    const imgElement = this.renderer.createElement('img');
    this.renderer.setAttribute(imgElement, 'src', url);
    this.renderer.setAttribute(imgElement, 'alt', fileName);
    this.renderer.setAttribute(imgElement, 'id', tempImageId);

    // Append the image element to the container
    this.renderer.appendChild(this.imageContainer.nativeElement, imgElement);
  }

  // editorConfig: AngularEditorConfig = {
  //   editable: true,
  //   uploadWithCredentials: false, // Ensure credentials are not included unless needed
  //   sanitize: false, // Keep HTML content intact; avoid sanitizing if not necessary
  //   customClasses: [],
  //   spellcheck: true,
  //   height: '300px',
  //   minHeight: '200px',
  //   placeholder: 'Enter text here...',
  //   translate: 'no',
  //   defaultParagraphSeparator: 'p',
  //   defaultFontName: 'Arial',
  //   toolbarPosition: 'top',
  //   fonts: [
  //     { class: 'arial', name: 'Arial' },
  //     { class: 'times-new-roman', name: 'Times New Roman' },
  //     { class: 'calibri', name: 'Calibri' },
  //   ],
  //   upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
  //     console.log('Uploading file to S3...');

  //     return new Observable((observer) => {
  //       if (file) {
  //         // Step 1: Generate the presigned URL from the backend
  //         this.uploadService
  //           .generatePresignedUrl(file.name, file.type)
  //           .subscribe(
  //             (data) => {
  //               console.log('Presigned URL:', data.presignedUrl);

  //               this.preURLSigned = data.presignedUrl; // Store the presigned URL

  //               // Step 2: Upload the file to S3 using the presigned URL
  //               this.uploadService
  //                 .uploadFileToS3(data.presignedUrl, file, data.fileUrl)
  //                 .subscribe(
  //                   () => {
  //                     console.log('File uploaded to S3 successfully.');
  //                     // Return the file URL to the observer
  //                     observer.next({
  //                       type: HttpEventType.Response,
  //                       body: { link: data.fileUrl } as UploadResponse,
  //                     });
  //                     observer.complete();
  //                   },
  //                   (error) => {
  //                     console.error('Error uploading file to S3:', error);
  //                     observer.error(error);
  //                   }
  //                 );
  //             },
  //             (error) => {
  //               console.error('Error generating presigned URL:', error);
  //               observer.error(error);
  //             }
  //           );
  //       } else {
  //         console.error('No file selected');
  //         observer.error('No file selected');
  //       }
  //     });
  //   },
  // };

  editorConfig: AngularEditorConfig = {
    editable: true,
    uploadWithCredentials: false, // Ensure credentials are not included unless needed
    sanitize: false, // Keep HTML content intact; avoid sanitizing if not necessary
    customClasses: [],
    spellcheck: true,
    height: '300px',
    minHeight: '200px',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarPosition: 'top',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
    ],
    upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
      console.log('Uploading file to S3...');

      return new Observable((observer) => {
        if (file) {
          // Step 1: Generate the presigned URL from the backend
          this.uploadService
            .generatePresignedUrl(file.name, file.type)
            .subscribe(
              (data) => {
                console.log('Presigned URL:', data.presignedUrl);

                this.preURLSigned = data.presignedUrl; // Store the presigned URL

                // Step 2: Upload the file to S3 using the presigned URL
                this.uploadService
                  .uploadFileToS3(data.presignedUrl, file, data.fileUrl)
                  .subscribe(
                    () => {
                      console.log('File uploaded to S3 successfully.');
                      // Create a valid HttpResponse object
                      const httpResponse = new HttpResponse<UploadResponse>({
                        body: { imageUrl: data.fileUrl },
                        status: 200,
                        statusText: 'OK',
                        url: data.fileUrl,
                      });
                      // Return the file URL to the observer
                      observer.next(httpResponse);
                      observer.complete();
                    },
                    (error) => {
                      console.error('Error uploading file to S3:', error);
                      observer.error(error);
                    }
                  );
              },
              (error) => {
                console.error('Error generating presigned URL:', error);
                observer.error(error);
              }
            );
        } else {
          console.error('No file selected');
          observer.error('No file selected');
        }
      });
    },
  };

  get fc() {
    return this.postForm.controls;
  }

  shouldShowError(fieldName: string, errorType: string): boolean {
    const field = this.fc[fieldName];
    return field.errors?.[errorType] && (field.dirty || field.touched);
  }

  onSubmit() {
    this.submitted = true;
    let valid = this.isFormValidExceptImage();
    if (valid) {
      console.log(this.postForm.value.category);
      const postData: Post = {
        title: this.postForm.value.title,
        permalink: this.postForm.value.permalink,
        category: {
          category: this.postForm.value.category.name,
          categoryId: this.postForm.value.category._id,
        },
        content: this.postForm.value.content,
        image: this.imgSrc as string,
        excerpt: this.postForm.value.excerpt,
        isFeatured: false,
        views: 0,
        status: 'new',
        createdAt: new Date(),
        userId: this.userId,
      };
      console.log(postData);
      this.uploadService.postBlogPost(postData).subscribe(
        (res) => {
          // Show a success message
          this.toastr.success('Post Published successfully!', 'Success');

          // Navigate to the /posts page
          this.router.navigate(['/posts']);
        },
        (error) => {
          // Show an error message
          this.toastr.error('Error Publishing post.', 'Error');
        }
      );
    }
  }

  isFormValidExceptImage(): boolean {
    const controls = this.postForm.controls;
    for (const name in controls) {
      if (controls[name].invalid && name !== 'image') {
        return false;
      }
    }
    return true;
  }
}
