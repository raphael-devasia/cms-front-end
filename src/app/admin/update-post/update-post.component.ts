// crate-post.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
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
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { UploadServiceService } from '../../services/upload-service.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularEditorModule,
  ],
  templateUrl: './update-post.component.html',
  styleUrl: './update-post.component.css',
})
export class UpdatePostComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imageContainer') imageContainer!: ElementRef;
  categories: any[] = [];
  permalink = '';
  imgSrc: string | null = './images/placeholder-image.jpg';
  postForm: FormGroup;
  content: string = ''; // To hold the content of the editor
  imageUrls: string[] = []; // Store image URLs for later use
  submitted = false;
  categoryName!: { category: string; _id: string };
  preURLSigned!: string;
  postId!: string;
  
  private userProfile = JSON.parse(localStorage.getItem('userProfile')!);
  private userId = this.userProfile.userId;
  private userService = inject(UserService);
  private router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private uploadService: UploadServiceService,
    private renderer: Renderer2,
    private toastr: ToastrService,
    private route: ActivatedRoute
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
    const postId = this.route.snapshot.paramMap.get('id');
    console.log('Post ID from route:', postId);
    this.postId = postId!;
    this.userService.getPostById(postId!).subscribe(
      (data: any) => {
        const post = data.data;
        this.postForm.patchValue({
          title: post.title,
          permalink: post.permalink,
          category: {
            category: post.category.category,
            categoryId: post.category._id,
          },
          content: post.content,
          excerpt: post.excerpt,
          image: post.image,
        });
        this.imgSrc = post.image;
        this.content = post.content;
        console.log('Post:', post.category);

        this.categoryName = {
          category: post.category.category,
          _id: post.category.categoryId,
        };
      },
      (error) => {
        console.error('Error fetching post:', error);
      }
    );
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
  onCategoryChange(event: Event): void {
    // Extract the selected option
    const selectElement = event.target as HTMLSelectElement;

    // Update the categoryName with the selected category
    const selectedCategory = this.postForm.value.category;
    if (selectedCategory) {
      this.categoryName = {
        category: selectedCategory.name,
        _id: selectedCategory._id,
      };
      console.log('Selected Category:', this.categoryName);
    }

    console.log('Selected Category:', this.categoryName);
  }

  onSubmit() {
    console.log(this.categoryName);

    this.submitted = true;
    let valid = this.isFormValidExceptImage();
    if (valid) {
      const postData: Post = {
        title: this.postForm.value.title,
        permalink: this.postForm.value.permalink,
        category: {
          category: this.categoryName.category,
          categoryId: this.categoryName._id,
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
      this.uploadService.updateBlogPost(postData, this.postId).subscribe(
        (res) => {
          // Show a success message
          this.toastr.success('Post updated successfully!', 'Success');
          console.log('Post updated successfully:', res);

          // Navigate to the /posts page
          this.router.navigate(['/posts']);
        },
        (error) => {
          // Show an error message
          this.toastr.error('Error updating post.', 'Error');
          console.error('Error updating post:', error);
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
  onCancel() {
    // Logic to reset the form or navigate away
    console.log('Post creation canceled');
    this.router.navigate(['/posts']); // Navigate to another page (like a list of posts)
    // OR you can reset the form if needed
    // this.postForm.reset();
  }
}
